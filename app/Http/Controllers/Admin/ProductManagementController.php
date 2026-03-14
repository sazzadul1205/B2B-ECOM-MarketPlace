<?php
// app/Http/Controllers/Admin/ProductManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductManagementController extends Controller
{
    /**
     * Display a listing of all products.
     */
    public function index(Request $request)
    {
        $query = Product::with([
            'supplier' => function ($q) {
                $q->with('user:id,name,email');
            },
            'bulkPrices'
        ]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by supplier
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Filter by stock
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock_quantity', '>', 0);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            } elseif ($request->stock_status === 'low_stock') {
                $query->where('stock_quantity', '>', 0)
                    ->where('stock_quantity', '<', 10);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                        $supplierQuery->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        // Date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate(15)
            ->appends($request->query());

        // Get statistics
        $stats = [
            'total' => Product::count(),
            'approved' => Product::where('status', 'approved')->count(),
            'pending' => Product::where('status', 'pending')->count(),
            'rejected' => Product::where('status', 'rejected')->count(),
            'total_value' => Product::sum(DB::raw('base_price * stock_quantity')),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->count(),
        ];

        // Get categories for filter
        $categories = Product::distinct()->pluck('category');

        // Get suppliers for filter
        $suppliers = Supplier::with('user:id,name')
            ->get(['id', 'company_name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'stats' => $stats,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'filters' => $request->only([
                'search',
                'status',
                'category',
                'supplier_id',
                'min_price',
                'max_price',
                'stock_status',
                'date_from',
                'date_to',
                'sort_field',
                'sort_direction'
            ]),
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::with([
            'supplier' => function ($q) {
                $q->with('user:id,name,email');
            },
            'bulkPrices' => function ($q) {
                $q->orderBy('min_quantity');
            }
        ])
            ->withCount('orderItems')
            ->findOrFail($id);

        // Get sales data
        $salesData = [
            'total_ordered' => $product->orderItems()->sum('quantity'),
            'total_revenue' => $product->orderItems()->sum('total_price'),
            'average_rating' => 4.5, // Would come from reviews table
            'times_purchased' => $product->orderItems()->count(),
        ];

        // Get recent orders containing this product
        $recentOrders = $product->orderItems()
            ->with('order.buyer:id,name')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'order_number' => $item->order->order_number,
                    'buyer_name' => $item->order->buyer->name,
                    'quantity' => $item->quantity,
                    'price' => $item->unit_price,
                    'date' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
            'salesData' => $salesData,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit($id)
    {
        $product = Product::with(['supplier', 'bulkPrices'])->findOrFail($id);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'base_price' => 'required|numeric|min:0',
            'minimum_order_quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|integer|min:0',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $product->update($validated);

        // Update bulk prices if provided
        if ($request->has('bulk_prices')) {
            $product->bulkPrices()->delete();
            foreach ($request->bulk_prices as $bulkPrice) {
                $product->bulkPrices()->create([
                    'min_quantity' => $bulkPrice['min_quantity'],
                    'max_quantity' => $bulkPrice['max_quantity'] ?? null,
                    'price' => $bulkPrice['price'],
                ]);
            }
        }

        return redirect()->route('admin.products.show', $product->id)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Check if product has orders
        $ordersCount = $product->orderItems()->count();
        if ($ordersCount > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete product with existing orders. Consider marking as inactive instead.'
            ]);
        }

        DB::transaction(function () use ($product) {
            // Delete bulk prices first
            $product->bulkPrices()->delete();
            // Delete the product
            $product->delete();
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Toggle product featured status.
     */
    public function toggleFeatured($id)
    {
        $product = Product::findOrFail($id);
        $product->update([
            'is_featured' => !$product->is_featured
        ]);

        $status = $product->is_featured ? 'featured' : 'unfeatured';
        return back()->with('success', "Product {$status} successfully.");
    }

    /**
     * Update product stock.
     */
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'adjustment_reason' => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($id);

        $oldStock = $product->stock_quantity;
        $product->update([
            'stock_quantity' => $request->stock_quantity,
            'last_stock_update' => now(),
            'stock_update_reason' => $request->adjustment_reason,
        ]);

        // Log stock adjustment
        // StockAdjustment::create([
        //     'product_id' => $product->id,
        //     'old_quantity' => $oldStock,
        //     'new_quantity' => $request->stock_quantity,
        //     'reason' => $request->adjustment_reason,
        //     'adjusted_by' => auth()->id(),
        // ]);

        return back()->with('success', 'Stock updated successfully.');
    }

    /**
     * Export products list.
     */
    public function export(Request $request)
    {
        $query = Product::with('supplier');

        // Apply filters (similar to index)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $products = $query->get();

        // Generate CSV
        $csvData = [];
        $csvData[] = ['ID', 'Name', 'Category', 'Base Price', 'Stock', 'Unit', 'MOQ', 'Status', 'Supplier', 'Created At'];

        foreach ($products as $product) {
            $csvData[] = [
                $product->id,
                $product->name,
                $product->category,
                $product->base_price,
                $product->stock_quantity,
                $product->unit,
                $product->minimum_order_quantity,
                ucfirst($product->status),
                $product->supplier->company_name,
                $product->created_at->format('Y-m-d'),
            ];
        }

        $filename = 'products-' . date('Y-m-d') . '.csv';
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
     * Get product statistics.
     */
    public function statistics()
    {
        $stats = [
            'by_category' => Product::select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->get(),
            'by_status' => Product::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get(),
            'by_supplier' => Product::with('supplier:id,company_name')
                ->select('supplier_id', DB::raw('count(*) as total'))
                ->groupBy('supplier_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
            'inventory_value' => [
                'total' => Product::sum(DB::raw('base_price * stock_quantity')),
                'by_category' => Product::select('category', DB::raw('SUM(base_price * stock_quantity) as value'))
                    ->groupBy('category')
                    ->get(),
            ],
            'recent_additions' => Product::where('created_at', '>=', now()->subDays(30))
                ->count(),
        ];

        return Inertia::render('Admin/Products/Statistics', [
            'stats' => $stats,
        ]);
    }

    /**
     * Bulk update products.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|in:approve,reject,feature,unfeature,delete',
        ]);

        $products = Product::whereIn('id', $request->product_ids);

        switch ($request->action) {
            case 'approve':
                $products->update(['status' => 'approved']);
                $message = 'Products approved successfully.';
                break;
            case 'reject':
                $products->update(['status' => 'rejected']);
                $message = 'Products rejected successfully.';
                break;
            case 'feature':
                $products->update(['is_featured' => true]);
                $message = 'Products featured successfully.';
                break;
            case 'unfeature':
                $products->update(['is_featured' => false]);
                $message = 'Products unfeatured successfully.';
                break;
            case 'delete':
                // Check if any have orders
                $hasOrders = $products->whereHas('orderItems')->exists();
                if ($hasOrders) {
                    return back()->withErrors(['error' => 'Cannot delete products with existing orders.']);
                }
                $products->delete();
                $message = 'Products deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }
}
