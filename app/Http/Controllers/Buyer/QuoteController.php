<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Rfq;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuoteController extends Controller
{
    /**
     * Display a listing of quotes received by the buyer.
     */
    public function index(Request $request)
    {
        $query = RfqQuote::whereHas('rfq', function ($q) {
            $q->where('buyer_id', Auth::id());
        })
            ->with(['rfq', 'supplier.supplier', 'rfq.buyer']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by RFQ
        if ($request->filled('rfq_id')) {
            $query->where('rfq_id', $request->rfq_id);
        }

        // Filter by supplier
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Search by quote number or RFQ title
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                    ->orWhereHas('rfq', function ($r) use ($search) {
                        $r->where('title', 'like', "%{$search}%")
                            ->orWhere('rfq_number', 'like', "%{$search}%");
                    });
            });
        }

        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by validity
        if ($request->filled('validity')) {
            if ($request->validity === 'valid') {
                $query->where('valid_until', '>=', now());
            } elseif ($request->validity === 'expired') {
                $query->where('valid_until', '<', now());
            }
        }

        // Sort quotes
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'amount_high':
                $query->orderBy('total_amount', 'desc');
                break;
            case 'amount_low':
                $query->orderBy('total_amount', 'asc');
                break;
            case 'valid_until':
                $query->orderBy('valid_until', 'asc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $quotes = $query->paginate(15)->withQueryString();

        // Get counts for dashboard
        $counts = [
            'pending' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('status', 'pending')
                ->count(),
            'accepted' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('status', 'accepted')
                ->count(),
            'rejected' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('status', 'rejected')
                ->count(),
            'expired' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('valid_until', '<', now())
                ->where('status', '!=', 'accepted')
                ->count(),
        ];

        // Get RFQs for filter dropdown
        $rfqs = Rfq::where('buyer_id', Auth::id())
            ->whereHas('quotes')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'rfq_number']);

        return Inertia::render('Buyer/Quotes/Index', compact('quotes', 'counts', 'rfqs'));
    }

    /**
     * Display the specified quote.
     */
    public function show(RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Load relationships
        $quote->load([
            'rfq',
            'supplier.supplier',
            'supplier.supplier.products' => function ($q) {
                $q->limit(5);
            }
        ]);

        // Check if quote is expired
        $isExpired = !$quote->isValid();

        // Get comparison with other quotes for same RFQ
        $otherQuotes = RfqQuote::where('rfq_id', $quote->rfq_id)
            ->where('id', '!=', $quote->id)
            ->with('supplier')
            ->get();

        // Check if there's an existing order
        $existingOrder = $quote->order;

        // Parse product breakdown
        $productBreakdown = is_string($quote->product_breakdown)
            ? json_decode($quote->product_breakdown, true)
            : $quote->product_breakdown;

        return Inertia::render('Buyer/Quotes/Show', compact('quote', 'isExpired', 'otherQuotes', 'existingOrder', 'productBreakdown'));
    }

    /**
     * Show accept quote confirmation page.
     */
    public function acceptConfirm(RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Check if quote can be accepted
        if (!$quote->isPending()) {
            return redirect()->route('buyer.quotes.show', $quote)
                ->with('error', 'This quote cannot be accepted because it is no longer pending.');
        }

        if (!$quote->isValid()) {
            return redirect()->route('buyer.quotes.show', $quote)
                ->with('error', 'This quote has expired and cannot be accepted.');
        }

        // Check if another quote was already accepted
        $acceptedQuote = $quote->rfq->acceptedQuote();
        if ($acceptedQuote && $acceptedQuote->id !== $quote->id) {
            return redirect()->route('buyer.quotes.show', $quote)
                ->with('error', 'Another quote has already been accepted for this RFQ.');
        }

        $quote->load(['rfq', 'supplier.supplier']);

        return Inertia::render('Buyer/Quotes/Accept', compact('quote'));
    }

    /**
     * Accept the specified quote.
     */
    public function accept(Request $request, RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Validate request
        $request->validate([
            'confirmation' => 'required|accepted',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if quote can be accepted
        if (!$quote->isPending()) {
            return back()->with('error', 'This quote cannot be accepted because it is no longer pending.');
        }

        if (!$quote->isValid()) {
            return back()->with('error', 'This quote has expired and cannot be accepted.');
        }

        DB::beginTransaction();

        try {
            // Update quote status
            $quote->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'acceptance_notes' => $request->notes,
            ]);

            // Reject all other quotes for this RFQ
            RfqQuote::where('rfq_id', $quote->rfq_id)
                ->where('id', '!=', $quote->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                    'rejection_reason' => 'Another quote was accepted for this RFQ.'
                ]);

            // Update RFQ status
            $quote->rfq->update(['status' => 'closed']);

            // Send notification to supplier
            // You can implement notification here
            // $quote->supplier->notify(new QuoteAcceptedNotification($quote));

            DB::commit();

            return redirect()->route('buyer.quotes.show', $quote)
                ->with('success', 'Quote accepted successfully! You can now proceed to create an order.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to accept quote. Please try again.');
        }
    }

    /**
     * Show reject quote confirmation page.
     */
    public function rejectConfirm(RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Check if quote can be rejected
        if (!$quote->isPending()) {
            return redirect()->route('buyer.quotes.show', $quote)
                ->with('error', 'This quote cannot be rejected because it is no longer pending.');
        }

        return Inertia::render('Buyer/Quotes/Reject', compact('quote'));
    }

    /**
     * Reject the specified quote.
     */
    public function reject(Request $request, RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Validate request
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        // Check if quote can be rejected
        if (!$quote->isPending()) {
            return back()->with('error', 'This quote cannot be rejected because it is no longer pending.');
        }

        $quote->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        // Send notification to supplier
        // $quote->supplier->notify(new QuoteRejectedNotification($quote, $request->rejection_reason));

        return redirect()->route('buyer.quotes.show', $quote)
            ->with('success', 'Quote rejected successfully.');
    }

    /**
     * Compare multiple quotes for the same RFQ.
     */
    public function compare(Request $request)
    {
        $request->validate([
            'quote_ids' => 'required|array|min:2|max:5',
            'quote_ids.*' => 'exists:rfq_quotes,id'
        ]);

        $quotes = RfqQuote::whereIn('id', $request->quote_ids)
            ->whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
            ->with(['supplier.supplier', 'rfq'])
            ->get();

        if ($quotes->isEmpty()) {
            return back()->with('error', 'No valid quotes found to compare.');
        }

        // Ensure all quotes are for the same RFQ
        $rfqId = $quotes->first()->rfq_id;
        if ($quotes->where('rfq_id', '!=', $rfqId)->isNotEmpty()) {
            return back()->with('error', 'Cannot compare quotes from different RFQs.');
        }

        // Parse product breakdowns for comparison
        $comparisonData = [];
        foreach ($quotes as $quote) {
            $breakdown = is_string($quote->product_breakdown)
                ? json_decode($quote->product_breakdown, true)
                : $quote->product_breakdown;

            $comparisonData[] = [
                'quote' => $quote,
                'breakdown' => $breakdown,
                'total' => $quote->total_amount,
                'valid_until' => $quote->valid_until,
                'supplier' => $quote->supplier->name,
                'supplier_rating' => $this->getSupplierRating($quote->supplier_id),
            ];
        }

        return Inertia::render('Buyer/Quotes/Compare', compact('comparisonData'));
    }

    /**
     * Get quote details for quick view (AJAX endpoint).
     */
    public function quickView(RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        $quote->load(['supplier.supplier', 'rfq']);

        $productBreakdown = is_string($quote->product_breakdown)
            ? json_decode($quote->product_breakdown, true)
            : $quote->product_breakdown;

        $html = view('buyer.quotes.partials.quick-view', compact('quote', 'productBreakdown'))->render();

        return response()->json([
            'html' => $html,
            'quote' => [
                'id' => $quote->id,
                'quote_number' => $quote->quote_number,
                'total_amount' => number_format($quote->total_amount, 2),
                'status' => $quote->status,
                'valid_until' => $quote->valid_until->format('Y-m-d'),
            ]
        ]);
    }

    /**
     * Download quote as PDF.
     */
    public function downloadPdf(RfqQuote $quote)
    {
        // Ensure the quote belongs to the buyer's RFQ
        if ($quote->rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        $quote->load(['supplier.supplier', 'rfq.buyer']);

        $productBreakdown = is_string($quote->product_breakdown)
            ? json_decode($quote->product_breakdown, true)
            : $quote->product_breakdown;

        // Generate PDF
        // $pdf = \PDF::loadView('buyer.quotes.pdf', compact('quote', 'productBreakdown'));

        // return $pdf->download('quote-' . $quote->quote_number . '.pdf');
    }

    /**
     * Get quote statistics for dashboard.
     */
    public function statistics()
    {
        $stats = [
            'total_quotes' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))->count(),
            'pending_quotes' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('status', 'pending')
                ->where('valid_until', '>=', now())
                ->count(),
            'expired_quotes' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('valid_until', '<', now())
                ->where('status', 'pending')
                ->count(),
            'average_quote_amount' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->where('status', 'pending')
                ->avg('total_amount'),
            'total_suppliers' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', Auth::id()))
                ->distinct('supplier_id')
                ->count('supplier_id'),
        ];

        return response()->json($stats);
    }

    /**
     * Get supplier rating (helper method).
     */
    private function getSupplierRating($supplierId)
    {
        // This would typically come from a reviews/ratings system
        // For now, return a placeholder
        return rand(3, 5) . '/5';
    }
}
