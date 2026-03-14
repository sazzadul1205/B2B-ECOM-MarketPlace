<?php

namespace App\Http\Controllers\Buyer;


use App\Http\Controllers\Controller;
use App\Models\Rfq;
use App\Models\Product;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RfqController extends Controller
{
    /**
     * Display a listing of the user's RFQs.
     */
    public function index(Request $request)
    {
        $query = Rfq::where('buyer_id', Auth::id())
            ->with(['quotes' => function ($q) {
                $q->where('status', 'pending');
            }]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort RFQs
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'required_date':
                $query->orderBy('required_by_date', 'asc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $rfqs = $query->paginate(10)->withQueryString();

        // Get counts for dashboard
        $counts = [
            'open' => Rfq::where('buyer_id', Auth::id())->where('status', 'open')->count(),
            'quoted' => Rfq::where('buyer_id', Auth::id())->whereHas('quotes')->count(),
            'closed' => Rfq::where('buyer_id', Auth::id())->where('status', 'closed')->count(),
        ];

        return Inertia::render('Buyer/Rfqs/Index', compact('rfqs', 'counts'));
    }

    /**
     * Show the form for creating a new RFQ.
     */
    public function create()
    {
        // Get products the buyer has previously ordered or browsed
        $recentProducts = Product::whereIn('id', function ($query) {
            $query->select('product_id')
                ->from('order_items')
                ->whereIn('order_id', function ($q) {
                    $q->select('id')
                        ->from('orders')
                        ->where('buyer_id', Auth::id());
                });
        })->limit(5)->get();

        // Get categories for quick selection
        $categories = Product::distinct()->pluck('category');

        return Inertia::render('Buyer/Rfqs/Create', compact('recentProducts', 'categories'));
    }

    /**
     * Store a newly created RFQ in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'products_requested' => 'required|array|min:1',
            'products_requested.*.name' => 'required|string|max:255',
            'products_requested.*.quantity' => 'required|integer|min:1',
            'products_requested.*.unit' => 'required|string|max:50',
            'products_requested.*.specifications' => 'nullable|string',
            'products_requested.*.category' => 'nullable|string',
            'required_by_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Create RFQ
            $rfq = Rfq::create([
                'rfq_number' => Rfq::generateRfqNumber(),
                'buyer_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'products_requested' => $validated['products_requested'],
                'quantity' => array_sum(array_column($validated['products_requested'], 'quantity')),
                'required_by_date' => $validated['required_by_date'],
                'status' => 'open',
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('buyer.rfqs.show', $rfq)
                ->with('success', 'RFQ created successfully. Suppliers will now be able to submit quotes.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create RFQ. Please try again.');
        }
    }

    /**
     * Display the specified RFQ.
     */
    public function show(Rfq $rfq)
    {
        // Ensure the buyer owns this RFQ
        if ($rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Load relationships including order
        $rfq->load(['quotes.supplier.supplier', 'quotes' => function ($q) {
            $q->latest();
        }, 'order']);

        // Get messages related to this RFQ
        $messages = $rfq->messages()
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Check if there's an accepted quote
        $acceptedQuote = $rfq->acceptedQuote();

        // Get order if exists
        $order = $rfq->order;

        return Inertia::render('Buyer/Rfqs/Show', compact('rfq', 'messages', 'acceptedQuote', 'order'));
    }

    /**
     * Show the form for editing the specified RFQ.
     */
    public function edit(Rfq $rfq)
    {
        // Ensure the buyer owns this RFQ and it's still open
        if ($rfq->buyer_id !== Auth::id() || $rfq->status !== 'open') {
            abort(403);
        }

        return Inertia::render('Buyer/Rfqs/Edit', compact('rfq'));
    }

    /**
     * Update the specified RFQ in storage.
     */
    public function update(Request $request, Rfq $rfq)
    {
        // Ensure the buyer owns this RFQ and it's still open
        if ($rfq->buyer_id !== Auth::id() || $rfq->status !== 'open') {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'products_requested' => 'required|array',
            'required_by_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
        ]);

        $rfq->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'products_requested' => $validated['products_requested'],
            'quantity' => array_sum(array_column($validated['products_requested'], 'quantity')),
            'required_by_date' => $validated['required_by_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('buyer.rfqs.show', $rfq)
            ->with('success', 'RFQ updated successfully.');
    }

    /**
     * Cancel the specified RFQ.
     */
    public function cancel(Rfq $rfq)
    {
        // Ensure the buyer owns this RFQ
        if ($rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Can only cancel open RFQs
        if ($rfq->status !== 'open') {
            return back()->with('error', 'Only open RFQs can be cancelled.');
        }

        $rfq->update(['status' => 'cancelled']);

        return redirect()->route('buyer.rfqs.index')
            ->with('success', 'RFQ cancelled successfully.');
    }

    /**
     * Accept a quote for the RFQ.
     */
    public function acceptQuote(Request $request, Rfq $rfq, RfqQuote $quote)
    {
        // Ensure the buyer owns this RFQ and the quote belongs to it
        if ($rfq->buyer_id !== Auth::id() || $quote->rfq_id !== $rfq->id) {
            abort(403);
        }

        // Ensure quote is pending and valid
        if (!$quote->isPending() || !$quote->isValid()) {
            return back()->with('error', 'This quote cannot be accepted.');
        }

        DB::beginTransaction();

        try {
            // Update quote status
            $quote->update(['status' => 'accepted']);

            // Reject all other quotes for this RFQ
            RfqQuote::where('rfq_id', $rfq->id)
                ->where('id', '!=', $quote->id)
                ->update(['status' => 'rejected']);

            // Update RFQ status
            $rfq->update(['status' => 'closed']);

            DB::commit();

            return redirect()->route('buyer.rfqs.show', $rfq)
                ->with('success', 'Quote accepted successfully. You can now proceed to order confirmation.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to accept quote. Please try again.');
        }
    }

    /**
     * Reject a quote for the RFQ.
     */
    public function rejectQuote(Request $request, Rfq $rfq, RfqQuote $quote)
    {
        // Ensure the buyer owns this RFQ and the quote belongs to it
        if ($rfq->buyer_id !== Auth::id() || $quote->rfq_id !== $rfq->id) {
            abort(403);
        }

        // Ensure quote is pending
        if (!$quote->isPending()) {
            return back()->with('error', 'This quote cannot be rejected.');
        }

        $quote->update(['status' => 'rejected']);

        return redirect()->route('buyer.rfqs.show', $rfq)
            ->with('success', 'Quote rejected successfully.');
    }

    /**
     * Track RFQ status (AJAX endpoint).
     */
    public function trackStatus(Rfq $rfq)
    {
        // Ensure the buyer owns this RFQ
        if ($rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        $status = [
            'rfq_number' => $rfq->rfq_number,
            'status' => $rfq->status,
            'created_at' => $rfq->created_at->format('Y-m-d H:i'),
            'required_by' => $rfq->required_by_date->format('Y-m-d'),
            'quotes_count' => $rfq->quotes->count(),
            'quotes' => $rfq->quotes->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'supplier' => $quote->supplier->name,
                    'total_amount' => $quote->total_amount,
                    'status' => $quote->status,
                    'valid_until' => $quote->valid_until->format('Y-m-d'),
                ];
            }),
        ];

        return response()->json($status);
    }
}
