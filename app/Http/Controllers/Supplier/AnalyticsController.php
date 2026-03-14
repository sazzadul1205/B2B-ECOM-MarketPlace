<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\RfqQuote;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display sales reports and charts.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function sales(Request $request)
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

        // Get comparison period
        $comparisonRange = $this->getComparisonRange($dateRange);

        // Get sales data
        $salesData = $this->getSalesData($user, $dateRange);
        $comparisonData = $this->getSalesData($user, $comparisonRange);

        // Get sales by period (daily, weekly, monthly)
        $salesByPeriod = $this->getSalesByPeriod($user, $dateRange, $request->get('group_by', 'day'));

        // Get sales by product category
        $salesByCategory = $this->getSalesByCategory($supplier, $dateRange);

        // Get top selling products
        $topProducts = $this->getTopProducts($supplier, $dateRange, 10);

        // Get sales by buyer
        $salesByBuyer = $this->getSalesByBuyer($user, $dateRange);

        // Get payment method distribution (if you have payment methods)
        $paymentMethods = $this->getPaymentMethodDistribution($user, $dateRange);

        // Get geographical distribution (if you have shipping addresses)
        $geoDistribution = $this->getGeographicalDistribution($user, $dateRange);

        // Calculate growth metrics
        $growth = $this->calculateGrowth($salesData, $comparisonData);

        // Get summary metrics
        $summary = [
            'total_revenue' => $salesData['total_revenue'],
            'total_orders' => $salesData['total_orders'],
            'average_order_value' => $salesData['average_order_value'],
            'total_items_sold' => $salesData['total_items_sold'],
            'unique_customers' => $salesData['unique_customers'],
            'revenue_growth' => $growth['revenue'],
            'orders_growth' => $growth['orders'],
            'aov_growth' => $growth['aov'],
        ];

        return Inertia::render('Supplier/Analytics/Sales', compact(
            'dateRange',
            'summary',
            'salesByPeriod',
            'salesByCategory',
            'topProducts',
            'salesByBuyer',
            'paymentMethods',
            'geoDistribution',
            'salesData',
            'comparisonData'
        ));
    }

    /**
     * Display product performance analytics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function products(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        // Get date range
        $dateRange = $this->getDateRange($request);

        // Get all products with performance metrics
        $products = Product::where('supplier_id', $supplier->id)
            ->withCount(['orderItems as total_quantity_sold' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->withSum(['orderItems as total_revenue' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(total_price), 0)'));
            }], 'total_price')
            ->withCount(['orderItems as order_count' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COUNT(DISTINCT order_id)'));
            }])
            ->get()
            ->map(function ($product) {
                // Calculate additional metrics
                $product->average_price = $product->total_quantity_sold > 0
                    ? $product->total_revenue / $product->total_quantity_sold
                    : 0;

                $product->stock_status = $this->getStockStatus($product->stock_quantity);

                // Calculate days in stock (if you have stock history)
                // This is a simplified version
                $product->days_to_sell = $this->calculateDaysToSell($product);

                return $product;
            });

        // Sort products based on request
        $sortField = $request->get('sort', 'total_revenue');
        $sortDirection = $request->get('direction', 'desc');

        if (in_array($sortField, ['name', 'stock_quantity', 'base_price'])) {
            $products = $products->sortBy([$sortField => $sortDirection]);
        } else {
            $products = $products->sortBy([$sortField => $sortDirection]);
        }

        // Get category performance
        $categoryPerformance = $this->getCategoryPerformance($supplier, $dateRange);

        // Get inventory metrics
        $inventoryMetrics = [
            'total_products' => Product::where('supplier_id', $supplier->id)->count(),
            'active_products' => Product::where('supplier_id', $supplier->id)->where('status', 'active')->count(),
            'out_of_stock' => Product::where('supplier_id', $supplier->id)
                ->where('status', 'active')
                ->where('stock_quantity', '<=', 0)
                ->count(),
            'low_stock' => Product::where('supplier_id', $supplier->id)
                ->where('status', 'active')
                ->where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 10)
                ->count(),
            'total_stock_value' => Product::where('supplier_id', $supplier->id)
                ->where('status', 'active')
                ->get()
                ->sum(function ($product) {
                    return $product->stock_quantity * $product->base_price;
                }),
        ];

        // Get top performing products
        $topByRevenue = $products->sortByDesc('total_revenue')->take(5);
        $topByQuantity = $products->sortByDesc('total_quantity_sold')->take(5);
        $bottomByRevenue = $products->filter(function ($p) {
            return $p->total_revenue > 0;
        })->sortBy('total_revenue')->take(5);

        return Inertia::render('Supplier/Analytics/Products', compact(
            'dateRange',
            'products',
            'categoryPerformance',
            'inventoryMetrics',
            'topByRevenue',
            'topByQuantity',
            'bottomByRevenue'
        ));
    }

    /**
     * Display quote conversion analytics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function quotes(Request $request)
    {
        $user = Auth::user();

        // Get date range
        $dateRange = $this->getDateRange($request);

        // Get all quotes with metrics
        $quotes = RfqQuote::where('supplier_id', $user->id)
            ->with(['rfq.buyer', 'order'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        // Calculate overall metrics
        $totalQuotes = $quotes->count();
        $acceptedQuotes = $quotes->where('status', 'accepted')->count();
        $rejectedQuotes = $quotes->where('status', 'rejected')->count();
        $pendingQuotes = $quotes->where('status', 'pending')->count();
        $expiredQuotes = $quotes->filter(function ($quote) {
            return $quote->status === 'pending' && $quote->valid_until < now();
        })->count();

        $conversionRate = $totalQuotes > 0
            ? ($acceptedQuotes / $totalQuotes) * 100
            : 0;

        $totalQuoteValue = $quotes->sum('total_amount');
        $acceptedValue = $quotes->where('status', 'accepted')->sum('total_amount');
        $revenueFromQuotes = Order::where('supplier_id', $user->id)
            ->whereHas('quote')
            ->where('order_status', Order::STATUS_DELIVERED)
            ->sum('total_amount');

        // Quotes by month
        $quotesByMonth = $quotes->groupBy(function ($quote) {
            return $quote->created_at->format('Y-m');
        })->map(function ($monthQuotes) {
            return [
                'total' => $monthQuotes->count(),
                'accepted' => $monthQuotes->where('status', 'accepted')->count(),
                'rejected' => $monthQuotes->where('status', 'rejected')->count(),
                'pending' => $monthQuotes->where('status', 'pending')->count(),
                'value' => $monthQuotes->sum('total_amount'),
                'accepted_value' => $monthQuotes->where('status', 'accepted')->sum('total_amount'),
            ];
        });

        // Quotes by buyer
        $quotesByBuyer = $quotes->groupBy('rfq.buyer_id')
            ->map(function ($buyerQuotes) {
                $buyer = $buyerQuotes->first()->rfq->buyer;
                return [
                    'buyer' => $buyer,
                    'total_quotes' => $buyerQuotes->count(),
                    'accepted' => $buyerQuotes->where('status', 'accepted')->count(),
                    'rejected' => $buyerQuotes->where('status', 'rejected')->count(),
                    'pending' => $buyerQuotes->where('status', 'pending')->count(),
                    'total_value' => $buyerQuotes->sum('total_amount'),
                    'accepted_value' => $buyerQuotes->where('status', 'accepted')->sum('total_amount'),
                ];
            })->sortByDesc('accepted_value');

        // Response time analysis
        $responseTimes = $quotes->filter(function ($quote) {
            return $quote->rfq && $quote->created_at;
        })->map(function ($quote) {
            return [
                'quote' => $quote,
                'response_hours' => $quote->created_at->diffInHours($quote->rfq->created_at),
                'response_days' => $quote->created_at->diffInDays($quote->rfq->created_at),
            ];
        });

        $avgResponseHours = $responseTimes->avg('response_hours');
        $avgResponseDays = $responseTimes->avg('response_days');

        // Success rate by response time
        $successByResponseTime = [
            '< 24h' => $this->getSuccessRateForResponseTime($quotes, 0, 24),
            '24-48h' => $this->getSuccessRateForResponseTime($quotes, 24, 48),
            '48-72h' => $this->getSuccessRateForResponseTime($quotes, 48, 72),
            '> 72h' => $this->getSuccessRateForResponseTime($quotes, 72, null),
        ];

        // Quote value distribution
        $valueRanges = [
            '< 1000' => ['min' => 0, 'max' => 1000],
            '1000-5000' => ['min' => 1000, 'max' => 5000],
            '5000-10000' => ['min' => 5000, 'max' => 10000],
            '10000-50000' => ['min' => 10000, 'max' => 50000],
            '> 50000' => ['min' => 50000, 'max' => null],
        ];

        $valueDistribution = [];
        foreach ($valueRanges as $label => $range) {
            $rangeQuotes = $quotes->filter(function ($quote) use ($range) {
                if ($range['max'] === null) {
                    return $quote->total_amount >= $range['min'];
                }
                return $quote->total_amount >= $range['min'] && $quote->total_amount < $range['max'];
            });

            $valueDistribution[$label] = [
                'count' => $rangeQuotes->count(),
                'accepted' => $rangeQuotes->where('status', 'accepted')->count(),
                'rate' => $rangeQuotes->count() > 0
                    ? ($rangeQuotes->where('status', 'accepted')->count() / $rangeQuotes->count()) * 100
                    : 0,
            ];
        }

        return Inertia::render('Supplier/Analytics/Quotes', compact(
            'dateRange',
            'totalQuotes',
            'acceptedQuotes',
            'rejectedQuotes',
            'pendingQuotes',
            'expiredQuotes',
            'conversionRate',
            'totalQuoteValue',
            'acceptedValue',
            'revenueFromQuotes',
            'quotesByMonth',
            'quotesByBuyer',
            'avgResponseHours',
            'avgResponseDays',
            'successByResponseTime',
            'valueDistribution'
        ));
    }

    /**
     * Export reports in various formats.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $validated = $request->validate([
            'type' => 'required|in:sales,products,quotes,complete',
            'format' => 'required|in:csv,excel,pdf',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'include_charts' => 'nullable|boolean',
        ]);

        $dateRange = [
            'start' => Carbon::parse($validated['date_from'])->startOfDay(),
            'end' => Carbon::parse($validated['date_to'])->endOfDay(),
        ];

        switch ($validated['type']) {
            case 'sales':
                return $this->exportSalesReport($user, $dateRange, $validated['format']);
            case 'products':
                return $this->exportProductsReport($supplier, $dateRange, $validated['format']);
            case 'quotes':
                return $this->exportQuotesReport($user, $dateRange, $validated['format']);
            case 'complete':
                return $this->exportCompleteReport($user, $supplier, $dateRange, $validated['format']);
        }
    }

    /**
     * Export sales report.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @param  string  $format
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function exportSalesReport($user, $dateRange, $format)
    {
        $data = $this->getSalesData($user, $dateRange);
        $salesByDay = $this->getSalesByPeriod($user, $dateRange, 'day');
        $topProducts = $this->getTopProducts($user->supplier, $dateRange, 20);

        $filename = 'sales-report-' . now()->format('Y-m-d') . '.' . $format;

        if ($format === 'csv') {
            return $this->generateSalesCsv($data, $salesByDay, $topProducts, $dateRange, $filename);
        }

        // For other formats, you would use appropriate packages (Laravel Excel, DomPDF, etc.)
        // This is a placeholder for other formats
        return $this->generateSalesCsv($data, $salesByDay, $topProducts, $dateRange, $filename);
    }

    /**
     * Export products report.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  array  $dateRange
     * @param  string  $format
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function exportProductsReport($supplier, $dateRange, $format)
    {
        $products = Product::where('supplier_id', $supplier->id)
            ->withCount(['orderItems as total_quantity_sold' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->withSum(['orderItems as total_revenue' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(total_price), 0)'));
            }], 'total_price')
            ->get();

        $filename = 'products-report-' . now()->format('Y-m-d') . '.' . $format;

        if ($format === 'csv') {
            return $this->generateProductsCsv($products, $dateRange, $filename);
        }

        return $this->generateProductsCsv($products, $dateRange, $filename);
    }

    /**
     * Export quotes report.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @param  string  $format
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function exportQuotesReport($user, $dateRange, $format)
    {
        $quotes = RfqQuote::where('supplier_id', $user->id)
            ->with(['rfq.buyer', 'order'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        $filename = 'quotes-report-' . now()->format('Y-m-d') . '.' . $format;

        if ($format === 'csv') {
            return $this->generateQuotesCsv($quotes, $dateRange, $filename);
        }

        return $this->generateQuotesCsv($quotes, $dateRange, $filename);
    }

    /**
     * Export complete report with all data.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Supplier  $supplier
     * @param  array  $dateRange
     * @param  string  $format
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function exportCompleteReport($user, $supplier, $dateRange, $format)
    {
        $salesData = $this->getSalesData($user, $dateRange);
        $products = Product::where('supplier_id', $supplier->id)->get();
        $quotes = RfqQuote::where('supplier_id', $user->id)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        $filename = 'complete-report-' . now()->format('Y-m-d') . '.' . $format;

        if ($format === 'csv') {
            return $this->generateCompleteCsv($salesData, $products, $quotes, $dateRange, $filename);
        }

        return $this->generateCompleteCsv($salesData, $products, $quotes, $dateRange, $filename);
    }

    /**
     * Generate sales CSV.
     *
     * @param  array  $data
     * @param  \Illuminate\Support\Collection  $salesByDay
     * @param  \Illuminate\Support\Collection  $topProducts
     * @param  array  $dateRange
     * @param  string  $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateSalesCsv($data, $salesByDay, $topProducts, $dateRange, $filename)
    {
        $handle = fopen('php://temp', 'w+');

        // Header
        fputcsv($handle, ['SALES REPORT']);
        fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period:', $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
        fputcsv($handle, []);

        // Summary
        fputcsv($handle, ['SUMMARY']);
        fputcsv($handle, ['Total Revenue', 'Total Orders', 'Average Order Value', 'Total Items Sold', 'Unique Customers']);
        fputcsv($handle, [
            number_format($data['total_revenue'], 2),
            $data['total_orders'],
            number_format($data['average_order_value'], 2),
            $data['total_items_sold'],
            $data['unique_customers'],
        ]);
        fputcsv($handle, []);

        // Daily/Monthly breakdown
        fputcsv($handle, ['DAILY BREAKDOWN']);
        fputcsv($handle, ['Date', 'Orders', 'Revenue', 'Items Sold']);
        foreach ($salesByDay as $day) {
            fputcsv($handle, [
                $day->date,
                $day->orders,
                number_format($day->revenue, 2),
                $day->items_sold,
            ]);
        }
        fputcsv($handle, []);

        // Top Products
        fputcsv($handle, ['TOP PRODUCTS']);
        fputcsv($handle, ['Product', 'Quantity Sold', 'Revenue', 'Orders']);
        foreach ($topProducts as $product) {
            fputcsv($handle, [
                $product->name,
                $product->total_quantity_sold,
                number_format($product->total_revenue, 2),
                $product->order_count,
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

    /**
     * Generate products CSV.
     *
     * @param  \Illuminate\Support\Collection  $products
     * @param  array  $dateRange
     * @param  string  $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateProductsCsv($products, $dateRange, $filename)
    {
        $handle = fopen('php://temp', 'w+');

        fputcsv($handle, ['PRODUCTS REPORT']);
        fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period:', $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
        fputcsv($handle, []);

        fputcsv($handle, ['Product Details']);
        fputcsv($handle, ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Quantity Sold', 'Revenue', 'Orders']);

        foreach ($products as $product) {
            fputcsv($handle, [
                $product->id,
                $product->name,
                $product->category,
                number_format($product->base_price, 2),
                $product->stock_quantity,
                $product->status,
                $product->total_quantity_sold ?? 0,
                number_format($product->total_revenue ?? 0, 2),
                $product->order_count ?? 0,
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

    /**
     * Generate quotes CSV.
     *
     * @param  \Illuminate\Support\Collection  $quotes
     * @param  array  $dateRange
     * @param  string  $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateQuotesCsv($quotes, $dateRange, $filename)
    {
        $handle = fopen('php://temp', 'w+');

        fputcsv($handle, ['QUOTES REPORT']);
        fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period:', $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
        fputcsv($handle, []);

        fputcsv($handle, ['Quote Details']);
        fputcsv($handle, ['Quote #', 'RFQ #', 'Buyer', 'Amount', 'Status', 'Valid Until', 'Created', 'Order #']);

        foreach ($quotes as $quote) {
            fputcsv($handle, [
                $quote->quote_number,
                $quote->rfq->rfq_number,
                $quote->rfq->buyer->name,
                number_format($quote->total_amount, 2),
                $quote->status,
                $quote->valid_until->format('Y-m-d'),
                $quote->created_at->format('Y-m-d'),
                $quote->order->order_number ?? 'N/A',
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

    /**
     * Generate complete CSV report.
     *
     * @param  array  $salesData
     * @param  \Illuminate\Support\Collection  $products
     * @param  \Illuminate\Support\Collection  $quotes
     * @param  array  $dateRange
     * @param  string  $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateCompleteCsv($salesData, $products, $quotes, $dateRange, $filename)
    {
        $handle = fopen('php://temp', 'w+');

        fputcsv($handle, ['COMPLETE REPORT']);
        fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period:', $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
        fputcsv($handle, []);

        // Sales Summary
        fputcsv($handle, ['SALES SUMMARY']);
        fputcsv($handle, ['Total Revenue', 'Total Orders', 'Average Order Value', 'Total Items Sold']);
        fputcsv($handle, [
            number_format($salesData['total_revenue'], 2),
            $salesData['total_orders'],
            number_format($salesData['average_order_value'], 2),
            $salesData['total_items_sold'],
        ]);
        fputcsv($handle, []);

        // Products
        fputcsv($handle, ['PRODUCTS']);
        fputcsv($handle, ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status']);
        foreach ($products as $product) {
            fputcsv($handle, [
                $product->id,
                $product->name,
                $product->category,
                number_format($product->base_price, 2),
                $product->stock_quantity,
                $product->status,
            ]);
        }
        fputcsv($handle, []);

        // Quotes
        fputcsv($handle, ['QUOTES']);
        fputcsv($handle, ['Quote #', 'RFQ #', 'Buyer', 'Amount', 'Status', 'Valid Until']);
        foreach ($quotes as $quote) {
            fputcsv($handle, [
                $quote->quote_number,
                $quote->rfq->rfq_number,
                $quote->rfq->buyer->name,
                number_format($quote->total_amount, 2),
                $quote->status,
                $quote->valid_until->format('Y-m-d'),
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

    /**
     * Get sales data for a date range.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return array
     */
    private function getSalesData($user, $dateRange)
    {
        $orders = Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $totalItemsSold = OrderItem::whereHas('order', function ($query) use ($user, $dateRange) {
            $query->where('supplier_id', $user->id)
                ->where('order_status', Order::STATUS_DELIVERED)
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        })->sum('quantity');

        $uniqueCustomers = $orders->unique('buyer_id')->count();

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => $averageOrderValue,
            'total_items_sold' => $totalItemsSold,
            'unique_customers' => $uniqueCustomers,
            'orders' => $orders,
        ];
    }

    /**
     * Get sales grouped by period.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @param  string  $groupBy
     * @return \Illuminate\Support\Collection
     */
    private function getSalesByPeriod($user, $dateRange, $groupBy = 'day')
    {
        $select = match ($groupBy) {
            'day' => DB::raw('DATE(created_at) as date'),
            'week' => DB::raw('YEARWEEK(created_at) as week'),
            'month' => DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            default => DB::raw('DATE(created_at) as date'),
        };

        $groupField = match ($groupBy) {
            'day' => 'date',
            'week' => 'week',
            'month' => 'month',
            default => 'date',
        };

        return Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                $select,
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('SUM((
                    SELECT SUM(quantity) 
                    FROM order_items 
                    WHERE order_items.order_id = orders.id
                )) as items_sold')
            )
            ->groupBy($groupField)
            ->orderBy($groupField)
            ->get();
    }

    /**
     * Get sales by category.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  array  $dateRange
     * @return \Illuminate\Support\Collection
     */
    private function getSalesByCategory($supplier, $dateRange)
    {
        return Product::where('supplier_id', $supplier->id)
            ->where('status', 'active')
            ->withCount(['orderItems as quantity_sold' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->withSum(['orderItems as revenue' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(total_price), 0)'));
            }], 'total_price')
            ->get()
            ->groupBy('category')
            ->map(function ($products) {
                return [
                    'quantity' => $products->sum('quantity_sold'),
                    'revenue' => $products->sum('revenue'),
                    'products' => $products->count(),
                ];
            });
    }

    /**
     * Get top products.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  array  $dateRange
     * @param  int  $limit
     * @return \Illuminate\Support\Collection
     */
    private function getTopProducts($supplier, $dateRange, $limit = 10)
    {
        return Product::where('supplier_id', $supplier->id)
            ->where('status', 'active')
            ->withCount(['orderItems as total_quantity_sold' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->withSum(['orderItems as total_revenue' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COALESCE(SUM(total_price), 0)'));
            }], 'total_price')
            ->withCount(['orderItems as order_count' => function ($query) use ($dateRange) {
                $query->whereHas('order', function ($q) use ($dateRange) {
                    $q->where('order_status', Order::STATUS_DELIVERED)
                        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                })->select(DB::raw('COUNT(DISTINCT order_id)'));
            }])
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get sales by buyer.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return \Illuminate\Support\Collection
     */
    private function getSalesByBuyer($user, $dateRange)
    {
        return Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'buyer_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent')
            )
            ->with('buyer')
            ->groupBy('buyer_id')
            ->orderBy('total_spent', 'desc')
            ->get();
    }

    /**
     * Get payment method distribution.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return \Illuminate\Support\Collection
     */
    private function getPaymentMethodDistribution($user, $dateRange)
    {
        // If you have payment_method column in orders table
        return Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('payment_status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_status')
            ->get();
    }

    /**
     * Get geographical distribution.
     *
     * @param  \App\Models\User  $user
     * @param  array  $dateRange
     * @return \Illuminate\Support\Collection
     */
    private function getGeographicalDistribution($user, $dateRange)
    {
        // If you have city/state in shipping_address
        return Order::where('supplier_id', $user->id)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                DB::raw('JSON_EXTRACT(shipping_address, "$.city") as city'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent')
            )
            ->groupBy('city')
            ->orderBy('total_spent', 'desc')
            ->get();
    }

    /**
     * Get category performance.
     *
     * @param  \App\Models\Supplier  $supplier
     * @param  array  $dateRange
     * @return \Illuminate\Support\Collection
     */
    private function getCategoryPerformance($supplier, $dateRange)
    {
        $salesByProduct = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.order_status', Order::STATUS_DELIVERED)
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'order_items.product_id',
                DB::raw('SUM(order_items.quantity) as quantity_sold'),
                DB::raw('SUM(order_items.total_price) as revenue')
            )
            ->groupBy('order_items.product_id');

        return DB::table('products')
            ->leftJoinSub($salesByProduct, 'sales', function ($join) {
                $join->on('products.id', '=', 'sales.product_id');
            })
            ->where('products.supplier_id', $supplier->id)
            ->where('products.status', 'active')
            ->groupBy('products.category')
            ->select(
                'products.category',
                DB::raw('COUNT(products.id) as product_count'),
                DB::raw('SUM(products.stock_quantity) as total_stock'),
                DB::raw('AVG(products.base_price) as average_price'),
                DB::raw('COALESCE(SUM(sales.quantity_sold), 0) as quantity_sold'),
                DB::raw('COALESCE(SUM(sales.revenue), 0) as revenue')
            )
            ->get();
    }

    /**
     * Get stock status.
     *
     * @param  int  $quantity
     * @return string
     */
    private function getStockStatus($quantity)
    {
        if ($quantity <= 0) {
            return 'Out of Stock';
        } elseif ($quantity <= 10) {
            return 'Low Stock';
        } elseif ($quantity <= 50) {
            return 'Medium Stock';
        } else {
            return 'High Stock';
        }
    }

    /**
     * Calculate days to sell (simplified).
     *
     * @param  \App\Models\Product  $product
     * @return float|null
     */
    private function calculateDaysToSell($product)
    {
        // This is a simplified calculation
        // In reality, you'd need historical sales data
        if ($product->total_quantity_sold > 0) {
            // Assuming we have 30 days of data
            $dailySalesRate = $product->total_quantity_sold / 30;
            if ($dailySalesRate > 0) {
                return round($product->stock_quantity / $dailySalesRate, 1);
            }
        }
        return null;
    }

    /**
     * Get success rate for response time range.
     *
     * @param  \Illuminate\Support\Collection  $quotes
     * @param  int|null  $minHours
     * @param  int|null  $maxHours
     * @return float
     */
    private function getSuccessRateForResponseTime($quotes, $minHours, $maxHours)
    {
        $filtered = $quotes->filter(function ($quote) use ($minHours, $maxHours) {
            if (!$quote->rfq || !$quote->created_at) {
                return false;
            }

            $hours = $quote->created_at->diffInHours($quote->rfq->created_at);

            if ($maxHours === null) {
                return $hours >= $minHours;
            }

            return $hours >= $minHours && $hours < $maxHours;
        });

        $total = $filtered->count();
        $accepted = $filtered->where('status', 'accepted')->count();

        return $total > 0 ? ($accepted / $total) * 100 : 0;
    }

    /**
     * Calculate growth compared to previous period.
     *
     * @param  array  $current
     * @param  array  $previous
     * @return array
     */
    private function calculateGrowth($current, $previous)
    {
        return [
            'revenue' => $previous['total_revenue'] > 0
                ? (($current['total_revenue'] - $previous['total_revenue']) / $previous['total_revenue']) * 100
                : 100,
            'orders' => $previous['total_orders'] > 0
                ? (($current['total_orders'] - $previous['total_orders']) / $previous['total_orders']) * 100
                : 100,
            'aov' => $previous['average_order_value'] > 0
                ? (($current['average_order_value'] - $previous['average_order_value']) / $previous['average_order_value']) * 100
                : 100,
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
                break;
            case 'month':
                $start = now()->startOfMonth();
                $end = now()->endOfMonth();
                break;
            case 'quarter':
                $start = now()->startOfQuarter();
                $end = now()->endOfQuarter();
                break;
            case 'year':
                $start = now()->startOfYear();
                $end = now()->endOfYear();
                break;
            case 'custom':
                $start = Carbon::parse($request->get('date_from', now()->startOfMonth()));
                $end = Carbon::parse($request->get('date_to', now()->endOfMonth()));
                break;
            default:
                $start = now()->startOfMonth();
                $end = now()->endOfMonth();
        }

        return [
            'period' => $period,
            'start' => $start,
            'end' => $end,
        ];
    }

    /**
     * Get comparison date range.
     *
     * @param  array  $dateRange
     * @return array
     */
    private function getComparisonRange($dateRange)
    {
        $diffInDays = $dateRange['start']->diffInDays($dateRange['end']);

        return [
            'start' => (clone $dateRange['start'])->subDays($diffInDays + 1),
            'end' => (clone $dateRange['start'])->subDay(),
        ];
    }
}
