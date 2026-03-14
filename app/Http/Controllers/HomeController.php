<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // Build products query with filters
        $productsQuery = Product::where('status', 'approved')
            ->with(['supplier' => function ($query) {
                $query->select('id', 'user_id', 'company_name', 'verification_status');
            }]);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $productsQuery->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('category', 'like', "%{$searchTerm}%");
            });
        }

        // Apply category filter
        if ($request->has('category') && !empty($request->category)) {
            $productsQuery->where('category', $request->category);
        }

        // Apply price range filter
        if ($request->has('min_price') && !empty($request->min_price)) {
            $productsQuery->where('base_price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && !empty($request->max_price)) {
            $productsQuery->where('base_price', '<=', $request->max_price);
        }

        // Apply supplier filter
        if ($request->has('supplier_id') && !empty($request->supplier_id)) {
            $productsQuery->where('supplier_id', $request->supplier_id);
        }

        // Apply verified supplier only filter
        if ($request->has('verified_only') && $request->verified_only) {
            $productsQuery->whereHas('supplier', function ($q) {
                $q->where('verification_status', 'verified');
            });
        }

        // Apply sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['name', 'base_price', 'created_at', 'minimum_order_quantity'];
        if (in_array($sortField, $allowedSortFields)) {
            $productsQuery->orderBy($sortField, $sortOrder);
        }

        // Get products with pagination
        $products = $productsQuery
            ->select(
                'id',
                'name',
                'slug',
                'base_price',
                'main_image',
                'category',
                'minimum_order_quantity',
                'unit',
                'supplier_id',
                'created_at'
            )
            ->paginate(12) // 12 products per page
            ->withQueryString() // Keep query parameters in pagination links
            ->through(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->base_price,
                    'image' => $product->main_image,
                    'category' => $product->category,
                    'moq' => $product->minimum_order_quantity,
                    'unit' => $product->unit,
                    'created_at' => $product->created_at->format('Y-m-d'),
                    'supplier' => $product->supplier ? [
                        'id' => $product->supplier->id,
                        'name' => $product->supplier->company_name,
                        'verified' => $product->supplier->verification_status === 'verified',
                    ] : null,
                ];
            });

        // Get all categories for filter dropdown
        $categories = Product::where('status', 'approved')
            ->select('category')
            ->selectRaw('count(*) as product_count')
            ->groupBy('category')
            ->orderBy('product_count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category,
                    'count' => $item->product_count,
                ];
            });

        // Get all suppliers for filter dropdown
        $suppliers = Supplier::whereHas('products', function ($q) {
            $q->where('status', 'approved');
        })
            ->select('id', 'company_name', 'verification_status')
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->company_name,
                    'verified' => $supplier->verification_status === 'verified',
                ];
            });

        // Statistics (unchanged)
        $stats = [
            'suppliers' => Supplier::where('verification_status', 'verified')->count(),
            'products' => Product::where('status', 'approved')->count(),
            'successfulDeals' => Order::where('order_status', Order::STATUS_DELIVERED)->count(),
            'buyers' => User::where('role', 'buyer')->where('is_active', true)->count(),
        ];

        // Recent successful deals (unchanged)
        $successStories = Order::where('order_status', Order::STATUS_DELIVERED)
            ->with([
                'buyer' => fn($q) => $q->select('id', 'name'),
                'supplier' => fn($q) => $q->select('id', 'name'),
                'items' => fn($q) => $q->select('id', 'order_id', 'product_name'),
            ])
            ->select('id', 'order_number', 'buyer_id', 'supplier_id', 'created_at', 'total_amount')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'buyer' => $order->buyer ? $order->buyer->name : 'Anonymous',
                    'supplier' => $order->supplier ? $order->supplier->name : 'Anonymous',
                    'product' => $order->items->first() ? $order->items->first()->product_name : 'Various Products',
                    'date' => $order->created_at->format('Y-m-d'),
                    'amount' => $order->total_amount,
                ];
            });

        // Get filter parameters for frontend
        $filters = [
            'search' => $request->search,
            'category' => $request->category,
            'min_price' => $request->min_price,
            'max_price' => $request->max_price,
            'supplier_id' => $request->supplier_id,
            'verified_only' => $request->verified_only,
            'sort_by' => $request->sort_by,
            'sort_order' => $request->sort_order,
        ];

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'stats' => $stats,
            'successStories' => $successStories,
            'user' => auth()->user(),
            'filters' => $filters,
        ]);
    }
}
