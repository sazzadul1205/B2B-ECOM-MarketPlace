<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\RfqQuote;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class QuoteController extends Controller
{
    /**
     * Display a listing of all quotes sent by supplier.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = RfqQuote::where('supplier_id', $user->id)
            ->with(['rfq.buyer', 'order']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by validity
        if ($request->filled('validity')) {
            if ($request->validity === 'expired') {
                $query->where('valid_until', '<', now())
                    ->where('status', 'pending');
            } elseif ($request->validity === 'valid') {
                $query->where('valid_until', '>=', now())
                    ->where('status', 'pending');
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                    ->orWhereHas('rfq', function ($rfqQuery) use ($search) {
                        $rfqQuery->where('rfq_number', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('rfq.buyer', function ($buyerQuery) use ($search) {
                        $buyerQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $quotes = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => RfqQuote::where('supplier_id', $user->id)->count(),
            'pending' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'pending')
                ->where('valid_until', '>=', now())
                ->count(),
            'expired' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'pending')
                ->where('valid_until', '<', now())
                ->count(),
            'accepted' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'accepted')
                ->count(),
            'rejected' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'rejected')
                ->count(),
            'conversion_rate' => $this->calculateConversionRate($user->id),
        ];

        // Get status counts for filter badges
        $statusCounts = [
            'pending' => RfqQuote::where('supplier_id', $user->id)->where('status', 'pending')->count(),
            'accepted' => RfqQuote::where('supplier_id', $user->id)->where('status', 'accepted')->count(),
            'rejected' => RfqQuote::where('supplier_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Supplier/Quotes/Index', compact('quotes', 'stats', 'statusCounts'));
    }

    /**
     * Display the specified quote details.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function show($id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with([
                'rfq.buyer',
                'rfq.messages' => function ($q) use ($user) {
                    $q->where(function ($query) use ($user) {
                        $query->where('sender_id', $user->id)
                            ->orWhere('receiver_id', $user->id);
                    })->latest();
                },
                'order'
            ])
            ->findOrFail($id);

        // Check if quote is expired
        $isExpired = !$quote->isValid() && $quote->isPending();

        // Get buyer information
        $buyer = $quote->rfq->buyer;

        // Get message history
        $messages = $quote->rfq->messages()
            ->where(function ($query) use ($user, $buyer) {
                $query->where(function ($q) use ($user, $buyer) {
                    $q->where('sender_id', $user->id)
                        ->where('receiver_id', $buyer->id);
                })->orWhere(function ($q) use ($user, $buyer) {
                    $q->where('sender_id', $buyer->id)
                        ->where('receiver_id', $user->id);
                });
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Get other quotes from same RFQ for comparison
        $otherQuotes = RfqQuote::where('rfq_id', $quote->rfq_id)
            ->where('id', '!=', $quote->id)
            ->with('supplier.supplier')
            ->get();

        return Inertia::render('Supplier/Quotes/Show', compact(
            'quote',
            'buyer',
            'messages',
            'otherQuotes',
            'isExpired'
        ));
    }

    /**
     * Show form to edit quote.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if quote can be edited
        if (!$quote->isPending()) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'Only pending quotes can be edited.');
        }

        // Check if RFQ is still open
        if (!$quote->rfq->isOpen() || $quote->rfq->required_by_date->isPast()) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'The RFQ for this quote is no longer open.');
        }

        return Inertia::render('Supplier/Quotes/Edit', compact('quote'));
    }

    /**
     * Update the specified quote.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if quote can be updated
        if (!$quote->isPending()) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'Only pending quotes can be updated.');
        }

        // Validate request
        $validated = $request->validate([
            'total_amount' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',
            'product_breakdown' => 'required|array',
            'product_breakdown.*.name' => 'required|string|max:255',
            'product_breakdown.*.quantity' => 'required|integer|min:1',
            'product_breakdown.*.unit_price' => 'required|numeric|min:0',
            'product_breakdown.*.total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'delivery_estimate' => 'nullable|string|max:255',
            'payment_terms' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $quote, $request, $user) {
            $oldAmount = $quote->total_amount;

            // Update quote
            $quote->update([
                'total_amount' => $validated['total_amount'],
                'product_breakdown' => $validated['product_breakdown'],
                'valid_until' => $validated['valid_until'],
                'notes' => $request->notes,
                'delivery_estimate' => $request->delivery_estimate,
                'payment_terms' => $request->payment_terms,
            ]);

            // Send notification to buyer about quote update
            Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $quote->rfq->buyer_id,
                'rfq_id' => $quote->rfq_id,
                'message' => "Quote #{$quote->quote_number} has been updated. New amount: {$validated['total_amount']}",
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.quotes.show', $quote->id)
            ->with('success', 'Quote updated successfully.');
    }

    /**
     * Withdraw a pending quote.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function withdraw(Request $request, $id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if quote can be withdrawn
        if (!$quote->isPending()) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'Only pending quotes can be withdrawn.');
        }

        $validated = $request->validate([
            'withdrawal_reason' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($quote, $validated, $user) {
            // Update quote status
            $quote->update([
                'status' => 'withdrawn',
                'withdrawn_at' => now(),
                'withdrawal_reason' => $validated['withdrawal_reason'] ?? null,
            ]);

            // Send notification to buyer
            Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $quote->rfq->buyer_id,
                'rfq_id' => $quote->rfq_id,
                'message' => "Quote #{$quote->quote_number} has been withdrawn by the supplier." .
                    ($validated['withdrawal_reason'] ? " Reason: {$validated['withdrawal_reason']}" : ''),
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.quotes.index')
            ->with('success', 'Quote withdrawn successfully.');
    }

    /**
     * Duplicate a quote to create a new one.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function duplicate($id)
    {
        $user = Auth::user();

        $originalQuote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if RFQ is still open
        if (!$originalQuote->rfq->isOpen() || $originalQuote->rfq->required_by_date->isPast()) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'Cannot duplicate quote because the RFQ is no longer open.');
        }

        // Check if supplier already has a pending quote for this RFQ
        $existingQuote = RfqQuote::where('rfq_id', $originalQuote->rfq_id)
            ->where('supplier_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingQuote) {
            return redirect()
                ->route('supplier.quotes.index')
                ->with('error', 'You already have a pending quote for this RFQ.');
        }

        DB::transaction(function () use ($originalQuote, $user) {
            // Create new quote
            $newQuote = RfqQuote::create([
                'quote_number' => RfqQuote::generateQuoteNumber(),
                'rfq_id' => $originalQuote->rfq_id,
                'supplier_id' => $user->id,
                'total_amount' => $originalQuote->total_amount,
                'product_breakdown' => $originalQuote->product_breakdown,
                'valid_until' => now()->addDays(30), // Default 30 days validity
                'status' => 'pending',
                'notes' => $originalQuote->notes,
                'delivery_estimate' => $originalQuote->delivery_estimate,
                'payment_terms' => $originalQuote->payment_terms,
            ]);

            // Send notification
            Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $originalQuote->rfq->buyer_id,
                'rfq_id' => $originalQuote->rfq_id,
                'message' => "A new quote has been submitted for your RFQ #{$originalQuote->rfq->rfq_number}",
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.quotes.index')
            ->with('success', 'Quote duplicated and submitted successfully.');
    }

    /**
     * Calculate quote conversion rate.
     *
     * @param  int  $supplierId
     * @return float
     */
    private function calculateConversionRate($supplierId)
    {
        $total = RfqQuote::where('supplier_id', $supplierId)->count();

        if ($total === 0) {
            return 0;
        }

        $accepted = RfqQuote::where('supplier_id', $supplierId)
            ->where('status', 'accepted')
            ->count();

        return round(($accepted / $total) * 100, 1);
    }

    /**
     * Check quote validity status.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkValidity($id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'is_valid' => $quote->isValid(),
            'valid_until' => $quote->valid_until->format('Y-m-d'),
            'status' => $quote->status,
        ]);
    }

    /**
     * Extend quote validity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function extendValidity(Request $request, $id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->findOrFail($id);

        // Check if quote is pending
        if (!$quote->isPending()) {
            return redirect()
                ->back()
                ->with('error', 'Only pending quotes can have their validity extended.');
        }

        $validated = $request->validate([
            'new_valid_until' => 'required|date|after:today',
            'extension_reason' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($quote, $validated, $user) {
            $oldValidUntil = $quote->valid_until;

            $quote->update([
                'valid_until' => $validated['new_valid_until'],
            ]);

            // Send notification to buyer
            Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $quote->rfq->buyer_id,
                'rfq_id' => $quote->rfq_id,
                'message' => "Quote #{$quote->quote_number} validity has been extended until {$validated['new_valid_until']}." .
                    ($validated['extension_reason'] ? " Reason: {$validated['extension_reason']}" : ''),
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.quotes.show', $quote->id)
            ->with('success', 'Quote validity extended successfully.');
    }
}
