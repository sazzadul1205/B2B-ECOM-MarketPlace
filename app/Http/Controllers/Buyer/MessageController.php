<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use App\Models\Rfq;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Events\MessageSent;

class MessageController extends Controller
{
    /**
     * Display a listing of conversations.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Get all unique conversations (grouped by other user and RFQ)
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver', 'rfq'])
            ->get()
            ->groupBy(function ($message) use ($userId) {
                // Group by combination of other user ID and RFQ ID
                $otherUserId = $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
                return $otherUserId . '-' . ($message->rfq_id ?? 'general');
            });

        $conversationList = [];

        foreach ($conversations as $key => $messages) {
            $lastMessage = $messages->sortByDesc('created_at')->first();
            $otherUser = $lastMessage->sender_id == $userId ? $lastMessage->receiver : $lastMessage->sender;

            // Count unread messages in this conversation
            $unreadCount = $messages->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $conversationList[] = [
                'key' => $key,
                'other_user' => $otherUser,
                'other_user_id' => $otherUser->id,
                'rfq' => $lastMessage->rfq,
                'rfq_id' => $lastMessage->rfq_id,
                'last_message' => $lastMessage->message,
                'last_message_time' => $lastMessage->created_at,
                'last_message_sender' => $lastMessage->sender_id == $userId ? 'You' : $otherUser->name,
                'unread_count' => $unreadCount,
            ];
        }

        // Sort by last message time
        usort($conversationList, function ($a, $b) {
            return $b['last_message_time'] <=> $a['last_message_time'];
        });

        // Get RFQs for new message dropdown
        $rfqs = Rfq::where('buyer_id', $userId)
            ->whereIn('status', ['open', 'closed'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Buyer/Messages/Index', compact('conversationList', 'rfqs'));
    }

    /**
     * Display conversation with a specific user and optionally for a specific RFQ.
     */
    public function conversation(Request $request, $userId, $rfqId = null)
    {
        $currentUserId = Auth::id();

        // Check if other user exists
        $otherUser = User::findOrFail($userId);

        // Build query for messages between these two users
        $query = Message::where(function ($q) use ($currentUserId, $userId) {
            $q->where('sender_id', $currentUserId)
                ->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($currentUserId, $userId) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', $currentUserId);
        });

        // Filter by RFQ if specified
        if ($rfqId) {
            $query->where('rfq_id', $rfqId);
            $rfq = Rfq::findOrFail($rfqId);

            // Verify user has access to this RFQ
            if ($rfq->buyer_id !== $currentUserId && $rfq->quotes()->where('supplier_id', $currentUserId)->doesntExist()) {
                abort(403);
            }
        } else {
            $query->whereNull('rfq_id');
            $rfq = null;
        }

        // Get messages with pagination
        $messages = $query->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // Mark messages as read
        Message::where('receiver_id', $currentUserId)
            ->where('sender_id', $userId)
            ->when($rfqId, function ($q) use ($rfqId) {
                return $q->where('rfq_id', $rfqId);
            }, function ($q) {
                return $q->whereNull('rfq_id');
            })
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Get RFQs for context (if any)
        $contextRfqs = [];
        if ($otherUser->isSupplier()) {
            // If other user is supplier, get RFQs where they've quoted
            $contextRfqs = Rfq::where('buyer_id', $currentUserId)
                ->whereHas('quotes', function ($q) use ($userId) {
                    $q->where('supplier_id', $userId);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // If other user is buyer, get RFQs they've created that this supplier quoted on
            $contextRfqs = Rfq::where('buyer_id', $userId)
                ->whereHas('quotes', function ($q) use ($currentUserId) {
                    $q->where('supplier_id', $currentUserId);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Buyer/Messages/Conversation', compact('messages', 'otherUser', 'rfq', 'contextRfqs'));
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
            'message' => 'required|string|max:5000',
        ]);

        // Verify user can message this receiver (they have a business relationship)
        $this->authorizeMessaging(Auth::id(), $validated['receiver_id'], $validated['rfq_id'] ?? null);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'rfq_id' => $validated['rfq_id'] ?? null,
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        // Load relationships for real-time updates
        $message->load(['sender', 'receiver']);
        if ($message->rfq_id) {
            $message->load('rfq');
        }

        broadcast(new MessageSent($message))->toOthers();

        // Broadcast event for real-time messaging if using WebSockets
        // broadcast(new NewMessage($message))->toOthers();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'html' => view('buyer.messages.partials.message', ['message' => $message])->render()
            ]);
        }

        return back()->with('success', 'Message sent successfully.');
    }

