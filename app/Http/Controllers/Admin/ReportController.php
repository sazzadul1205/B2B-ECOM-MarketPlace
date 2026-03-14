<?php
// app/Http/Controllers/Admin/ReportController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\Supplier;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display sales reports.
     */
    public function sales(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period, $request);

        // Sales data
        $salesData = [
            'overview' => $this->getSalesOverview($dateRange),
            'by_period' => $this->getSalesByPeriod($period, $dateRange),
            'by_category' => $this->getSalesByCategory($dateRange),
            'by_supplier' => $this->getSalesBySupplier($dateRange),
            'daily_trend' => $this->getDailySalesTrend($dateRange),
        ];

        return Inertia::render('Admin/Reports/Sales', [
            'salesData' => $salesData,
            'period' => $period,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Display supplier performance reports.
     */
    public function suppliers(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period, $request);

        $supplierData = [
            'overview' => $this->getSupplierOverview(),
            'top_performers' => $this->getTopSuppliers($dateRange),
            'verification_stats' => $this->getVerificationStats(),
            'product_stats' => $this->getSupplierProductStats(),
            'performance_trend' => $this->getSupplierPerformanceTrend($dateRange),
        ];

        return Inertia::render('Admin/Reports/Suppliers', [
            'supplierData' => $supplierData,
            'period' => $period,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Display buyer activity reports.
     */
    public function buyers(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period, $request);

        $buyerData = [
            'overview' => $this->getBuyerOverview(),
            'top_buyers' => $this->getTopBuyers($dateRange),
            'activity_stats' => $this->getBuyerActivityStats($dateRange),
            'rfq_stats' => $this->getBuyerRfqStats($dateRange),
        ];

        return Inertia::render('Admin/Reports/Buyers', [
            'buyerData' => $buyerData,
            'period' => $period,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Display product reports.
     */
    public function products(Request $request)
    {
        $productData = [
            'inventory' => $this->getInventoryStats(),
            'top_selling' => $this->getTopSellingProducts(),
            'by_category' => $this->getProductCategoryStats(),
            'price_distribution' => $this->getPriceDistribution(),
        ];

        return Inertia::render('Admin/Reports/Products', [
            'productData' => $productData,
        ]);
    }

    /**
     * Display RFQ reports.
     */
    public function rfqs(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period, $request);

        $rfqData = [
            'overview' => $this->getRfqOverview($dateRange),
            'by_status' => $this->getRfqByStatus($dateRange),
            'conversion_rate' => $this->getRfqConversionRate($dateRange),
            'response_time' => $this->getAverageResponseTime($dateRange),
        ];

        return Inertia::render('Admin/Reports/Rfqs', [
            'rfqData' => $rfqData,
            'period' => $period,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Display financial reports.
     */
    public function financial(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period, $request);

        $financialData = [
            'revenue' => $this->getRevenueStats($dateRange),
            'payment_stats' => $this->getPaymentStats($dateRange),
            'monthly_revenue' => $this->getMonthlyRevenue($dateRange),
            'revenue_by_supplier' => $this->getRevenueBySupplier($dateRange),
        ];

        return Inertia::render('Admin/Reports/Financial', [
            'financialData' => $financialData,
            'period' => $period,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Export report data.
     */
    public function export(Request $request)
    {
        $type = $request->get('type');
        $format = $request->get('format', 'csv');
        $dateRange = $this->getDateRange($request->get('period', 'monthly'), $request);

        switch ($type) {
            case 'sales':
                $data = $this->getSalesExportData($dateRange);
                break;
            case 'suppliers':
                $data = $this->getSupplierExportData();
                break;
            case 'buyers':
                $data = $this->getBuyerExportData($dateRange);
                break;
            case 'products':
                $data = $this->getProductExportData();
                break;
            default:
                return back()->withErrors(['error' => 'Invalid report type']);
        }

        if ($format === 'csv') {
            return $this->exportToCsv($data, $type);
        }

        return back()->withErrors(['error' => 'Export format not supported']);
    }

    /**
     * Private helper methods for data collection
     */
    private function getDateRange($period, $request)
    {
        $now = now();

        switch ($period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                ];
            case 'quarterly':
                return [
                    'start' => $now->copy()->startOfQuarter(),
                    'end' => $now->copy()->endOfQuarter(),
                ];
            case 'yearly':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                ];
            case 'custom':
                return [
                    'start' => $request->get('date_from') ? now()->parse($request->date_from)->startOfDay() : $now->copy()->subDays(30)->startOfDay(),
                    'end' => $request->get('date_to') ? now()->parse($request->date_to)->endOfDay() : $now->copy()->endOfDay(),
                ];
            default:
                return [
                    'start' => $now->copy()->subDays(30)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
        }
    }

    private function getSalesOverview($dateRange)
    {
        $totalRevenue = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
            'conversion_rate' => 15.5, // This would need actual visitor data
        ];
    }

    private function getSalesByPeriod($period, $dateRange)
    {
        if ($period === 'daily') {
            return Order::select(
                DB::raw('DATE(created_at) as period'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as revenue'),
                DB::raw('AVG(CASE WHEN payment_status = "paid" THEN total_amount ELSE NULL END) as average_value')
            )
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->groupBy('period')
                ->orderBy('period')
                ->get();
        } else {
            return Order::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as period'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as revenue'),
                DB::raw('AVG(CASE WHEN payment_status = "paid" THEN total_amount ELSE NULL END) as average_value')
            )
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->groupBy('period')
                ->orderBy('period')
                ->get();
        }
    }

    private function getSalesByCategory($dateRange)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'products.category',
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('products.category')
            ->orderBy('total_revenue', 'desc')
            ->get();
    }

    private function getSalesBySupplier($dateRange)
    {
        return Order::with('supplier:id,name')
            ->select(
                'supplier_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->where('payment_status', 'paid')
            ->groupBy('supplier_id')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'supplier_id' => $order->supplier_id,
                    'supplier_name' => $order->supplier->name ?? 'Unknown',
                    'order_count' => $order->order_count,
                    'total_revenue' => $order->total_revenue,
                ];
            });
    }

    private function getDailySalesTrend($dateRange)
    {
        return Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as orders'),
            DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as revenue')
        )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getSupplierOverview()
    {
        return [
            'total' => Supplier::count(),
            'verified' => Supplier::where('verification_status', 'verified')->count(),
            'pending' => Supplier::where('verification_status', 'pending')->count(),
            'rejected' => Supplier::where('verification_status', 'rejected')->count(),
            'active' => User::where('role', 'supplier')->where('is_active', true)->count(),
        ];
    }

    private function getTopSuppliers($dateRange)
    {
        return Supplier::with('user:id,name')
            ->withCount(['products' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->withSum(['orders' => function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                    ->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_sum_total_amount', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'company_name' => $supplier->company_name,
                    'contact_name' => $supplier->user->name ?? 'N/A',
                    'products_count' => $supplier->products_count,
                    'total_revenue' => $supplier->orders_sum_total_amount ?? 0,
                ];
            });
    }

    private function getVerificationStats()
    {
        return Supplier::select(
            DB::raw('verification_status'),
            DB::raw('COUNT(*) as total')
        )
            ->groupBy('verification_status')
            ->get();
    }

    private function getSupplierProductStats()
    {
        return Supplier::select(
            'suppliers.id',
            'suppliers.company_name',
            DB::raw('COUNT(products.id) as total_products'),
            DB::raw('SUM(CASE WHEN products.status = "approved" THEN 1 ELSE 0 END) as approved_products'),
            DB::raw('SUM(CASE WHEN products.status = "pending" THEN 1 ELSE 0 END) as pending_products')
        )
            ->leftJoin('products', 'suppliers.id', '=', 'products.supplier_id')
            ->groupBy('suppliers.id', 'suppliers.company_name')
            ->orderBy('total_products', 'desc')
            ->limit(20)
            ->get();
    }

    private function getSupplierPerformanceTrend($dateRange)
    {
        return Order::select(
            DB::raw('DATE_FORMAT(orders.created_at, "%Y-%m") as month'),
            DB::raw('COUNT(DISTINCT orders.supplier_id) as active_suppliers'),
            DB::raw('SUM(orders.total_amount) as total_revenue')
        )
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getBuyerOverview()
    {
        return [
            'total' => User::where('role', 'buyer')->count(),
            'active' => User::where('role', 'buyer')->where('is_active', true)->count(),
            'with_orders' => User::where('role', 'buyer')->has('ordersAsBuyer')->count(),
            'with_rfqs' => User::where('role', 'buyer')->has('rfqs')->count(),
        ];
    }

    private function getTopBuyers($dateRange)
    {
        return User::where('role', 'buyer')
            ->withCount(['ordersAsBuyer' => function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }])
            ->withSum(['ordersAsBuyer' => function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                    ->where('payment_status', 'paid');
            }], 'total_amount')
            ->orderBy('orders_as_buyer_sum_total_amount', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email'])
            ->map(function ($buyer) {
                return [
                    'id' => $buyer->id,
                    'name' => $buyer->name,
                    'email' => $buyer->email,
                    'orders_count' => $buyer->orders_as_buyer_count,
                    'total_spent' => $buyer->orders_as_buyer_sum_total_amount ?? 0,
                ];
            });
    }

    private function getBuyerActivityStats($dateRange)
    {
        $totalBuyers = User::where('role', 'buyer')->count();

        return [
            'new_buyers' => User::where('role', 'buyer')
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'active_buyers' => User::where('role', 'buyer')
                ->whereHas('ordersAsBuyer', function ($q) use ($dateRange) {
                    $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })
                ->count(),
            'average_orders_per_buyer' => $totalBuyers > 0
                ? round(Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count() / $totalBuyers, 2)
                : 0,
        ];
    }

    private function getBuyerRfqStats($dateRange)
    {
        $totalRfqs = Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();
        $buyersWithRfqs = Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->distinct('buyer_id')
            ->count('buyer_id');

        return [
            'total_rfqs' => $totalRfqs,
            'buyers_with_rfqs' => $buyersWithRfqs,
            'avg_rfqs_per_buyer' => $buyersWithRfqs > 0 ? round($totalRfqs / $buyersWithRfqs, 2) : 0,
        ];
    }

    private function getInventoryStats()
    {
        return [
            'total_products' => Product::count(),
            'total_value' => Product::sum(DB::raw('base_price * stock_quantity')),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->count(),
            'low_stock' => Product::where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<', 10)
                ->count(),
            'by_category' => Product::select('category', DB::raw('COUNT(*) as total'))
                ->groupBy('category')
                ->get(),
        ];
    }

    private function getTopSellingProducts()
    {
        return OrderItem::select(
            'product_id',
            'product_name',
            DB::raw('SUM(quantity) as total_quantity'),
            DB::raw('SUM(total_price) as total_revenue')
        )
            ->groupBy('product_id', 'product_name')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();
    }

    private function getProductCategoryStats()
    {
        return Product::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get();
    }

    private function getPriceDistribution()
    {
        return [
            'under_100k' => Product::where('base_price', '<', 100000)->count(),
            '100k_500k' => Product::whereBetween('base_price', [100000, 500000])->count(),
            '500k_1m' => Product::whereBetween('base_price', [500000, 1000000])->count(),
            '1m_5m' => Product::whereBetween('base_price', [1000000, 5000000])->count(),
            'above_5m' => Product::where('base_price', '>', 5000000)->count(),
        ];
    }

    private function getRfqOverview($dateRange)
    {
        return [
            'total' => Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count(),
            'open' => Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'open')
                ->count(),
            'quoted' => Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'quoted')
                ->count(),
            'closed' => Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'closed')
                ->count(),
        ];
    }

    private function getRfqByStatus($dateRange)
    {
        return Rfq::select('status', DB::raw('COUNT(*) as total'))
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('status')
            ->get();
    }

    private function getRfqConversionRate($dateRange)
    {
        $totalRfqs = Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();
        $convertedToOrders = Rfq::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->has('order')
            ->count();

        return [
            'total' => $totalRfqs,
            'converted' => $convertedToOrders,
            'rate' => $totalRfqs > 0 ? round(($convertedToOrders / $totalRfqs) * 100, 2) : 0,
        ];
    }

    private function getAverageResponseTime($dateRange)
    {
        return DB::table('rfq_quotes')
            ->join('rfqs', 'rfq_quotes.rfq_id', '=', 'rfqs.id')
            ->whereBetween('rfq_quotes.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, rfqs.created_at, rfq_quotes.created_at)) as avg_hours'))
            ->value('avg_hours');
    }

    private function getRevenueStats($dateRange)
    {
        return [
            'total' => Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'by_payment_method' => Order::select('payment_method', DB::raw('SUM(total_amount) as total'))
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('payment_status', 'paid')
                ->whereNotNull('payment_method')
                ->groupBy('payment_method')
                ->get(),
        ];
    }

    private function getPaymentStats($dateRange)
    {
        return [
            'paid' => Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('payment_status', 'paid')
                ->count(),
            'pending' => Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('payment_status', 'pending')
                ->count(),
        ];
    }

    private function getMonthlyRevenue($dateRange)
    {
        return Order::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as revenue')
        )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getRevenueBySupplier($dateRange)
    {
        return Order::with('supplier:id,name')
            ->select(
                'supplier_id',
                DB::raw('SUM(total_amount) as revenue')
            )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->where('payment_status', 'paid')
            ->groupBy('supplier_id')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'supplier_id' => $order->supplier_id,
                    'supplier_name' => $order->supplier->name ?? 'Unknown',
                    'revenue' => $order->revenue,
                ];
            });
    }

    private function getSalesExportData($dateRange)
    {
        return Order::with(['buyer:id,name', 'supplier:id,name'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get()
            ->map(function ($order) {
                return [
                    'Order Number' => $order->order_number,
                    'Buyer' => $order->buyer->name ?? 'N/A',
                    'Supplier' => $order->supplier->name ?? 'N/A',
                    'Total Amount' => $order->total_amount,
                    'Order Status' => $order->order_status,
                    'Payment Status' => $order->payment_status,
                    'Created At' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
    }

    private function getSupplierExportData()
    {
        return Supplier::with('user:id,name,email')
            ->get()
            ->map(function ($supplier) {
                return [
                    'Company Name' => $supplier->company_name,
                    'Contact Person' => $supplier->user->name ?? 'N/A',
                    'Email' => $supplier->company_email,
                    'Phone' => $supplier->company_phone,
                    'City' => $supplier->city,
                    'Verification Status' => ucfirst($supplier->verification_status),
                    'Products Count' => $supplier->products()->count(),
                    'Joined Date' => $supplier->created_at->format('Y-m-d'),
                ];
            })
            ->toArray();
    }

    private function getBuyerExportData($dateRange)
    {
        return User::where('role', 'buyer')
            ->withCount(['ordersAsBuyer' => function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }])
            ->withSum(['ordersAsBuyer' => function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }], 'total_amount')
            ->get()
            ->map(function ($buyer) {
                return [
                    'Name' => $buyer->name,
                    'Email' => $buyer->email,
                    'Status' => $buyer->is_active ? 'Active' : 'Inactive',
                    'Orders Count' => $buyer->orders_as_buyer_count,
                    'Total Spent' => $buyer->orders_as_buyer_sum_total_amount ?? 0,
                    'Joined Date' => $buyer->created_at->format('Y-m-d'),
                ];
            })
            ->toArray();
    }

    private function getProductExportData()
    {
        return Product::with('supplier:id,company_name')
            ->get()
            ->map(function ($product) {
                return [
                    'Name' => $product->name,
                    'Category' => $product->category,
                    'Supplier' => $product->supplier->company_name ?? 'N/A',
                    'Base Price' => $product->base_price,
                    'Stock' => $product->stock_quantity,
                    'Status' => ucfirst($product->status),
                    'Created At' => $product->created_at->format('Y-m-d'),
                ];
            })
            ->toArray();
    }

    private function exportToCsv($data, $type)
    {
        $filename = "{$type}_report_" . date('Y-m-d') . '.csv';

        $handle = fopen('php://temp', 'w');

        if (!empty($data)) {
            // Add UTF-8 BOM for Excel compatibility
            fputs($handle, "\xEF\xBB\xBF");

            // Add headers
            fputcsv($handle, array_keys($data[0]));

            // Add data rows
            foreach ($data as $row) {
                fputcsv($handle, $row);
            }
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
