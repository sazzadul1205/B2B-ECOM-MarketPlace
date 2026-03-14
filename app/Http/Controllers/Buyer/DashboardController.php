<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Rfq;
use App\Models\Order;
use App\Models\RfqQuote;
use App\Models\Message;
use App\Models\Supplier;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the buyer dashboard.
     */
    public function index()
    {
        $userId = Auth::id();

        // Get recent RFQs
        $recentRfqs = Rfq::where('buyer_id', $userId)
            ->withCount('quotes')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent orders
        $recentOrders = Order::where('buyer_id', $userId)
            ->with('supplier')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent quotes received
        $recentQuotes = RfqQuote::whereHas('rfq', function ($q) use ($userId) {
            $q->where('buyer_id', $userId);
        })
            ->with(['supplier', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get unread messages count
        $unreadMessages = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        // Get recent messages
        $recentMessages = Message::where('receiver_id', $userId)
            ->orWhere('sender_id', $userId)
            ->with(['sender', 'receiver', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->unique(function ($message) use ($userId) {
                $otherUserId = $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
                return $otherUserId . '-' . ($message->rfq_id ?? 'general');
            })
            ->values()
            ->take(5);

        // Get dashboard statistics
        $statistics = $this->getStatistics($userId);

        // Get chart data for RFQ and Order activity
        $chartData = $this->getChartData($userId);

        // Get recent activity feed
        $recentActivity = $this->getRecentActivity($userId);

        // Get saved suppliers count
        $savedSuppliersCount = $this->getSavedSuppliersCount($userId);

        // Get pending actions
        $pendingActions = $this->getPendingActions($userId);

        return Inertia::render('Buyer/Dashboard', compact(
            'recentRfqs',
            'recentOrders',
            'recentQuotes',
            'unreadMessages',
            'recentMessages',
            'statistics',
            'chartData',
            'recentActivity',
            'savedSuppliersCount',
            'pendingActions'
        ));
    }

    /**
     * Get dashboard statistics.
     */
    private function getStatistics($userId)
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Current month stats
        $rfqsThisMonth = Rfq::where('buyer_id', $userId)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();

        $ordersThisMonth = Order::where('buyer_id', $userId)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();

        $quotesThisMonth = RfqQuote::whereHas('rfq', function ($q) use ($userId) {
            $q->where('buyer_id', $userId);
        })
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();

        // Last month stats for comparison
        $rfqsLastMonth = Rfq::where('buyer_id', $userId)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        $ordersLastMonth = Order::where('buyer_id', $userId)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        // Calculate spending
        $totalSpent = Order::where('buyer_id', $userId)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->sum('total_amount');

        $monthlySpent = Order::where('buyer_id', $userId)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->sum('total_amount');

        return [
            'total_rfqs' => Rfq::where('buyer_id', $userId)->count(),
            'active_rfqs' => Rfq::where('buyer_id', $userId)->where('status', 'open')->count(),
            'total_orders' => Order::where('buyer_id', $userId)->count(),
            'pending_orders' => Order::where('buyer_id', $userId)
                ->whereIn('order_status', [Order::STATUS_PENDING_CONFIRMATION, Order::STATUS_CONFIRMED, Order::STATUS_PROCESSING])
                ->count(),
            'delivered_orders' => Order::where('buyer_id', $userId)
                ->where('order_status', Order::STATUS_DELIVERED)
                ->count(),
            'total_quotes' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', $userId))->count(),
            'pending_quotes' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', $userId))
                ->where('status', 'pending')
                ->where('valid_until', '>=', now())
                ->count(),
            'total_spent' => $totalSpent,
            'monthly_spent' => $monthlySpent,
            'rfqs_this_month' => $rfqsThisMonth,
            'orders_this_month' => $ordersThisMonth,
            'quotes_this_month' => $quotesThisMonth,
            'rfqs_last_month' => $rfqsLastMonth,
            'orders_last_month' => $ordersLastMonth,
            'rfq_change' => $this->calculatePercentageChange($rfqsLastMonth, $rfqsThisMonth),
            'order_change' => $this->calculatePercentageChange($ordersLastMonth, $ordersThisMonth),
        ];
    }

    /**
     * Get chart data for activity visualization.
     */
    private function getChartData($userId)
    {
        $months = collect();
        $rfqData = collect();
        $orderData = collect();
        $quoteData = collect();

        // Get data for last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $months->push($month->format('M Y'));

            // RFQs created
            $rfqData->push(Rfq::where('buyer_id', $userId)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count());

            // Orders created
            $orderData->push(Order::where('buyer_id', $userId)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count());

            // Quotes received
            $quoteData->push(RfqQuote::whereHas('rfq', function ($q) use ($userId, $startOfMonth, $endOfMonth) {
                $q->where('buyer_id', $userId)
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            })
                ->count());
        }

        return [
            'labels' => $months,
            'rfqs' => $rfqData,
            'orders' => $orderData,
            'quotes' => $quoteData,
        ];
    }

    /**
     * Get recent activity feed.
     */
    private function getRecentActivity($userId)
    {
        $activities = collect();

        // RFQ activities
        $rfqActivities = Rfq::where('buyer_id', $userId)
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($rfq) {
                return [
                    'type' => 'rfq',
                    'action' => 'created_rfq',
                    'title' => $rfq->title,
                    'reference' => $rfq->rfq_number,
                    'status' => $rfq->status,
                    'time' => $rfq->created_at,
                    'url' => route('buyer.rfqs.show', $rfq),
                ];
            });

        $activities = $activities->concat($rfqActivities);

        // Order activities
        $orderActivities = Order::where('buyer_id', $userId)
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'order',
                    'action' => 'placed_order',
                    'title' => 'Order ' . $order->order_number,
                    'reference' => $order->order_number,
                    'status' => $order->order_status,
                    'amount' => $order->total_amount,
                    'time' => $order->created_at,
                    'url' => route('buyer.orders.show', $order),
                ];
            });

        $activities = $activities->concat($orderActivities);

        // Quote activities
        $quoteActivities = RfqQuote::whereHas('rfq', function ($q) use ($userId) {
            $q->where('buyer_id', $userId);
        })
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($quote) {
                return [
                    'type' => 'quote',
                    'action' => 'received_quote',
                    'title' => 'Quote from ' . ($quote->supplier->name ?? 'Supplier'),
                    'reference' => $quote->quote_number,
                    'status' => $quote->status,
                    'amount' => $quote->total_amount,
                    'time' => $quote->created_at,
                    'url' => route('buyer.quotes.show', $quote),
                ];
            });

        $activities = $activities->concat($quoteActivities);

        // Sort by time and take latest 10
        return $activities->sortByDesc('time')->values()->take(10);
    }

    /**
     * Get saved suppliers count.
     */
    private function getSavedSuppliersCount($userId)
    {
        // Implement based on your saved suppliers mechanism
        // return DB::table('saved_suppliers')->where('buyer_id', $userId)->count();

        // For now, return count of distinct suppliers from interactions
        $suppliersFromQuotes = RfqQuote::whereHas('rfq', function ($q) use ($userId) {
            $q->where('buyer_id', $userId);
        })->distinct('supplier_id')->count('supplier_id');

        $suppliersFromOrders = Order::where('buyer_id', $userId)
            ->distinct('supplier_id')
            ->count('supplier_id');

        return max($suppliersFromQuotes, $suppliersFromOrders);
    }

    /**
     * Get pending actions that need buyer's attention.
     */
    private function getPendingActions($userId)
    {
        $actions = [];

        // Pending quotes to review
        $pendingQuotes = RfqQuote::whereHas('rfq', function ($q) use ($userId) {
            $q->where('buyer_id', $userId);
        })
            ->where('status', 'pending')
            ->where('valid_until', '>=', now())
            ->count();

        if ($pendingQuotes > 0) {
            $actions[] = [
                'type' => 'quotes',
                'message' => "You have {$pendingQuotes} pending quote(s) to review",
                'url' => route('buyer.quotes.index', ['status' => 'pending']),
                'priority' => 'high',
            ];
        }

        // Orders pending confirmation
        $pendingOrders = Order::where('buyer_id', $userId)
            ->where('order_status', Order::STATUS_PENDING_CONFIRMATION)
            ->count();

        if ($pendingOrders > 0) {
            $actions[] = [
                'type' => 'orders',
                'message' => "You have {$pendingOrders} order(s) pending confirmation",
                'url' => route('buyer.orders.index', ['status' => Order::STATUS_PENDING_CONFIRMATION]),
                'priority' => 'high',
            ];
        }

        // Unread messages
        $unreadMessages = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        if ($unreadMessages > 0) {
            $actions[] = [
                'type' => 'messages',
                'message' => "You have {$unreadMessages} unread message(s)",
                'url' => route('buyer.messages.index'),
                'priority' => 'medium',
            ];
        }

        // RFQs nearing required by date
        $urgentRfqs = Rfq::where('buyer_id', $userId)
            ->where('status', 'open')
            ->where('required_by_date', '<=', now()->addDays(7))
            ->count();

        if ($urgentRfqs > 0) {
            $actions[] = [
                'type' => 'rfqs',
                'message' => "{$urgentRfqs} RFQ(s) have approaching required dates",
                'url' => route('buyer.rfqs.index', ['status' => 'open']),
                'priority' => 'medium',
            ];
        }

        // Sort actions by priority
        $priorityOrder = ['high' => 1, 'medium' => 2, 'low' => 3];
        usort($actions, function ($a, $b) use ($priorityOrder) {
            return $priorityOrder[$a['priority']] <=> $priorityOrder[$b['priority']];
        });

        return $actions;
    }

    /**
     * Get dashboard summary (AJAX endpoint for real-time updates).
     */
    public function summary()
    {
        $userId = Auth::id();

        $summary = [
            'statistics' => $this->getStatistics($userId),
            'pending_actions' => $this->getPendingActions($userId),
            'unread_messages' => Message::where('receiver_id', $userId)->where('is_read', false)->count(),
            'recent_activity' => $this->getRecentActivity($userId)->take(5),
        ];

        return response()->json($summary);
    }

    /**
     * Get quick stats for dashboard widgets.
     */
    public function quickStats()
    {
        $userId = Auth::id();

        $stats = [
            'rfqs' => [
                'total' => Rfq::where('buyer_id', $userId)->count(),
                'open' => Rfq::where('buyer_id', $userId)->where('status', 'open')->count(),
            ],
            'quotes' => [
                'total' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', $userId))->count(),
                'pending' => RfqQuote::whereHas('rfq', fn($q) => $q->where('buyer_id', $userId))
                    ->where('status', 'pending')
                    ->where('valid_until', '>=', now())
                    ->count(),
            ],
            'orders' => [
                'total' => Order::where('buyer_id', $userId)->count(),
                'processing' => Order::where('buyer_id', $userId)
                    ->whereIn('order_status', [Order::STATUS_PROCESSING, Order::STATUS_CONFIRMED])
                    ->count(),
                'delivered' => Order::where('buyer_id', $userId)
                    ->where('order_status', Order::STATUS_DELIVERED)
                    ->count(),
            ],
            'messages' => [
                'unread' => Message::where('receiver_id', $userId)->where('is_read', false)->count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Calculate percentage change between two values.
     */
    private function calculatePercentageChange($old, $new)
    {
        if ($old == 0) {
            return $new > 0 ? '+100' : '0';
        }

        $change = (($new - $old) / $old) * 100;
        return ($change > 0 ? '+' : '') . round($change, 1);
    }

    /**
     * Get recent products viewed by buyer.
     * Implement if you have a product view tracking system.
     */
    private function getRecentProducts($userId)
    {
        // Return empty collection for now
        return collect([]);
    }

    /**
     * Get recommended suppliers based on buyer's activity.
     */
    private function getRecommendedSuppliers($userId)
    {
        // Get categories the buyer has shown interest in
        $interestedCategories = Rfq::where('buyer_id', $userId)
            ->where('status', 'closed')
            ->latest()
            ->limit(5)
            ->get()
            ->flatMap(function ($rfq) {
                return collect($rfq->products_requested)->pluck('category');
            })
            ->unique()
            ->take(3);

        if ($interestedCategories->isEmpty()) {
            return collect([]);
        }

        // Find suppliers with products in these categories
        $recommendedSuppliers = Supplier::where('verification_status', 'verified')
            ->whereHas('products', function ($q) use ($interestedCategories) {
                $q->whereIn('category', $interestedCategories)
                    ->where('status', 'active');
            })
            ->with('user')
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return $recommendedSuppliers;
    }
}