    /**
     * Alias for store() to support legacy route name.
     */
    public function send(Request $request)
    {
        return $this->store($request);
    }

    /**
     * Reply to a conversation (AJAX endpoint).
     */
    public function reply(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
            'message' => 'required|string|max:5000',
        ]);

        // Verify user can message this receiver
        $this->authorizeMessaging(Auth::id(), $validated['receiver_id'], $validated['rfq_id'] ?? null);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'rfq_id' => $validated['rfq_id'] ?? null,
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        $message->load(['sender', 'receiver']);
        if ($message->rfq_id) {
            $message->load('rfq');
        }

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'body' => $message->message,
                'created_at' => $message->created_at->diffForHumans(),
                'sender_name' => $message->sender->name,
                'is_me' => true,
            ],
            'html' => view('buyer.messages.partials.message', ['message' => $message])->render()
        ]);
    }

    /**
     * Get unread message count (AJAX endpoint).
     */
    public function unreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Get recent messages for dropdown (AJAX endpoint).
     */
    public function recent()
    {
        $messages = Message::where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->with(['sender', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $html = view('buyer.messages.partials.recent', compact('messages'))->render();

        return response()->json([
            'html' => $html,
            'count' => $messages->count()
        ]);
    }

    /**
     * Mark a specific message as read.
     */
    public function markAsRead(Message $message)
    {
        // Ensure user is the receiver
        if ($message->receiver_id !== Auth::id()) {
            abort(403);
        }

        $message->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all messages in a conversation as read.
     */
    public function markConversationAsRead(Request $request)
    {
        $request->validate([
            'other_user_id' => 'required|exists:users,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
        ]);

        $query = Message::where('receiver_id', Auth::id())
            ->where('sender_id', $request->other_user_id);

        if ($request->filled('rfq_id')) {
            $query->where('rfq_id', $request->rfq_id);
        } else {
            $query->whereNull('rfq_id');
        }

        $updated = $query->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'marked_count' => $updated
        ]);
    }

    /**
     * Get conversation list for AJAX refresh.
     */
    public function getConversations()
    {
        $userId = Auth::id();

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver', 'rfq'])
            ->get()
            ->groupBy(function ($message) use ($userId) {
                $otherUserId = $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
                return $otherUserId . '-' . ($message->rfq_id ?? 'general');
            });

        $conversationList = [];

        foreach ($conversations as $messages) {
            $lastMessage = $messages->sortByDesc('created_at')->first();
            $otherUser = $lastMessage->sender_id == $userId ? $lastMessage->receiver : $lastMessage->sender;

            $unreadCount = $messages->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $conversationList[] = [
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                ],
                'rfq' => $lastMessage->rfq ? [
                    'id' => $lastMessage->rfq->id,
                    'title' => $lastMessage->rfq->title,
                ] : null,
                'last_message' => substr($lastMessage->message, 0, 50) . (strlen($lastMessage->message) > 50 ? '...' : ''),
                'last_message_time' => $lastMessage->created_at->diffForHumans(),
                'unread_count' => $unreadCount,
            ];
        }

        return response()->json($conversationList);
    }

    /**
     * Search messages.
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $searchTerm = $request->query;

        $messages = Message::where(function ($q) use ($searchTerm) {
            $q->where('sender_id', Auth::id())
                ->orWhere('receiver_id', Auth::id());
        })
            ->where('message', 'like', "%{$searchTerm}%")
            ->with(['sender', 'receiver', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $html = view('buyer.messages.partials.search-results', compact('messages'))->render();

        return response()->json([
            'html' => $html,
            'count' => $messages->count()
        ]);
    }

    /**
     * Delete a conversation.
     */
    public function deleteConversation(Request $request)
    {
        $request->validate([
            'other_user_id' => 'required|exists:users,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
        ]);

        $query = Message::where(function ($q) use ($request) {
            $q->where('sender_id', Auth::id())
                ->where('receiver_id', $request->other_user_id);
        })->orWhere(function ($q) use ($request) {
            $q->where('sender_id', $request->other_user_id)
                ->where('receiver_id', Auth::id());
        });

        if ($request->filled('rfq_id')) {
            $query->where('rfq_id', $request->rfq_id);
        } else {
            $query->whereNull('rfq_id');
        }

        $deleted = $query->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $deleted
        ]);
    }

    /**
     * Authorize messaging between users.
     */
    private function authorizeMessaging($senderId, $receiverId, $rfqId = null)
    {
        // Users cannot message themselves
        if ($senderId === $receiverId) {
            abort(403, 'Cannot send message to yourself.');
        }

        // If RFQ is specified, verify both users are involved
        if ($rfqId) {
            $rfq = Rfq::findOrFail($rfqId);

            // Sender must be either the buyer or a supplier who quoted
            $isSenderInvolved = $rfq->buyer_id === $senderId ||
                $rfq->quotes()->where('supplier_id', $senderId)->exists();

            // Receiver must be either the buyer or a supplier who quoted
            $isReceiverInvolved = $rfq->buyer_id === $receiverId ||
                $rfq->quotes()->where('supplier_id', $receiverId)->exists();

            if (!$isSenderInvolved || !$isReceiverInvolved) {
                abort(403, 'You are not authorized to message about this RFQ.');
            }
        } else {
            // For general messages, check if they have a business relationship
            $hasBusinessRelationship = $this->checkBusinessRelationship($senderId, $receiverId);

            if (!$hasBusinessRelationship) {
                abort(403, 'You can only message users you have a business relationship with.');
            }
        }
    }

    /**
     * Check if two users have a business relationship.
     */
    private function checkBusinessRelationship($userId1, $userId2)
    {
        // Check if they have any RFQs in common (one as buyer, other as supplier)
        $commonRfqs = Rfq::where('buyer_id', $userId1)
            ->whereHas('quotes', function ($q) use ($userId2) {
                $q->where('supplier_id', $userId2);
            })
            ->exists();

        if ($commonRfqs) {
            return true;
        }

        // Check reverse (user2 as buyer, user1 as supplier)
        $commonRfqsReverse = Rfq::where('buyer_id', $userId2)
            ->whereHas('quotes', function ($q) use ($userId1) {
                $q->where('supplier_id', $userId1);
            })
            ->exists();

        if ($commonRfqsReverse) {
            return true;
        }

        // Check if they have any orders together
        $commonOrders = Order::where('buyer_id', $userId1)
            ->where('supplier_id', $userId2)
            ->exists();

        if ($commonOrders) {
            return true;
        }

        $commonOrdersReverse = Order::where('buyer_id', $userId2)
            ->where('supplier_id', $userId1)
            ->exists();

        return $commonOrdersReverse;
    }

    /**
     * Get conversation messages for AJAX.
     */
    public function getConversationMessages(Request $request)
    {
        $userId = Auth::id();
        $otherUserId = $request->user_id;
        $rfqId = $request->rfq_id;

        $query = Message::where(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', $otherUserId);
        })->orWhere(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $otherUserId)
                ->where('receiver_id', $userId);
        });

        if ($rfqId) {
            $query->where('rfq_id', $rfqId);
        } else {
            $query->whereNull('rfq_id');
        }

        $messages = $query->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages as read
        Message::where('receiver_id', $userId)
            ->where('sender_id', $otherUserId)
            ->when($rfqId, function ($q) use ($rfqId) {
                return $q->where('rfq_id', $rfqId);
            }, function ($q) {
                return $q->whereNull('rfq_id');
            })
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }
}
