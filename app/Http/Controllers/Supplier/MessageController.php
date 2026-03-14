<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Rfq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of conversations.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get all unique conversations (grouped by the other user)
        $conversations = $this->getConversations($user->id);

        // Get selected conversation if any
        $selectedConversation = null;
        $messages = collect();
        $otherUser = null;

        if ($request->has('user') || $request->has('rfq')) {
            $otherUserId = $request->user;
            $rfqId = $request->rfq;

            if ($otherUserId) {
                $otherUser = User::findOrFail($otherUserId);
                $messages = Message::where(function ($query) use ($user, $otherUserId) {
                    $query->where('sender_id', $user->id)
                        ->where('receiver_id', $otherUserId);
                })->orWhere(function ($query) use ($user, $otherUserId) {
                    $query->where('sender_id', $otherUserId)
                        ->where('receiver_id', $user->id);
                })
                    ->with(['sender', 'receiver'])
                    ->orderBy('created_at', 'asc')
                    ->get();

                // Mark messages as read
                Message::where('sender_id', $otherUserId)
                    ->where('receiver_id', $user->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                $selectedConversation = [
                    'user' => $otherUser,
                    'rfq' => null,
                ];
            } elseif ($rfqId) {
                $rfq = Rfq::with('buyer')->findOrFail($rfqId);
                $otherUser = $rfq->buyer;

                $messages = Message::where('rfq_id', $rfqId)
                    ->where(function ($query) use ($user, $otherUser) {
                        $query->where('sender_id', $user->id)
                            ->where('receiver_id', $otherUser->id);
                    })->orWhere(function ($query) use ($user, $otherUser) {
                        $query->where('sender_id', $otherUser->id)
                            ->where('receiver_id', $user->id);
                    })
                    ->with(['sender', 'receiver'])
                    ->orderBy('created_at', 'asc')
                    ->get();

                // Mark messages as read
                Message::where('sender_id', $otherUser->id)
                    ->where('receiver_id', $user->id)
                    ->where('rfq_id', $rfqId)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                $selectedConversation = [
                    'user' => $otherUser,
                    'rfq' => $rfq,
                ];
            }
        }

        return Inertia::render('Supplier/Messages/Index', compact(
            'conversations',
            'selectedConversation',
            'messages',
            'otherUser'
        ));
    }

    /**
     * Display conversation with specific buyer.
     *
     * @param  int  $userId
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function show($userId, Request $request)
    {
        $user = Auth::user();
        $otherUser = User::findOrFail($userId);

        // Get all conversations for sidebar
        $conversations = $this->getConversations($user->id);

        // Get messages between users
        $query = Message::where(function ($q) use ($user, $userId) {
            $q->where('sender_id', $user->id)
                ->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($user, $userId) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', $user->id);
        });

        // Filter by RFQ if provided
        if ($request->filled('rfq_id')) {
            $query->where('rfq_id', $request->rfq_id);
        }

        $messages = $query->with(['sender', 'receiver', 'rfq'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Get related RFQs for context
        $relatedRfqs = Rfq::where('buyer_id', $userId)
            ->orWhereHas('quotes', function ($q) use ($user) {
                $q->where('supplier_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $selectedConversation = [
            'user' => $otherUser,
            'rfq' => $request->rfq_id ? Rfq::find($request->rfq_id) : null,
        ];

        return Inertia::render('Supplier/Messages/Index', compact(
            'conversations',
            'selectedConversation',
            'messages',
            'otherUser',
            'relatedRfqs'
        ));
    }

    /**
     * Send a new message.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
            'rfq_id' => 'nullable|exists:rfqs,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120', // 5MB max
        ]);

        DB::transaction(function () use ($validated, $user, $request) {
            // Create message
            $message = Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $validated['receiver_id'],
                'rfq_id' => $validated['rfq_id'] ?? null, // Use null coalescing operator
                'message' => $validated['message'],
                'is_read' => false,
            ]);

            // Handle file attachments if any
            if ($request->hasFile('attachments')) {
                $attachments = [];
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('message-attachments', 'public');
                    $attachments[] = [
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime' => $file->getMimeType(),
                    ];
                }

                // If you have an attachments relationship or column
                if (method_exists($message, 'attachments')) {
                    foreach ($attachments as $attachment) {
                        $message->attachments()->create($attachment);
                    }
                }
            }

            // Send real-time notification if using websockets
            // event(new NewMessage($message));
        });

        // Fix the redirect logic - check if rfq_id exists in validated data
        if (isset($validated['rfq_id']) && $validated['rfq_id']) {
            $redirect = route('supplier.messages.index', ['rfq' => $validated['rfq_id']]);
        } else {
            $redirect = route('supplier.messages.show', $validated['receiver_id']);
        }

        return redirect($redirect)
            ->with('success', 'Message sent successfully.');
    }

    /**
     * Mark messages as read.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'sender_id' => 'nullable|exists:users,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
            'all' => 'nullable|boolean',
        ]);

        $query = Message::where('receiver_id', $user->id)
            ->where('is_read', false);

        if (!empty($validated['all'])) {
            // Mark all messages as read
            $count = $query->count();
            $query->update(['is_read' => true]);

            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', 'All messages marked as read.');
            }

            // For API requests (non-Inertia), return JSON
            return response()->json([
                'success' => true,
                'message' => "All messages marked as read.",
                'count' => $count,
            ]);
        }

        if (!empty($validated['sender_id'])) {
            // Mark messages from specific sender as read
            $query->where('sender_id', $validated['sender_id']);
        }

        if (!empty($validated['rfq_id'])) {
            // Mark messages for specific RFQ as read
            $query->where('rfq_id', $validated['rfq_id']);
        }

        $count = $query->count();
        $query->update(['is_read' => true]);

        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Messages marked as read.');
        }

        // For API requests (non-Inertia), return JSON
        return response()->json([
            'success' => true,
            'message' => "Messages marked as read.",
            'count' => $count,
        ]);
    }

    /**
     * Get count of unread messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Inertia\Response
     */
    public function unreadCount(Request $request)
    {
        $user = Auth::user();

        $count = Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        // Get unread count by sender for badge display
        $unreadBySender = Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->select('sender_id', DB::raw('count(*) as count'))
            ->groupBy('sender_id')
            ->with('sender')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->sender_id => [
                    'count' => $item->count,
                    'sender' => $item->sender,
                ]];
            });

        // For API requests (AJAX/fetch), return JSON
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'total' => $count,
                'by_sender' => $unreadBySender,
            ]);
        }

        // For regular Inertia requests, return data to be used in the page
        return Inertia::render('Supplier/Messages/Index', [
            'unreadCount' => $count,
            'unreadBySender' => $unreadBySender
        ]);
    }

    /**
     * API endpoint for polling new messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function poll(Request $request)
    {
        $user = Auth::user();

        $since = $request->get('since', now()->subMinutes(5));

        $newMessages = Message::where('receiver_id', $user->id)
            ->where('created_at', '>', $since)
            ->with(['sender', 'rfq'])
            ->get();

        return response()->json([
            'new_messages' => $newMessages,
            'count' => $newMessages->count(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Search messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function search(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $searchTerm = $request->q;

        $messages = Message::where(function ($query) use ($user, $searchTerm) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })
            ->where('message', 'LIKE', "%{$searchTerm}%")
            ->with(['sender', 'receiver', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Supplier/Messages/Search', compact('messages', 'searchTerm'));
    }

    /**
     * Delete a message.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $message = Message::where('sender_id', $user->id)
            ->findOrFail($id);

        $message->delete();

        return redirect()
            ->back()
            ->with('success', 'Message deleted successfully.');
    }

    /**
     * Get all conversations for a user.
     *
     * @param  int  $userId
     * @return \Illuminate\Support\Collection
     */
    private function getConversations($userId)
    {
        // Get all distinct users that the current user has conversed with
        $sentMessages = Message::where('sender_id', $userId)
            ->select('receiver_id as user_id', DB::raw('MAX(created_at) as last_message_at'))
            ->groupBy('receiver_id');

        $receivedMessages = Message::where('receiver_id', $userId)
            ->select('sender_id as user_id', DB::raw('MAX(created_at) as last_message_at'))
            ->groupBy('sender_id');

        $conversations = $sentMessages->union($receivedMessages)
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Load user details and last message for each conversation
        $conversations = $conversations->map(function ($item) use ($userId) {
            $otherUser = User::find($item->user_id);

            if (!$otherUser) {
                return null;
            }

            // Get last message in this conversation
            $lastMessage = Message::where(function ($query) use ($userId, $otherUser) {
                $query->where('sender_id', $userId)
                    ->where('receiver_id', $otherUser->id);
            })->orWhere(function ($query) use ($userId, $otherUser) {
                $query->where('sender_id', $otherUser->id)
                    ->where('receiver_id', $userId);
            })
                ->latest()
                ->first();

            // Get unread count
            $unreadCount = Message::where('sender_id', $otherUser->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            // Get RFQs involved in this conversation
            $rfqs = Message::where(function ($query) use ($userId, $otherUser) {
                $query->where('sender_id', $userId)
                    ->where('receiver_id', $otherUser->id);
            })->orWhere(function ($query) use ($userId, $otherUser) {
                $query->where('sender_id', $otherUser->id)
                    ->where('receiver_id', $userId);
            })
                ->whereNotNull('rfq_id')
                ->with('rfq')
                ->get()
                ->pluck('rfq')
                ->filter()
                ->unique('id')
                ->values();

            return (object) [
                'user' => $otherUser,
                'last_message' => $lastMessage,
                'last_message_at' => $item->last_message_at,
                'unread_count' => $unreadCount,
                'rfqs' => $rfqs,
            ];
        })->filter()->values();

        return $conversations;
    }
}
