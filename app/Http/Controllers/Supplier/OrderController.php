<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Message;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of incoming orders with filters.
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

        // Build query for orders where this user is the supplier
        $query = Order::where('supplier_id', $user->id)
            ->with(['buyer', 'rfq', 'items.product']);

        // Filter by order status
        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by order number or buyer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                        $buyerQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Sort orders
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Get orders with pagination
        $orders = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Order::where('supplier_id', $user->id)->count(),
            'pending_confirmation' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_PENDING_CONFIRMATION)
                ->count(),
            'processing' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_PROCESSING)
                ->count(),
            'shipped' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_SHIPPED)
                ->count(),
            'delivered' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_DELIVERED)
                ->count(),
            'cancelled' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_CANCELLED)
                ->count(),
            'total_revenue' => Order::where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_DELIVERED)
                ->sum('total_amount'),
            'pending_payment' => Order::where('supplier_id', $user->id)
                ->where('payment_status', Order::PAYMENT_PENDING)
                ->count(),
        ];

        // Get order statuses for filter
        $orderStatuses = [
            Order::STATUS_PENDING_CONFIRMATION => 'Pending Confirmation',
            Order::STATUS_CONFIRMED => 'Confirmed',
            Order::STATUS_PROCESSING => 'Processing',
            Order::STATUS_SHIPPED => 'Shipped',
            Order::STATUS_DELIVERED => 'Delivered',
            Order::STATUS_CANCELLED => 'Cancelled',
        ];

        // Get payment statuses for filter
        $paymentStatuses = [
            Order::PAYMENT_PENDING => 'Pending',
            Order::PAYMENT_PAID => 'Paid',
        ];

        return Inertia::render('Supplier/Orders/Index', compact(
            'orders',
            'stats',
            'orderStatuses',
            'paymentStatuses'
        ));
    }

    /**
     * Display the specified order details.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = Order::where('supplier_id', $user->id)
            ->with([
                'buyer',
                'rfq',
                'items.product',
                'quote'
            ])
            ->findOrFail($id);

        // Get message history related to this order
        $messages = Message::where('rfq_id', $order->rfq_id)
            ->where(function ($query) use ($user, $order) {
                $query->where(function ($q) use ($user, $order) {
                    $q->where('sender_id', $user->id)
                        ->where('receiver_id', $order->buyer_id);
                })->orWhere(function ($q) use ($user, $order) {
                    $q->where('sender_id', $order->buyer_id)
                        ->where('receiver_id', $user->id);
                });
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Get order timeline
        $timeline = $this->getOrderTimeline($order);

        // Check if order can be cancelled
        $canCancel = $order->canBeCancelled();

        // Get available status transitions
        $availableStatuses = $this->getAvailableStatusTransitions($order);

        return Inertia::render('Supplier/Orders/Show', compact(
            'order',
            'messages',
            'timeline',
            'canCancel',
            'availableStatuses'
        ));
    }

    /**
     * Update the order status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();

        $order = Order::where('supplier_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'order_status' => 'required|in:' . implode(',', [
                Order::STATUS_PROCESSING,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED
            ]),
            'tracking_number' => 'nullable|string|max:255|required_if:order_status,' . Order::STATUS_SHIPPED,
            'shipping_carrier' => 'nullable|string|max:255|required_if:order_status,' . Order::STATUS_SHIPPED,
            'estimated_delivery' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($order, $validated, $user) {
            $oldStatus = $order->order_status;
            $newStatus = $validated['order_status'];

            // Update order status
            $order->order_status = $newStatus;

            // Add shipping information if status is shipped
            if ($newStatus === Order::STATUS_SHIPPED) {
                $order->tracking_number = $validated['tracking_number'];
                $order->shipping_carrier = $validated['shipping_carrier'];
                $order->shipped_at = now();

                if (isset($validated['estimated_delivery'])) {
                    $order->estimated_delivery = $validated['estimated_delivery'];
                }
            }

            // Set delivered at if status is delivered
            if ($newStatus === Order::STATUS_DELIVERED) {
                $order->delivered_at = now();
            }

            $order->save();

            // Send notification to buyer via message system
            $this->sendOrderStatusMessage($order, $oldStatus, $newStatus, $validated['notes'] ?? null);
        });

        $statusMessage = $this->getStatusUpdateMessage($validated['order_status']);

        return redirect()
            ->route('supplier.orders.show', $order->id)
            ->with('success', $statusMessage);
    }

    /**
     * Confirm a new order.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function confirmOrder($id)
    {
        $user = Auth::user();

        $order = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_PENDING_CONFIRMATION)
            ->findOrFail($id);

        DB::transaction(function () use ($order, $user) {
            $order->order_status = Order::STATUS_CONFIRMED;
            $order->confirmed_at = now();
            $order->save();

            // Update the associated quote status if exists
            if ($order->quote) {
                $order->quote->update(['status' => 'accepted']);
            }

            // Send confirmation message to buyer
            $this->sendOrderConfirmationMessage($order);
        });

        return redirect()
            ->route('supplier.orders.show', $order->id)
            ->with('success', 'Order has been confirmed successfully.');
    }

    /**
     * Cancel an order if possible.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancelOrder(Request $request, $id)
    {
        $user = Auth::user();

        $order = Order::where('supplier_id', $user->id)->findOrFail($id);

        // Check if order can be cancelled
        if (!$order->canBeCancelled()) {
            return redirect()
                ->back()
                ->with('error', 'This order cannot be cancelled at its current status.');
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($order, $validated, $user) {
            $order->order_status = Order::STATUS_CANCELLED;
            $order->cancellation_reason = $validated['cancellation_reason'];
            $order->cancelled_at = now();
            $order->cancelled_by = $user->id;
            $order->save();

            // Restore stock if needed
            $this->restoreStockForCancelledOrder($order);

            // Update the associated quote status if exists
            if ($order->quote && $order->quote->isAccepted()) {
                $order->quote->update(['status' => 'pending']);
            }

            // Send cancellation message
            $this->sendOrderCancellationMessage($order, $validated['cancellation_reason']);
        });

        return redirect()
            ->route('supplier.orders.show', $order->id)
            ->with('success', 'Order has been cancelled successfully.');
    }

    /**
     * Get available status transitions for an order.
     *
     * @param  \App\Models\Order  $order
     * @return array
     */
    private function getAvailableStatusTransitions($order)
    {
        $statuses = [];

        switch ($order->order_status) {
            case Order::STATUS_CONFIRMED:
                $statuses = [
                    Order::STATUS_PROCESSING => 'Start Processing',
                ];
                break;
            case Order::STATUS_PROCESSING:
                $statuses = [
                    Order::STATUS_SHIPPED => 'Mark as Shipped',
                ];
                break;
            case Order::STATUS_SHIPPED:
                $statuses = [
                    Order::STATUS_DELIVERED => 'Mark as Delivered',
                ];
                break;
        }

        return $statuses;
    }

    /**
     * Get order timeline.
     *
     * @param  \App\Models\Order  $order
     * @return array
     */
    private function getOrderTimeline($order)
    {
        $timeline = [];

        // Order created
        $timeline[] = [
            'status' => 'Order Placed',
            'date' => $order->created_at,
            'description' => 'Order was placed by the buyer.',
            'completed' => true,
        ];

        // Order confirmed
        if ($order->confirmed_at) {
            $timeline[] = [
                'status' => 'Order Confirmed',
                'date' => $order->confirmed_at,
                'description' => 'Order was confirmed by you.',
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'Order Confirmed',
                'date' => null,
                'description' => 'Awaiting confirmation.',
                'completed' => false,
            ];
        }

        // Payment status
        $timeline[] = [
            'status' => 'Payment',
            'date' => $order->payment_status === Order::PAYMENT_PAID ? $order->updated_at : null,
            'description' => $order->payment_status === Order::PAYMENT_PAID
                ? 'Payment has been received.'
                : 'Awaiting payment.',
            'completed' => $order->payment_status === Order::PAYMENT_PAID,
        ];

        // Processing
        if (
            $order->order_status === Order::STATUS_PROCESSING ||
            in_array($order->order_status, [Order::STATUS_SHIPPED, Order::STATUS_DELIVERED])
        ) {
            $timeline[] = [
                'status' => 'Processing',
                'date' => $order->updated_at,
                'description' => 'Order is being processed.',
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'Processing',
                'date' => null,
                'description' => 'Not started yet.',
                'completed' => false,
            ];
        }

        // Shipped
        if (in_array($order->order_status, [Order::STATUS_SHIPPED, Order::STATUS_DELIVERED])) {
            $timeline[] = [
                'status' => 'Shipped',
                'date' => $order->shipped_at ?? $order->updated_at,
                'description' => $order->tracking_number
                    ? "Shipped via {$order->shipping_carrier}. Tracking: {$order->tracking_number}"
                    : 'Order has been shipped.',
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'Shipped',
                'date' => null,
                'description' => 'Not shipped yet.',
                'completed' => false,
            ];
        }

        // Delivered
        if ($order->order_status === Order::STATUS_DELIVERED) {
            $timeline[] = [
                'status' => 'Delivered',
                'date' => $order->delivered_at ?? $order->updated_at,
                'description' => 'Order has been delivered.',
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'Delivered',
                'date' => null,
                'description' => 'Awaiting delivery.',
                'completed' => false,
            ];
        }

        return $timeline;
    }

    /**
     * Restore stock for cancelled order.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    private function restoreStockForCancelledOrder($order)
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }
    }

    /**
     * Send order status update message.
     *
     * @param  \App\Models\Order  $order
     * @param  string  $oldStatus
     * @param  string  $newStatus
     * @param  string|null  $notes
     * @return void
     */
    private function sendOrderStatusMessage($order, $oldStatus, $newStatus, $notes = null)
    {
        $statusText = [
            Order::STATUS_PROCESSING => 'processing',
            Order::STATUS_SHIPPED => 'shipped',
            Order::STATUS_DELIVERED => 'delivered',
        ];

        $messageText = "Your order #{$order->order_number} status has been updated from {$oldStatus} to {$newStatus}.";

        if ($notes) {
            $messageText .= " Notes: {$notes}";
        }

        if ($newStatus === Order::STATUS_SHIPPED && $order->tracking_number) {
            $messageText .= " Tracking Number: {$order->tracking_number}";
            if ($order->shipping_carrier) {
                $messageText .= " Carrier: {$order->shipping_carrier}";
            }
        }

        Message::create([
            'sender_id' => $order->supplier_id,
            'receiver_id' => $order->buyer_id,
            'rfq_id' => $order->rfq_id,
            'message' => $messageText,
            'is_read' => false,
        ]);
    }

    /**
     * Send order confirmation message.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    private function sendOrderConfirmationMessage($order)
    {
        Message::create([
            'sender_id' => $order->supplier_id,
            'receiver_id' => $order->buyer_id,
            'rfq_id' => $order->rfq_id,
            'message' => "Your order #{$order->order_number} has been confirmed. We will start processing it soon.",
            'is_read' => false,
        ]);
    }

    /**
     * Send order cancellation message.
     *
     * @param  \App\Models\Order  $order
     * @param  string  $reason
     * @return void
     */
    private function sendOrderCancellationMessage($order, $reason)
    {
        Message::create([
            'sender_id' => $order->supplier_id,
            'receiver_id' => $order->buyer_id,
            'rfq_id' => $order->rfq_id,
            'message' => "Your order #{$order->order_number} has been cancelled. Reason: {$reason}",
            'is_read' => false,
        ]);
    }

    /**
     * Get status update message.
     *
     * @param  string  $status
     * @return string
     */
    private function getStatusUpdateMessage($status)
    {
        $messages = [
            Order::STATUS_PROCESSING => 'Order is now being processed.',
            Order::STATUS_SHIPPED => 'Order has been marked as shipped.',
            Order::STATUS_DELIVERED => 'Order has been marked as delivered.',
        ];

        return $messages[$status] ?? 'Order status updated successfully.';
    }

    /**
     * Export orders report.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        $user = Auth::user();

        $query = Order::where('supplier_id', $user->id)
            ->with(['buyer', 'items']);

        // Apply filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        $orders = $query->get();

        // Generate CSV
        $filename = 'orders-export-' . now()->format('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w+');

        // Add headers
        fputcsv($handle, [
            'Order Number',
            'Buyer Name',
            'Buyer Email',
            'Total Amount',
            'Order Status',
            'Payment Status',
            'Order Date',
            'Items Count'
        ]);

        // Add data
        foreach ($orders as $order) {
            fputcsv($handle, [
                $order->order_number,
                $order->buyer->name,
                $order->buyer->email,
                $order->total_amount,
                $order->order_status,
                $order->payment_status,
                $order->created_at->format('Y-m-d H:i:s'),
                $order->items->count()
            ]);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ]);
    }
}
