<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Rfq;
use App\Models\RfqQuote;
use App\Models\Product;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RfqController extends Controller
{
    /**
     * Display a listing of available RFQs matching supplier categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        // Ensure supplier has a profile
        if (!$supplier) {
            return redirect()->route('supplier.profile.edit')
                ->with('error', 'Please complete your supplier profile first.');
        }

        // Get supplier's product categories to match with RFQs
        $supplierCategories = Product::where('supplier_id', $supplier->id)
            ->where('status', 'approved')
            ->distinct()
            ->pluck('category')
            ->toArray();

        // Build query for open RFQs
        $query = Rfq::where('status', 'open')
            ->with(['buyer', 'quotes' => function ($q) use ($user) {
                $q->where('supplier_id', $user->id);
            }])
            ->where('required_by_date', '>=', now());

        // Filter by categories if supplier has products
        if (!empty($supplierCategories) && $request->input('filter_by_category', true)) {
            $query->where(function ($q) use ($supplierCategories) {
                foreach ($supplierCategories as $category) {
                    $q->orWhereJsonContains('products_requested', ['category' => $category]);
                }
            });
        }

        // Filter by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('rfq_number', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort RFQs
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Get RFQs with pagination
        $rfqs = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_available' => Rfq::where('status', 'open')
                ->where('required_by_date', '>=', now())
                ->count(),
            'matching_categories' => $rfqs->total(),
            'my_quotes' => RfqQuote::where('supplier_id', $user->id)->count(),
            'pending_quotes' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'accepted_quotes' => RfqQuote::where('supplier_id', $user->id)
                ->where('status', 'accepted')
                ->count(),
        ];

        return Inertia::render('Supplier/Rfqs/Index', compact('rfqs', 'stats', 'supplierCategories'));
    }

    public function show($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $rfq = Rfq::with(['buyer'])
            ->findOrFail($id);

        // Check if RFQ is still open
        $isOpen = $rfq->isOpen() && $rfq->required_by_date->isFuture();

        // Check if supplier has already quoted
        $existingQuote = RfqQuote::where('rfq_id', $id)
            ->where('supplier_id', $user->id)  // Using user->id because RfqQuote.supplier_id references User.id
            ->first();

        // Get all quotes for this RFQ (excluding supplier's own)
        $otherQuotes = RfqQuote::where('rfq_id', $rfq->id)
            ->where('supplier_id', '!=', $user->id)
            ->with('supplier')  // This loads the User model
            ->get();

        // Check if supplier can quote (has active products)
        $canQuote = $this->canQuoteOnRfq($supplier, $rfq);

        // Get supplier's active products for reference - using supplier->id because Product.supplier_id references Supplier.id
        $supplierProducts = Product::where('supplier_id', $supplier->id)
            ->where('status', 'approved')
            ->select(['id', 'name', 'category', 'base_price', 'unit', 'minimum_order_quantity', 'description'])
            ->get();

        return Inertia::render('Supplier/Rfqs/Show', [
            'rfq' => $rfq,
            'isOpen' => $isOpen,
            'existingQuote' => $existingQuote,
            'otherQuotes' => $otherQuotes,
            'canQuote' => $canQuote,
            'supplierProducts' => $supplierProducts
        ]);
    }

    /**
     * Show form to create quote for RFQ.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function createQuote($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $rfq = Rfq::findOrFail($id);

        // Check if RFQ is open and supplier can quote
        if (!$rfq->isOpen() || $rfq->required_by_date->isPast()) {
            return redirect()
                ->route('supplier.rfqs.index')
                ->with('error', 'This RFQ is no longer open for quotes.');
        }

        // Check if supplier has already quoted
        $existingQuote = RfqQuote::where('rfq_id', $id)
            ->where('supplier_id', $user->id)  // Using user->id
            ->first();

        if ($existingQuote) {
            return redirect()
                ->route('supplier.rfqs.show', $id)
                ->with('error', 'You have already submitted a quote for this RFQ.');
        }

        // Get supplier's active products for quoting - using supplier->id
        $products = Product::where('supplier_id', $supplier->id)
            ->where('status', 'approved')
            ->with('bulkPrices')
            ->get();

        // Parse requested products from RFQ
        $requestedProducts = $rfq->products_requested ?? [];

        return Inertia::render('Supplier/Rfqs/CreateQuote', [
            'rfq' => $rfq,
            'products' => $products,
            'requestedProducts' => $requestedProducts
        ]);
    }

    /**
     * Store quote for RFQ.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeQuote(Request $request, $id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $rfq = Rfq::findOrFail($id);

        // Validate RFQ is still open
        if (!$rfq->isOpen() || $rfq->required_by_date->isPast()) {
            return redirect()
                ->route('supplier.rfqs.index')
                ->with('error', 'This RFQ is no longer open for quotes.');
        }

        // Validate request
        $validated = $request->validate([
            'total_amount' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',
            'product_breakdown' => 'required|array',
            'product_breakdown.*.product_id' => 'nullable|exists:products,id',
            'product_breakdown.*.name' => 'required|string|max:255',
            'product_breakdown.*.quantity' => 'required|integer|min:1',
            'product_breakdown.*.unit_price' => 'required|numeric|min:0',
            'product_breakdown.*.total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'delivery_estimate' => 'nullable|string|max:255',
            'payment_terms' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $rfq, $user, $request) {
            // Generate quote number
            $quoteNumber = RfqQuote::generateQuoteNumber();

            // Create quote
            $quote = RfqQuote::create([
                'quote_number' => $quoteNumber,
                'rfq_id' => $rfq->id,
                'supplier_id' => $user->id,
                'total_amount' => $validated['total_amount'],
                'product_breakdown' => $validated['product_breakdown'],
                'valid_until' => $validated['valid_until'],
                'status' => 'pending',
                'notes' => $request->notes,
                'delivery_estimate' => $request->delivery_estimate,
                'payment_terms' => $request->payment_terms,
            ]);

            // Send notification to buyer via message
            Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $rfq->buyer_id,
                'rfq_id' => $rfq->id,
                'message' => "We have submitted a quote for your RFQ #{$rfq->rfq_number}. Quote Number: {$quoteNumber}",
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.rfqs.my-quotes')
            ->with('success', 'Quote submitted successfully.');
    }

    /**
     * Edit existing quote (if still pending).
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function editQuote($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if quote can be edited (only pending quotes)
        if (!$quote->isPending()) {
            return redirect()
                ->route('supplier.rfqs.my-quotes')
                ->with('error', 'Only pending quotes can be edited.');
        }

        // Check if RFQ is still open
        if (!$quote->rfq->isOpen() || $quote->rfq->required_by_date->isPast()) {
            return redirect()
                ->route('supplier.rfqs.my-quotes')
                ->with('error', 'The RFQ for this quote is no longer open.');
        }

        // Get supplier's products
        $products = Product::where('supplier_id', $supplier->id)
            ->where('status', 'approved')
            ->with('bulkPrices')
            ->get();

        return Inertia::render('Supplier/Rfqs/EditQuote', compact('quote', 'products'));
    }

    /**
     * Update existing quote.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateQuote(Request $request, $id)
    {
        $user = Auth::user();

        $quote = RfqQuote::where('supplier_id', $user->id)
            ->with('rfq')
            ->findOrFail($id);

        // Check if quote can be updated
        if (!$quote->isPending()) {
            return redirect()
                ->route('supplier.rfqs.my-quotes')
                ->with('error', 'Only pending quotes can be updated.');
        }

        // Validate request
        $validated = $request->validate([
            'total_amount' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',
            'product_breakdown' => 'required|array',
            'product_breakdown.*.product_id' => 'nullable|exists:products,id',
            'product_breakdown.*.name' => 'required|string|max:255',
            'product_breakdown.*.quantity' => 'required|integer|min:1',
            'product_breakdown.*.unit_price' => 'required|numeric|min:0',
            'product_breakdown.*.total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'delivery_estimate' => 'nullable|string|max:255',
            'payment_terms' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $quote, $request, $user) {
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
                'message' => "Quote #{$quote->quote_number} for RFQ #{$quote->rfq->rfq_number} has been updated.",
                'is_read' => false,
            ]);
        });

        return redirect()
            ->route('supplier.rfqs.my-quotes')
            ->with('success', 'Quote updated successfully.');
    }

    /**
     * List all quotes sent by supplier.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function myQuotes(Request $request)
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

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                    ->orWhereHas('rfq', function ($rfqQuery) use ($search) {
                        $rfqQuery->where('rfq_number', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%");
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
            'pending' => RfqQuote::where('supplier_id', $user->id)->where('status', 'pending')->count(),
            'accepted' => RfqQuote::where('supplier_id', $user->id)->where('status', 'accepted')->count(),
            'rejected' => RfqQuote::where('supplier_id', $user->id)->where('status', 'rejected')->count(),
            'expired' => RfqQuote::where('supplier_id', $user->id)
                ->where('valid_until', '<', now())
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('Supplier/Rfqs/MyQuotes', compact('quotes', 'stats'));
    }

    /**
     * Check if supplier can quote on RFQ.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  \App\Models\Rfq  $rfq
     * @return bool
     */
    private function canQuoteOnRfq($supplier, $rfq)
    {
        // Check if RFQ is open
        if (!$rfq->isOpen() || $rfq->required_by_date->isPast()) {
            return false;
        }

        // Check if supplier already quoted - using user_id since RfqQuote uses supplier_id = user_id
        $existingQuote = RfqQuote::where('rfq_id', $rfq->id)
            ->where('supplier_id', $supplier->user_id)  // Using user_id here because RfqQuote.supplier_id references User.id
            ->first();

        if ($existingQuote) {
            return false;
        }

        // Check if supplier has any active products - using supplier->id because Product.supplier_id references Supplier.id
        $hasProducts = Product::where('supplier_id', $supplier->id)  // Using supplier->id here because Product.supplier_id references Supplier.id
            ->where('status', 'approved')
            ->exists();

        return $hasProducts;
    }
}
