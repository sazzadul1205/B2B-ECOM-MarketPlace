<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\RfqQuote;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the supplier dashboard.
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

        // Get date range for analytics
        $dateRange = $this->getDateRange($request);

        // Get all dashboard data
        $data = [
            'counts' => $this->getCounts($supplier, $user),
            'recent_orders' => $this->getRecentOrders($user),
            'recent_rfqs' => $this->getRecentRfqs($supplier, $user),
            'low_stock_alerts' => $this->getLowStockAlerts($supplier),
            'sales_analytics' => $this->getSalesAnalytics($user, $dateRange),
            'quote_performance' => $this->getQuotePerformance($user, $dateRange),
            'top_products' => $this->getTopProducts($supplier),
            'recent_messages' => $this->getRecentMessages($user),
            'upcoming_deliveries' => $this->getUpcomingDeliveries($user),
            'chart_data' => $this->getChartData($user, $dateRange),
        ];

        return Inertia::render('Supplier/Dashboard', $data);
    }

    /**
     * Get counts for dashboard widgets.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  \App\Models\User  $user
     * @return array
     */
    private function getCounts($supplier, $user)
    {
        // Total products
        $totalProducts = Product::where('supplier_id', $supplier->id)->count();

        // Products by status
        $activeProducts = Product::where('supplier_id', $supplier->id)
            ->where('status', 'active')
            ->count();

        $pendingProducts = Product::where('supplier_id', $supplier->id)
            ->where('status', 'pending')
            ->count();

        // Order counts
        $totalOrders = Order::where('supplier_id', $user->id)->count();

        $pendingOrders = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_PENDING_CONFIRMATION)
            ->count();

        $processingOrders = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_PROCESSING)
            ->count();

        $shippedOrders = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_SHIPPED)
            ->count();

        $deliveredOrders = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->count();

        // RFQ counts
        $openRfqs = Rfq::where('status', 'open')
            ->where('required_by_date', '>=', now())
            ->count();

        // Quote counts
        $totalQuotes = RfqQuote::where('supplier_id', $user->id)->count();

        $pendingQuotes = RfqQuote::where('supplier_id', $user->id)
            ->where('status', 'pending')
            ->where('valid_until', '>=', now())
            ->count();

        $acceptedQuotes = RfqQuote::where('supplier_id', $user->id)
            ->where('status', 'accepted')
            ->count();

        // Revenue
        $totalRevenue = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->sum('total_amount');

        $monthlyRevenue = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        // Messages
        $unreadMessages = Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        return compact(
            'totalProducts',
            'activeProducts',
            'pendingProducts',
            'totalOrders',
            'pendingOrders',
            'processingOrders',
            'shippedOrders',
            'deliveredOrders',
            'openRfqs',
            'totalQuotes',
            'pendingQuotes',
            'acceptedQuotes',
            'totalRevenue',
            'monthlyRevenue',
            'unreadMessages'
        );
    }

    /**
     * Get recent orders.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getRecentOrders($user)
    {
        return Order::where('supplier_id', $user->id)
            ->with(['buyer', 'items'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
    }

    /**
     * Get recent RFQs that match supplier's categories.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  \App\Models\User  $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getRecentRfqs($supplier, $user)
    {
        // Get supplier's product categories
        $supplierCategories = Product::where('supplier_id', $supplier->id)
            ->where('status', 'active')
            ->distinct()
            ->pluck('category')
            ->toArray();

        $query = Rfq::where('status', 'open')
            ->where('required_by_date', '>=', now())
            ->with('buyer');

        // Filter by categories if supplier has products
        if (!empty($supplierCategories)) {
            $query->where(function ($q) use ($supplierCategories) {
                foreach ($supplierCategories as $category) {
                    $q->orWhereJsonContains('products_requested', ['category' => $category]);
                }
            });
        }

        // Exclude RFQs that supplier already quoted
        $quotedRfqIds = RfqQuote::where('supplier_id', $user->id)
            ->pluck('rfq_id')
            ->toArray();

        if (!empty($quotedRfqIds)) {
            $query->whereNotIn('id', $quotedRfqIds);
        }

        return $query->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
    }

    /**
     * Get low stock alerts.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getLowStockAlerts($supplier)
    {
        return Product::where('supplier_id', $supplier->id)
            ->where('status', 'active')
            ->where('stock_quantity', '<=', 10) // Threshold for low stock
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity', 'asc')
            ->take(10)
            ->get();
    }

    /**
     * Get sales analytics.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return array
     */
    private function getSalesAnalytics($user, $dateRange)
    {
        $sales = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalSales = $sales->sum('order_count');
        $totalRevenue = $sales->sum('revenue');

        // Calculate period-over-period growth
        $previousPeriod = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [
                $dateRange['previous_start'],
                $dateRange['previous_end']
            ])
            ->select(
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->first();

        $growth = [
            'orders' => $previousPeriod && $previousPeriod->order_count > 0
                ? (($totalSales - $previousPeriod->order_count) / $previousPeriod->order_count) * 100
                : 100,
            'revenue' => $previousPeriod && $previousPeriod->revenue > 0
                ? (($totalRevenue - $previousPeriod->revenue) / $previousPeriod->revenue) * 100
                : 100,
        ];

        return compact('sales', 'totalSales', 'totalRevenue', 'growth');
    }

    /**
     * Get quote performance metrics.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return array
     */
    private function getQuotePerformance($user, $dateRange)
    {
        $quotes = RfqQuote::where('supplier_id', $user->id)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        $totalQuotes = $quotes->count();
        $acceptedQuotes = $quotes->where('status', 'accepted')->count();
        $rejectedQuotes = $quotes->where('status', 'rejected')->count();
        $pendingQuotes = $quotes->where('status', 'pending')->count();

        $acceptanceRate = $totalQuotes > 0
            ? ($acceptedQuotes / $totalQuotes) * 100
            : 0;

        // Average response time (hours)
        $averageResponseTime = $quotes->filter(function ($quote) {
            return $quote->rfq && $quote->created_at;
        })->avg(function ($quote) {
            return $quote->created_at->diffInHours($quote->rfq->created_at);
        });

        return compact(
            'totalQuotes',
            'acceptedQuotes',
            'rejectedQuotes',
            'pendingQuotes',
            'acceptanceRate',
            'averageResponseTime'
        );
    }

    /**
     * Get top selling products.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getTopProducts($supplier)
    {
        return Product::where('supplier_id', $supplier->id)
            ->withCount(['orderItems as total_quantity_sold' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->withSum(['orderItems as total_revenue' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(total_price), 0)'));
            }], 'total_price')
            ->where('status', 'active')
            ->orderBy('total_quantity_sold', 'desc')
            ->take(5)
            ->get();
    }

    /**
     * Get recent messages.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getRecentMessages($user)
    {
        return Message::where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->with(['sender', 'receiver', 'rfq'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
    }

    /**
     * Get upcoming deliveries - FIXED: Removed estimated_delivery column
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getUpcomingDeliveries($user)
    {
        // Using confirmed_at as delivery date since estimated_delivery doesn't exist
        return Order::where('supplier_id', $user->id)
            ->whereIn('order_status', [Order::STATUS_PROCESSING, Order::STATUS_SHIPPED, Order::STATUS_CONFIRMED])
            ->whereNotNull('confirmed_at')
            ->with('buyer')
            ->orderBy('confirmed_at', 'asc')
            ->take(5)
            ->get()
            ->map(function ($order) {
                // Add a virtual estimated_delivery attribute for template compatibility
                $order->estimated_delivery = $order->confirmed_at;
                return $order;
            });
    }

    /**
     * Get chart data for analytics.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return array
     */
    private function getChartData($user, $dateRange)
    {
        // Daily sales for the period
        $dailySales = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(total_amount), 0) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Orders by status
        $ordersByStatus = Order::where('supplier_id', $user->id)
            ->select('order_status', DB::raw('COUNT(*) as count'))
            ->groupBy('order_status')
            ->get()
            ->pluck('count', 'order_status')
            ->toArray();

        // Ensure all statuses exist in the array
        $allStatuses = [
            Order::STATUS_PENDING_CONFIRMATION,
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
            Order::STATUS_SHIPPED,
            Order::STATUS_DELIVERED,
            Order::STATUS_CANCELLED
        ];

        foreach ($allStatuses as $status) {
            if (!isset($ordersByStatus[$status])) {
                $ordersByStatus[$status] = 0;
            }
        }

        // Quotes by status
        $quotesByStatus = RfqQuote::where('supplier_id', $user->id)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all quote statuses exist
        $quoteStatuses = ['pending', 'accepted', 'rejected'];
        foreach ($quoteStatuses as $status) {
            if (!isset($quotesByStatus[$status])) {
                $quotesByStatus[$status] = 0;
            }
        }

        // Top buyers
        $topBuyers = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->select(
                'buyer_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total_spent')
            )
            ->with('buyer')
            ->groupBy('buyer_id')
            ->orderBy('total_spent', 'desc')
            ->take(5)
            ->get();

        // Monthly performance for the year
        $monthlyPerformance = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereYear('created_at', now()->year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COALESCE(SUM(total_amount), 0) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'daily_sales' => $dailySales,
            'orders_by_status' => $ordersByStatus,
            'quotes_by_status' => $quotesByStatus,
            'top_buyers' => $topBuyers,
            'monthly_performance' => $monthlyPerformance,
        ];
    }

    /**
     * Get date range for analytics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    private function getDateRange($request)
    {
        $period = $request->get('period', 'month');

        switch ($period) {
            case 'week':
                $start = now()->startOfWeek();
                $end = now()->endOfWeek();
                $previousStart = now()->subWeek()->startOfWeek();
                $previousEnd = now()->subWeek()->endOfWeek();
                break;
            case 'month':
                $start = now()->startOfMonth();
                $end = now()->endOfMonth();
                $previousStart = now()->subMonth()->startOfMonth();
                $previousEnd = now()->subMonth()->endOfMonth();
                break;
            case 'quarter':
                $start = now()->startOfQuarter();
                $end = now()->endOfQuarter();
                $previousStart = now()->subQuarter()->startOfQuarter();
                $previousEnd = now()->subQuarter()->endOfQuarter();
                break;
            case 'year':
                $start = now()->startOfYear();
                $end = now()->endOfYear();
                $previousStart = now()->subYear()->startOfYear();
                $previousEnd = now()->subYear()->endOfYear();
                break;
            default:
                $start = now()->startOfMonth();
                $end = now()->endOfMonth();
                $previousStart = now()->subMonth()->startOfMonth();
                $previousEnd = now()->subMonth()->endOfMonth();
        }

        return [
            'period' => $period,
            'start' => $start,
            'end' => $end,
            'previous_start' => $previousStart,
            'previous_end' => $previousEnd,
        ];
    }

    /**
     * Export dashboard data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        $user = Auth::user();

        $dateRange = $this->getDateRange($request);

        $data = [
            'orders' => Order::where('supplier_id', $user->id)
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->with('buyer')
                ->get(),
            'quotes' => RfqQuote::where('supplier_id', $user->id)
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->with('rfq.buyer')
                ->get(),
            'products' => Product::where('supplier_id', $user->supplier->id)
                ->withCount('orderItems')
                ->get(),
        ];

        // Generate CSV report
        $filename = 'dashboard-export-' . now()->format('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w+');

        // Add summary section
        fputcsv($handle, ['DASHBOARD EXPORT', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period', $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
        fputcsv($handle, []);

        // Orders section
        fputcsv($handle, ['ORDERS']);
        fputcsv($handle, ['Order Number', 'Buyer', 'Amount', 'Status', 'Date']);
        foreach ($data['orders'] as $order) {
            fputcsv($handle, [
                $order->order_number,
                $order->buyer->name,
                $order->total_amount,
                $order->order_status,
                $order->created_at->format('Y-m-d'),
            ]);
        }

        fputcsv($handle, []);

        // Quotes section
        fputcsv($handle, ['QUOTES']);
        fputcsv($handle, ['Quote Number', 'RFQ', 'Buyer', 'Amount', 'Status', 'Date']);
        foreach ($data['quotes'] as $quote) {
            fputcsv($handle, [
                $quote->quote_number,
                $quote->rfq->rfq_number,
                $quote->rfq->buyer->name,
                $quote->total_amount,
                $quote->status,
                $quote->created_at->format('Y-m-d'),
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
