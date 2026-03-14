<?php
// app/Http/Controllers/Admin/OrderManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Supplier;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderManagementController extends Controller
{
    /**
     * Display a listing of all orders.
     */
    public function index(Request $request)
    {
        $query = Order::with([
            'buyer:id,name,email',
            'supplier:id,name,email',
            'items',
            'rfq'
        ]);

        // Filter by order status
        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by supplier
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by buyer
        if ($request->filled('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }

        // Search by order number or customer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('shipping_address', 'like', "%{$search}%")
                    ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                        $buyerQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Amount range filter
        if ($request->filled('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }
        if ($request->filled('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $orders = $query->paginate(15)
            ->appends($request->query());

        // Get statistics
        $stats = [
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            'pending_orders' => Order::where('order_status', 'pending_confirmation')->count(),
            'processing_orders' => Order::where('order_status', 'processing')->count(),
            'shipped_orders' => Order::where('order_status', 'shipped')->count(),
            'delivered_orders' => Order::where('order_status', 'delivered')->count(),
            'cancelled_orders' => Order::where('order_status', 'cancelled')->count(),
            'paid_orders' => Order::where('payment_status', 'paid')->count(),
            'unpaid_orders' => Order::where('payment_status', 'pending')->count(),
        ];

        // Get suppliers for filter
        $suppliers = User::where('role', 'supplier')
            ->select('id', 'name')
            ->get();

        // Get buyers for filter
        $buyers = User::where('role', 'buyer')
            ->select('id', 'name')
            ->get();

        // Order status options
        $orderStatuses = [
            'pending_confirmation' => 'Pending Confirmation',
            'confirmed' => 'Confirmed',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
        ];

        // Payment status options
        $paymentStatuses = [
            'pending' => 'Pending',
            'paid' => 'Paid',
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'suppliers' => $suppliers,
            'buyers' => $buyers,
            'orderStatuses' => $orderStatuses,
            'paymentStatuses' => $paymentStatuses,
            'filters' => $request->only([
                'search',
                'order_status',
                'payment_status',
                'supplier_id',
                'buyer_id',
                'date_from',
                'date_to',
                'min_amount',
                'max_amount',
                'sort_field',
                'sort_direction'
            ]),
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show($id)
    {
        $order = Order::with([
            'buyer:id,name,email',
            'supplier:id,name,email',
            'items.product',
            'rfq',
            'quote'
        ])
            ->findOrFail($id);

        // Get order timeline
        $timeline = $this->getOrderTimeline($order);

        // Get payment information
        $paymentInfo = $this->getPaymentInfo($order);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'timeline' => $timeline,
            'paymentInfo' => $paymentInfo,
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'order_status' => 'required|in:pending_confirmation,confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);

        $oldStatus = $order->order_status;
        $newStatus = $request->order_status;

        DB::transaction(function () use ($order, $newStatus, $oldStatus, $request) {
            $order->update([
                'order_status' => $newStatus,
                'status_updated_at' => now(),
                'status_updated_by' => auth()->id(),
            ]);

            // If status is confirmed, set confirmed_at
            if ($newStatus === 'confirmed' && !$order->confirmed_at) {
                $order->update(['confirmed_at' => now()]);
            }

            // Log status change
            $this->logStatusChange($order, $oldStatus, $newStatus, $request->notes);

            // Send notification based on status
            $this->sendOrderStatusNotification($order, $newStatus, $request->notes);
        });

        return back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Update payment status.
     */
    public function updatePayment(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid',
            'payment_method' => 'nullable|string|max:50',
            'payment_reference' => 'nullable|string|max:100',
            'payment_notes' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);

        DB::transaction(function () use ($order, $request) {
            $order->update([
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'payment_updated_at' => now(),
                'payment_updated_by' => auth()->id(),
            ]);

            // If payment is marked as paid, update payment date
            if ($request->payment_status === 'paid') {
                $order->update(['paid_at' => now()]);
            }

            // Send payment notification
            $this->sendPaymentNotification($order, $request->payment_status);
        });

        return back()->with('success', 'Payment status updated successfully.');
    }

    /**
     * Cancel order.
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
            'refund_required' => 'boolean',
        ]);

        $order = Order::findOrFail($id);

        if (!$order->canBeCancelled()) {
            return back()->withErrors(['error' => 'This order cannot be cancelled at its current status.']);
        }

        DB::transaction(function () use ($order, $request) {
            $order->update([
                'order_status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => auth()->id(),
                'cancellation_reason' => $request->cancellation_reason,
            ]);

            // Process refund if required and payment was made
            if ($request->refund_required && $order->payment_status === 'paid') {
                $this->processRefund($order);
            }

            // Restore stock if items were deducted
            $this->restoreStock($order);

            // Send cancellation notification
            $this->sendCancellationNotification($order, $request->cancellation_reason);
        });

        return back()->with('success', 'Order has been cancelled successfully.');
    }

    /**
     * Get orders for a specific supplier.
     */
    public function supplierOrders(Request $request, $supplierId)
    {
        $supplier = User::where('role', 'supplier')->findOrFail($supplierId);

        $orders = Order::with(['buyer', 'items'])
            ->where('supplier_id', $supplierId)
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Orders/SupplierOrders', [
            'supplier' => $supplier,
            'orders' => $orders,
        ]);
    }

    /**
     * Get orders for a specific buyer.
     */
    public function buyerOrders(Request $request, $buyerId)
    {
        $buyer = User::where('role', 'buyer')->findOrFail($buyerId);

        $orders = Order::with(['supplier', 'items'])
            ->where('buyer_id', $buyerId)
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Orders/BuyerOrders', [
            'buyer' => $buyer,
            'orders' => $orders,
        ]);
    }

    /**
     * Export orders.
     */
    public function export(Request $request)
    {
        $query = Order::with(['buyer', 'supplier', 'items']);

        // Apply filters (similar to index)
        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
        }

        $orders = $query->get();

        // Generate CSV
        $csvData = [];
        $csvData[] = [
            'Order Number',
            'Buyer',
            'Supplier',
            'Total Amount',
            'Order Status',
            'Payment Status',
            'Items Count',
            'Order Date',
            'Shipping Address'
        ];

        foreach ($orders as $order) {
            $csvData[] = [
                $order->order_number,
                $order->buyer->name,
                $order->supplier->name,
                $order->total_amount,
                $order->order_status,
                $order->payment_status,
                $order->items->count(),
                $order->created_at->format('Y-m-d H:i:s'),
                $order->shipping_address,
            ];
        }

        $filename = 'orders-' . date('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w');

        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get order statistics.
     */
    public function statistics()
    {
        $stats = [
            'daily' => Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'by_status' => Order::select('order_status', DB::raw('COUNT(*) as total'))
                ->groupBy('order_status')
                ->get(),
            'by_payment' => Order::select('payment_status', DB::raw('COUNT(*) as total'))
                ->groupBy('payment_status')
                ->get(),
            'top_products' => OrderItem::select(
                'product_name',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_revenue')
            )
                ->groupBy('product_name')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get(),
            'top_buyers' => Order::select(
                'buyer_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent')
            )
                ->with('buyer:id,name')
                ->groupBy('buyer_id')
                ->orderBy('total_spent', 'desc')
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('Admin/Orders/Statistics', [
            'stats' => $stats,
        ]);
    }

    /**
     * Private helper methods
     */
    private function getOrderTimeline($order)
    {
        $timeline = [];

        if ($order->created_at) {
            $timeline[] = [
                'status' => 'Order Placed',
                'date' => $order->created_at->format('Y-m-d H:i:s'),
                'completed' => true,
            ];
        }

        if ($order->confirmed_at) {
            $timeline[] = [
                'status' => 'Order Confirmed',
                'date' => $order->confirmed_at->format('Y-m-d H:i:s'),
                'completed' => true,
            ];
        }

        $statuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        foreach ($statuses as $status) {
            $statusField = $status . '_at';
            if ($order->$statusField) {
                $timeline[] = [
                    'status' => ucfirst($status),
                    'date' => $order->$statusField->format('Y-m-d H:i:s'),
                    'completed' => true,
                ];
            }
        }

        return $timeline;
    }

    private function getPaymentInfo($order)
    {
        return [
            'status' => $order->payment_status,
            'method' => $order->payment_method ?? 'Not specified',
            'reference' => $order->payment_reference ?? 'N/A',
            'paid_at' => $order->paid_at ? $order->paid_at->format('Y-m-d H:i:s') : null,
        ];
    }

    private function logStatusChange($order, $oldStatus, $newStatus, $notes)
    {
        // Log to order_status_history table
        // OrderStatusHistory::create([
        //     'order_id' => $order->id,
        //     'old_status' => $oldStatus,
        //     'new_status' => $newStatus,
        //     'notes' => $notes,
        //     'changed_by' => auth()->id(),
        // ]);
    }

    private function sendOrderStatusNotification($order, $status, $notes)
    {
        // Mail::to($order->buyer->email)->send(new OrderStatusMail($order, $status, $notes));
    }

    private function sendPaymentNotification($order, $status)
    {
        // Mail::to($order->buyer->email)->send(new PaymentStatusMail($order, $status));
    }

    private function sendCancellationNotification($order, $reason)
    {
        // Mail::to($order->buyer->email)->send(new OrderCancelledMail($order, $reason));
        // Mail::to($order->supplier->email)->send(new OrderCancelledMail($order, $reason));
    }

    private function processRefund($order)
    {
        // Process refund logic
        // Update payment status to refunded
        // Create refund record
    }

    private function restoreStock($order)
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }
    }
}
