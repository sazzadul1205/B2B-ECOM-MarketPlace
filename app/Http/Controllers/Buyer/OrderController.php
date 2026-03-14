<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the user's orders.
     */
    public function index(Request $request)
    {
        $query = Order::where('buyer_id', Auth::id())
            ->with(['supplier', 'items.product', 'rfq']);

        // Filter by order status
        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number
        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Sort orders
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
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $orders = $query->paginate(10)->withQueryString();

        // Get counts for dashboard
        $counts = [
            'pending' => Order::where('buyer_id', Auth::id())->where('order_status', Order::STATUS_PENDING_CONFIRMATION)->count(),
            'processing' => Order::where('buyer_id', Auth::id())->where('order_status', Order::STATUS_PROCESSING)->count(),
            'shipped' => Order::where('buyer_id', Auth::id())->where('order_status', Order::STATUS_SHIPPED)->count(),
            'delivered' => Order::where('buyer_id', Auth::id())->where('order_status', Order::STATUS_DELIVERED)->count(),
        ];

        return Inertia::render('Buyer/Orders/Index', compact('orders', 'counts'));
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Load relationships
        $order->load([
            'supplier.supplier',
            'items.product',
            'rfq',
            'quote'
        ]);

        // Get tracking information if available
        $tracking = $this->getTrackingInfo($order);

        return Inertia::render('Buyer/Orders/Show', compact('order', 'tracking'));
    }

    /**
     * Show order confirmation page.
     */
    public function confirm(Rfq $rfq, RfqQuote $quote)
    {
        // Ensure the buyer owns this RFQ and quote is accepted
        if ($rfq->buyer_id !== Auth::id() || $quote->rfq_id !== $rfq->id || !$quote->isAccepted()) {
            abort(403);
        }

        // Check if order already exists
        if ($rfq->order) {
            return redirect()->route('buyer.orders.show', $rfq->order)
                ->with('info', 'Order already exists for this RFQ.');
        }

        return Inertia::render('Buyer/Orders/Confirm', compact('rfq', 'quote'));
    }

    /**
     * Store a newly created order from accepted quote.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rfq_id' => 'required|exists:rfqs,id',
            'quote_id' => 'required|exists:rfq_quotes,id',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
            'terms_accepted' => 'required|accepted',
        ]);

        $rfq = Rfq::findOrFail($validated['rfq_id']);
        $quote = RfqQuote::findOrFail($validated['quote_id']);

        // Verify ownership and quote status
        if ($rfq->buyer_id !== Auth::id() || $quote->rfq_id !== $rfq->id || !$quote->isAccepted()) {
            abort(403);
        }

        // Check if order already exists
        if ($rfq->order) {
            return redirect()->route('buyer.orders.show', $rfq->order)
                ->with('info', 'Order already exists for this RFQ.');
        }

        DB::beginTransaction();

        try {
            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'buyer_id' => Auth::id(),
                'supplier_id' => $quote->supplier_id,
                'rfq_id' => $rfq->id,
                'total_amount' => $quote->total_amount,
                'shipping_address' => $validated['shipping_address'],
                'payment_status' => Order::PAYMENT_PENDING,
                'order_status' => Order::STATUS_PENDING_CONFIRMATION,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items from RFQ products
            foreach ($rfq->products_requested as $product) {
                $order->items()->create([
                    'product_name' => $product['name'],
                    'quantity' => $product['quantity'],
                    'unit_price' => $this->calculateUnitPrice($quote, $product),
                    'total_price' => $this->calculateItemTotal($quote, $product),
                ]);
            }

            // IMPORTANT: Close the RFQ since an order has been created
            $rfq->update(['status' => 'closed']);

            DB::commit();

            return redirect()->route('buyer.orders.show', $order)
                ->with('success', 'Order placed successfully! Please complete payment to confirm your order.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to create order. Please try again.');
        }
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Check if order can be cancelled
        if (!$order->canBeCancelled()) {
            return back()->with('error', 'This order cannot be cancelled at its current status.');
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $order->update([
            'order_status' => Order::STATUS_CANCELLED,
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_at' => now(),
        ]);

        return redirect()->route('buyer.orders.show', $order)
            ->with('success', 'Order cancelled successfully.');
    }

    /**
     * Mark order as received (delivered).
     */
    public function markAsReceived(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Can only mark as received if status is shipped
        if ($order->order_status !== Order::STATUS_SHIPPED) {
            return back()->with('error', 'Order can only be marked as received when it is shipped.');
        }

        $order->update([
            'order_status' => Order::STATUS_DELIVERED,
            'delivered_at' => now(),
        ]);

        return redirect()->route('buyer.orders.show', $order)
            ->with('success', 'Order marked as received. Thank you for your purchase!');
    }

    /**
     * Track order (AJAX endpoint).
     */
    public function track(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        $tracking = [
            'order_number' => $order->order_number,
            'status' => $order->order_status,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at->format('Y-m-d H:i'),
            'confirmed_at' => $order->confirmed_at ? $order->confirmed_at->format('Y-m-d H:i') : null,
            'estimated_delivery' => $this->calculateEstimatedDelivery($order),
            'timeline' => $this->getOrderTimeline($order),
        ];

        return response()->json($tracking);
    }

    /**
     * Get invoice for order.
     */
    public function invoice(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['supplier', 'items', 'buyer']);

        return Inertia::render('Buyer/Orders/Invoice', compact('order'));
    }

    /**
     * Download invoice as PDF.
     */
    public function downloadInvoice(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Generate PDF invoice
        // $pdf = PDF::loadView('buyer.orders.invoice-pdf', compact('order'));

        // return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }

    /**
     * Calculate unit price for order item from quote.
     */
    private function calculateUnitPrice($quote, $product)
    {
        // This would need logic to extract product price from quote's product_breakdown
        // For now, return a placeholder calculation
        return $quote->total_amount / array_sum(array_column($quote->rfq->products_requested, 'quantity'));
    }

    /**
     * Calculate item total for order item.
     */
    private function calculateItemTotal($quote, $product)
    {
        $unitPrice = $this->calculateUnitPrice($quote, $product);
        return $unitPrice * $product['quantity'];
    }

    /**
     * Get tracking information for order.
     */
    private function getTrackingInfo($order)
    {
        if ($order->order_status === Order::STATUS_SHIPPED && $order->shipping_details) {
            return json_decode($order->shipping_details, true);
        }

        return null;
    }

    /**
     * Calculate estimated delivery date.
     */
    private function calculateEstimatedDelivery($order)
    {
        if ($order->order_status === Order::STATUS_SHIPPED) {
            return now()->addDays(3)->format('Y-m-d');
        }

        return null;
    }

    /**
     * Get order timeline.
     */
    private function getOrderTimeline($order)
    {
        $timeline = [
            [
                'status' => 'Order Placed',
                'date' => $order->created_at->format('Y-m-d H:i'),
                'completed' => true,
            ],
            [
                'status' => 'Order Confirmed',
                'date' => $order->confirmed_at ? $order->confirmed_at->format('Y-m-d H:i') : null,
                'completed' => !is_null($order->confirmed_at),
            ],
            [
                'status' => 'Processing',
                'date' => $order->processing_at ?? null,
                'completed' => in_array($order->order_status, [Order::STATUS_PROCESSING, Order::STATUS_SHIPPED, Order::STATUS_DELIVERED]),
            ],
            [
                'status' => 'Shipped',
                'date' => $order->shipped_at ?? null,
                'completed' => in_array($order->order_status, [Order::STATUS_SHIPPED, Order::STATUS_DELIVERED]),
            ],
            [
                'status' => 'Delivered',
                'date' => $order->delivered_at ?? null,
                'completed' => $order->order_status === Order::STATUS_DELIVERED,
            ],
        ];

        return $timeline;
    }


    /**
     * Place order now.
     */
    public function orderNow(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        // Load product with its supplier relationship
        $product = Product::with('supplier.user')->findOrFail($validated['product_id']);

        // Check if product has supplier
        if (!$product->supplier) {
            return back()->with('error', 'Product has no associated supplier.');
        }

        // Get the user_id from the supplier
        $supplierUserId = $product->supplier->user_id;

        if (!$supplierUserId) {
            return back()->with('error', 'Supplier has no associated user account.');
        }

        DB::beginTransaction();

        try {
            $total = $product->base_price * $validated['quantity'];

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'buyer_id' => Auth::id(),
                'supplier_id' => $supplierUserId, // This should be the USER ID, not supplier ID
                'total_amount' => $total,
                'shipping_address' => $validated['shipping_address'],
                'payment_status' => Order::PAYMENT_PENDING,
                'order_status' => Order::STATUS_PENDING_CONFIRMATION,
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $validated['quantity'],
                'unit_price' => $product->base_price,
                'total_price' => $total
            ]);

            DB::commit();

            // Load relationships for the response
            $order->load(['supplier', 'items']);

            return redirect()->route('buyer.orders.show', $order)
                ->with('success', 'Order placed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to place order: ' . $e->getMessage());
        }
    }

    /**
     * Mark order as paid (demo purpose only)
     */
    public function markAsPaid(Order $order)
    {
        // Ensure the buyer owns this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Check if order is in pending payment status
        if ($order->payment_status !== Order::PAYMENT_PENDING) {
            return back()->with('error', 'This order is not pending payment.');
        }

        $order->update([
            'payment_status' => Order::PAYMENT_PAID,
            'paid_at' => now(),
        ]);

        // If order is pending confirmation, move to confirmed after payment
        if ($order->order_status === Order::STATUS_PENDING_CONFIRMATION) {
            $order->update([
                'order_status' => Order::STATUS_CONFIRMED,
                'confirmed_at' => now(),
            ]);
        }

        // Redirect back to order show page with success message
        return redirect()->route('buyer.orders.show', $order)
            ->with('success', 'Payment completed successfully! (Demo Mode)');
    }

    /**
     * Show form to create order from RFQ and accepted quote.
     */
    public function createFromRfq(Rfq $rfq, RfqQuote $quote)
    {
        // Ensure the buyer owns this RFQ
        if ($rfq->buyer_id !== Auth::id()) {
            abort(403);
        }

        // Check if RFQ is still open
        if ($rfq->status !== 'open') {
            return redirect()->route('buyer.rfqs.show', $rfq)
                ->with('error', 'This RFQ is no longer open.');
        }

        // Ensure the quote belongs to this RFQ and is accepted
        if ($quote->rfq_id !== $rfq->id || !$quote->isAccepted()) {
            return redirect()->route('buyer.rfqs.show', $rfq)
                ->with('error', 'Invalid quote or quote is not accepted.');
        }

        // Check if order already exists for this RFQ
        if ($rfq->order) {
            return redirect()->route('buyer.orders.show', $rfq->order)
                ->with('info', 'An order already exists for this RFQ.');
        }

        // Load relationships
        $rfq->load(['buyer']);
        $quote->load(['supplier.supplier']);

        return Inertia::render('Buyer/Orders/CreateFromRfq', [
            'rfq' => $rfq,
            'quote' => $quote
        ]);
    }
}
