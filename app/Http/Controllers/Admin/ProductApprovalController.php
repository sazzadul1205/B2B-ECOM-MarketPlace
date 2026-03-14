<?php
// app/Http/Controllers/Admin/ProductApprovalController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductApprovalController extends Controller
{
    /**
     * Display a listing of products pending approval.
     */
    public function index(Request $request)
    {
        $query = Product::with(['supplier' => function ($q) {
            $q->with('user:id,name,email');
        }])
            ->where('status', 'pending');

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by supplier
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
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

        // Price range
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        $pendingProducts = $query->paginate(15)
            ->appends($request->query());

        // Get statistics
        $stats = [
            'pending' => Product::where('status', 'pending')->count(),
            'approved_today' => Product::where('status', 'approved')
                ->whereDate('updated_at', today())
                ->count(),
            'rejected_today' => Product::where('status', 'rejected')
                ->whereDate('updated_at', today())
                ->count(),
            'categories' => Product::where('status', 'pending')
                ->distinct('category')
                ->count('category'),
        ];

        // Get categories for filter
        $categories = Product::where('status', 'pending')
            ->distinct()
            ->pluck('category');

        // Get suppliers for filter
        $suppliers = Supplier::whereHas('products', function ($q) {
            $q->where('status', 'pending');
        })
            ->get(['id', 'company_name']);

        return Inertia::render('Admin/ProductApproval/Index', [
            'pendingProducts' => $pendingProducts,
            'stats' => $stats,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'category', 'supplier_id', 'date_from', 'date_to', 'min_price', 'max_price']),
        ]);
    }

    /**
     * Display the specified product for approval.
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
            ->findOrFail($id);

        // Get similar products for comparison
        $similarProducts = Product::where('category', $product->category)
            ->where('status', 'approved')
            ->where('id', '!=', $product->id)
            ->with('supplier:id,company_name')
            ->limit(5)
            ->get();

        // Get supplier's other products
        $supplierProducts = Product::where('supplier_id', $product->supplier_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'approved')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/ProductApproval/Show', [
            'product' => $product,
            'similarProducts' => $similarProducts,
            'supplierProducts' => $supplierProducts,
        ]);
    }

    /**
     * Approve a product.
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'featured' => 'boolean',
            'send_notification' => 'boolean',
        ]);

        $product = Product::with('supplier.user')->findOrFail($id);

        DB::transaction(function () use ($product, $request) {
            $product->update([
                'status' => 'approved',
                'approval_notes' => $request->notes,
                'is_featured' => $request->featured ?? false,
            ]);

            // Send notification if requested
            if ($request->send_notification) {
                $this->sendApprovalNotification($product, 'approved');
            }
        });

        return redirect()->route('admin.product-approval.index')
            ->with('success', 'Product has been approved successfully.');
    }

    /**
     * Reject a product.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'rejection_details' => 'nullable|array',
            'send_notification' => 'boolean',
        ]);

        $product = Product::with('supplier.user')->findOrFail($id);

        DB::transaction(function () use ($product, $request) {
            $product->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejected_by' => auth()->id(),
                'rejection_reason' => $request->rejection_reason,
                'rejection_details' => json_encode($request->rejection_details),
            ]);

            // Send notification if requested
            if ($request->send_notification) {
                $this->sendApprovalNotification($product, 'rejected', $request->rejection_reason);
            }
        });

        return redirect()->route('admin.product-approval.index')
            ->with('success', 'Product has been rejected.');
    }

    /**
     * Bulk approve products.
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $count = Product::whereIn('id', $request->product_ids)
            ->where('status', 'pending')
            ->count();

        Product::whereIn('id', $request->product_ids)
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
            ]);

        return back()->with('success', "{$count} products have been approved successfully.");
    }

    /**
     * Get product statistics.
     */
    public function statistics()
    {
        $stats = [
            'by_category' => Product::where('status', 'pending')
                ->select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->get(),
            'by_supplier' => Product::where('status', 'pending')
                ->with('supplier:id,company_name')
                ->select('supplier_id', DB::raw('count(*) as total'))
                ->groupBy('supplier_id')
                ->limit(10)
                ->get(),
            'price_range' => [
                'min' => Product::where('status', 'pending')->min('base_price'),
                'max' => Product::where('status', 'pending')->max('base_price'),
                'avg' => Product::where('status', 'pending')->avg('base_price'),
            ],
            'weekly_trend' => $this->getWeeklyTrend(),
        ];

        return Inertia::render('Admin/ProductApproval/Statistics', [
            'stats' => $stats,
        ]);
    }

    /**
     * Private helper methods
     */
    private function sendApprovalNotification($product, $status, $reason = null)
    {
        // Mail::to($product->supplier->company_email)->send(new ProductApprovalMail($product, $status, $reason));
    }

    private function getWeeklyTrend()
    {
        return Product::where('status', 'pending')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }
}
