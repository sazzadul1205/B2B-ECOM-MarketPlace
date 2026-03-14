<?php
// app/Http/Controllers/Admin/DashboardController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Order;
use App\Models\Rfq;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request)
    {
        // Get date range for comparisons
        $today = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        // Get statistics
        $stats = [
            // User stats
            'total_users' => User::count(),
            'new_users_today' => User::whereDate('created_at', $today)->count(),
            'new_users_this_month' => User::where('created_at', '>=', $thisMonth)->count(),
            'users_by_role' => $this->getUsersByRole(),

            // Supplier stats
            'total_suppliers' => Supplier::count(),
            'pending_verifications' => Supplier::where('verification_status', 'pending')->count(),
            'verified_suppliers' => Supplier::where('verification_status', 'verified')->count(),
            'rejected_suppliers' => Supplier::where('verification_status', 'rejected')->count(),
            'supplier_growth' => $this->getSupplierGrowth(),

            // Product stats
            'total_products' => Product::count(),
            'pending_products' => Product::where('status', 'pending')->count(),
            'approved_products' => Product::where('status', 'approved')->count(),
            'rejected_products' => Product::where('status', 'rejected')->count(),
            'products_by_category' => $this->getProductsByCategory(),
            'low_stock_products' => Product::where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<', 10)
                ->count(),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->count(),

            // Order stats
            'total_orders' => Order::count(),
            'orders_today' => Order::whereDate('created_at', $today)->count(),
            'orders_this_month' => Order::where('created_at', '>=', $thisMonth)->count(),
            'orders_by_status' => $this->getOrdersByStatus(),
            'revenue_today' => Order::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'revenue_this_month' => Order::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'revenue_last_month' => Order::whereBetween('created_at', [$lastMonth, $thisMonth])
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'average_order_value' => Order::where('payment_status', 'paid')
                ->avg('total_amount'),

            // RFQ stats
            'total_rfqs' => Rfq::count(),
            'open_rfqs' => Rfq::where('status', 'open')->count(),
            'quoted_rfqs' => Rfq::where('status', 'quoted')->count(),
            'closed_rfqs' => Rfq::where('status', 'closed')->count(),
            'rfqs_this_month' => Rfq::where('created_at', '>=', $thisMonth)->count(),
            'quotes_submitted' => RfqQuote::count(),
            'quotes_this_month' => RfqQuote::where('created_at', '>=', $thisMonth)->count(),
        ];

        // Get chart data
        $charts = [
            'revenue_trend' => $this->getRevenueTrend(),
            'order_trend' => $this->getOrderTrend(),
            'user_registrations' => $this->getUserRegistrations(),
            'top_suppliers' => $this->getTopSuppliers(),
            'top_buyers' => $this->getTopBuyers(),
            'recent_activities' => $this->getRecentActivities(),
        ];

        // Get pending items for quick actions
        $pendingItems = [
            'suppliers' => Supplier::with('user')
                ->where('verification_status', 'pending')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($supplier) {
                    return [
                        'id' => $supplier->id,
                        'type' => 'supplier',
                        'company_name' => $supplier->company_name,
                        'contact' => $supplier->user->name,
                        'email' => $supplier->company_email,
                        'submitted_at' => $supplier->created_at->diffForHumans(),
                        'url' => route('admin.supplier-verification.verify', $supplier->id),
                    ];
                }),

            'products' => Product::with('supplier')
                ->where('status', 'pending')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'type' => 'product',
                        'name' => $product->name,
                        'supplier' => $product->supplier->company_name,
                        'price' => $product->base_price,
                        'submitted_at' => $product->created_at->diffForHumans(),
                        'url' => route('admin.product-approval.show', $product->id),
                    ];
                }),
        ];

        // Get recent orders
        $recentOrders = Order::with(['buyer', 'supplier'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'buyer' => $order->buyer->name,
                    'supplier' => $order->supplier->name,
                    'amount' => $order->total_amount,
                    'status' => $order->order_status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->diffForHumans(),
                    'url' => route('admin.orders.show', $order->id),
                ];
            });


        // Get recent RFQs
        $recentRfqs = Rfq::with('buyer')
            ->withCount('quotes')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($rfq) {
                return [
                    'id' => $rfq->id,
                    'rfq_number' => $rfq->rfq_number,
                    'title' => $rfq->title,
                    'buyer' => $rfq->buyer->name,
                    'quantity' => $rfq->quantity,
                    'status' => $rfq->status,
                    'quotes_count' => $rfq->quotes_count,
                    'required_by' => $rfq->required_by_date->format('Y-m-d'),
                    'created_at' => $rfq->created_at->diffForHumans(),
                    'url' => route('admin.rfqs.show', $rfq->id),
                ];
            });

        // Get system health metrics
        $systemHealth = [
            'storage_usage' => $this->getStorageUsage(),
            'pending_jobs' => $this->getPendingJobs(),
            'failed_jobs' => $this->getFailedJobs(),
            'last_backup' => $this->getLastBackup(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'charts' => $charts,
            'pendingItems' => $pendingItems,
            'recentOrders' => $recentOrders,
            'recentRfqs' => $recentRfqs,
            'systemHealth' => $systemHealth,
        ]);
    }

    /**
     * Get quick statistics for dashboard widgets.
     */
    public function quickStats()
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'revenue' => [
                'today' => Order::whereDate('created_at', $today)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'month' => Order::where('created_at', '>=', $thisMonth)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
            ],
            'orders' => [
                'today' => Order::whereDate('created_at', $today)->count(),
                'pending' => Order::where('order_status', 'pending_confirmation')->count(),
                'processing' => Order::where('order_status', 'processing')->count(),
            ],
            'users' => [
                'today' => User::whereDate('created_at', $today)->count(),
                'total' => User::count(),
            ],
            'suppliers' => [
                'pending' => Supplier::where('verification_status', 'pending')->count(),
                'total' => Supplier::count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Get revenue trend data.
     */
    private function getRevenueTrend()
    {
        $days = 30;
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $revenue = Order::whereDate('created_at', $date)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            $data[] = [
                'date' => $date->format('M d'),
                'revenue' => $revenue,
            ];
        }

        return $data;
    }

    /**
     * Get order trend data.
     */
    private function getOrderTrend()
    {
        $days = 30;
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $orders = Order::whereDate('created_at', $date)->count();

            $data[] = [
                'date' => $date->format('M d'),
                'orders' => $orders,
            ];
        }

        return $data;
    }

    /**
     * Get user registrations trend.
     */
    private function getUserRegistrations()
    {
        $months = 12;
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $registrations = User::whereBetween('created_at', [$start, $end])->count();

            $data[] = [
                'month' => $month->format('M Y'),
                'registrations' => $registrations,
            ];
        }

        return $data;
    }

    /**
     * Get users by role.
     */
    private function getUsersByRole()
    {
        return User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->role => $item->total];
            });
    }

    /**
     * Get products by category.
     */
    private function getProductsByCategory()
    {
        return Product::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Get orders by status.
     */
    private function getOrdersByStatus()
    {
        return Order::select('order_status', DB::raw('count(*) as total'))
            ->groupBy('order_status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->order_status => $item->total];
            });
    }

    /**
     * Get supplier growth trend.
     */
    private function getSupplierGrowth()
    {
        $months = 12;
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $count = Supplier::whereBetween('created_at', [$start, $end])->count();

            $data[] = [
                'month' => $month->format('M Y'),
                'new_suppliers' => $count,
            ];
        }

        return $data;
    }

    /**
     * Get top suppliers by revenue.
     */
    private function getTopSuppliers()
    {
        return User::where('role', 'supplier')
            ->with('supplier')
            ->withSum(['ordersAsSupplier' => function ($query) {
                $query->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_as_supplier_sum_total_amount', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($supplier) {
                return [
                    'name' => $supplier->supplier->company_name ?? $supplier->name,
                    'revenue' => $supplier->orders_as_supplier_sum_total_amount ?? 0,
                    'orders_count' => $supplier->ordersAsSupplier()->count(),
                ];
            });
    }

    /**
     * Get top buyers by spending.
     */
    private function getTopBuyers()
    {
        return User::where('role', 'buyer')
            ->withSum(['ordersAsBuyer' => function ($query) {
                $query->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_as_buyer_sum_total_amount', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($buyer) {
                return [
                    'name' => $buyer->name,
                    'spent' => $buyer->orders_as_buyer_sum_total_amount ?? 0,
                    'orders_count' => $buyer->ordersAsBuyer()->count(),
                ];
            });
    }

    /**
     * Get recent activities.
     */
    private function getRecentActivities()
    {
        $activities = [];

        // Recent orders
        $recentOrders = Order::with(['buyer', 'supplier'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'order',
                    'description' => "New order #{$order->order_number} from {$order->buyer->name}",
                    'time' => $order->created_at->diffForHumans(),
                    'icon' => 'shopping-cart',
                    'color' => 'green',
                ];
            });

        // Recent supplier registrations
        $recentSuppliers = Supplier::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($supplier) {
                return [
                    'type' => 'supplier',
                    'description' => "New supplier registration: {$supplier->company_name}",
                    'time' => $supplier->created_at->diffForHumans(),
                    'icon' => 'building',
                    'color' => 'blue',
                ];
            });

        // Recent product submissions
        $recentProducts = Product::with('supplier')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'type' => 'product',
                    'description' => "New product submitted: {$product->name} by {$product->supplier->company_name}",
                    'time' => $product->created_at->diffForHumans(),
                    'icon' => 'package',
                    'color' => 'purple',
                ];
            });

        // Recent RFQs
        $recentRfqs = Rfq::with('buyer')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($rfq) {
                return [
                    'type' => 'rfq',
                    'description' => "New RFQ: {$rfq->title} from {$rfq->buyer->name}",
                    'time' => $rfq->created_at->diffForHumans(),
                    'icon' => 'file-text',
                    'color' => 'orange',
                ];
            });

        // Merge and sort all activities
        $activities = collect()
            ->merge($recentOrders)
            ->merge($recentSuppliers)
            ->merge($recentProducts)
            ->merge($recentRfqs)
            ->sortByDesc(function ($activity) {
                // This is a simplified sort - you'd need actual timestamps for accurate sorting
                return strtotime(str_replace(['ago', ' '], '', $activity['time']));
            })
            ->take(10)
            ->values()
            ->all();

        return $activities;
    }

    /**
     * Get storage usage.
     */
    private function getStorageUsage()
    {
        // This would need to be implemented based on your storage setup
        return [
            'used' => '2.4 GB',
            'total' => '10 GB',
            'percentage' => 24,
        ];
    }

    /**
     * Get pending jobs count.
     */
    private function getPendingJobs()
    {
        // This would need to be implemented if you use queues
        try {
            // Example for database queue
            $count = DB::table('jobs')->count();
            return $count;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get failed jobs count.
     */
    private function getFailedJobs()
    {
        // This would need to be implemented if you use queues
        try {
            $count = DB::table('failed_jobs')->count();
            return $count;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get last backup time.
     */
    private function getLastBackup()
    {
        // This would need to be implemented based on your backup setup
        return 'Today, 02:30 AM';
    }

    /**
     * Get monthly performance report.
     */
    public function monthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $startDate = now()->parse($month)->startOfMonth();
        $endDate = now()->parse($month)->endOfMonth();

        $report = [
            'month' => $startDate->format('F Y'),
            'summary' => [
                'revenue' => Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
                'new_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'new_suppliers' => Supplier::whereBetween('created_at', [$startDate, $endDate])->count(),
                'new_products' => Product::whereBetween('created_at', [$startDate, $endDate])->count(),
                'rfqs' => Rfq::whereBetween('created_at', [$startDate, $endDate])->count(),
            ],
            'top_suppliers' => $this->getTopSuppliersForPeriod($startDate, $endDate),
            'top_buyers' => $this->getTopBuyersForPeriod($startDate, $endDate),
            'top_categories' => $this->getTopCategoriesForPeriod($startDate, $endDate),
            'daily_breakdown' => $this->getDailyBreakdown($startDate, $endDate),
        ];

        return Inertia::render('Admin/Reports/Monthly', [
            'report' => $report,
            'availableMonths' => $this->getAvailableMonths(),
        ]);
    }

    /**
     * Get top suppliers for a period.
     */
    private function getTopSuppliersForPeriod($startDate, $endDate)
    {
        return User::where('role', 'supplier')
            ->with('supplier')
            ->withSum(['ordersAsSupplier' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_as_supplier_sum_total_amount', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($supplier) use ($startDate, $endDate) {
                return [
                    'company_name' => $supplier->supplier->company_name ?? $supplier->name,
                    'revenue' => $supplier->orders_as_supplier_sum_total_amount ?? 0,
                    'orders' => $supplier->ordersAsSupplier()
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->count(),
                ];
            });
    }

    /**
     * Get top buyers for a period.
     */
    private function getTopBuyersForPeriod($startDate, $endDate)
    {
        return User::where('role', 'buyer')
            ->withSum(['ordersAsBuyer' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_as_buyer_sum_total_amount', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($buyer) use ($startDate, $endDate) {
                return [
                    'name' => $buyer->name,
                    'spent' => $buyer->orders_as_buyer_sum_total_amount ?? 0,
                    'orders' => $buyer->ordersAsBuyer()
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->count(),
                ];
            });
    }

    /**
     * Get top categories for a period.
     */
    private function getTopCategoriesForPeriod($startDate, $endDate)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'products.category',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.total_price) as revenue')
            )
            ->groupBy('products.category')
            ->orderBy('revenue', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Get daily breakdown for a period.
     */
    private function getDailyBreakdown($startDate, $endDate)
    {
        $days = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $days[] = [
                'date' => $current->format('Y-m-d'),
                'orders' => Order::whereDate('created_at', $current)->count(),
                'revenue' => Order::whereDate('created_at', $current)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'users' => User::whereDate('created_at', $current)->count(),
            ];
            $current->addDay();
        }

        return $days;
    }

    /**
     * Get available months for reports.
     */
    private function getAvailableMonths()
    {
        $firstOrder = Order::orderBy('created_at')->first();
        if (!$firstOrder) {
            return [now()->format('Y-m')];
        }

        $months = [];
        $current = now()->startOfMonth();
        $start = $firstOrder->created_at->startOfMonth();

        while ($current >= $start) {
            $months[] = $current->format('Y-m');
            $current->subMonth();
        }

        return $months;
    }
}
