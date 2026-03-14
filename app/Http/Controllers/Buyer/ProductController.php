<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of products for buyers.
     */
    public function index(Request $request)
    {
        $query = Product::where('status', 'approved')  // Changed from 'active' to 'approved'
            ->with(['supplier.user', 'bulkPrices']);

        // Search by product name or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by supplier
        if ($request->filled('supplier')) {
            $query->where('supplier_id', $request->supplier);
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Filter by minimum order quantity
        if ($request->filled('moq')) {
            $query->where('minimum_order_quantity', '<=', $request->moq);
        }

        // Sort products
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('base_price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->paginate(12)->withQueryString();

        // Get unique categories for filter dropdown
        $categories = Product::where('status', 'approved')  // Changed from 'active' to 'approved'
            ->distinct()
            ->pluck('category');

        return Inertia::render('Buyer/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->all()
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'approved')  // Changed from 'active' to 'approved'
            ->with([
                'supplier.user',
                'bulkPrices' => function ($query) {
                    $query->orderBy('min_quantity', 'asc');
                }
            ])
            ->firstOrFail();

        // Get related products from same supplier
        $relatedProducts = Product::where('supplier_id', $product->supplier_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'approved')  // Changed from 'active' to 'approved'
            ->limit(4)
            ->get();

        // Calculate bulk price tiers for display
        $bulkTiers = [];
        $currentQty = $product->minimum_order_quantity;

        // Add MOQ as first tier
        $bulkTiers[] = [
            'quantity' => $currentQty,
            'price' => $product->base_price,
            'total' => $currentQty * $product->base_price
        ];

        // Add bulk price tiers
        foreach ($product->bulkPrices as $bulkPrice) {
            $bulkTiers[] = [
                'quantity' => $bulkPrice->min_quantity,
                'price' => $bulkPrice->price,
                'total' => $bulkPrice->min_quantity * $bulkPrice->price,
                'savings' => $this->calculateSavings($product->base_price, $bulkPrice->price, $bulkPrice->min_quantity)
            ];
        }

        // Remove duplicates and sort by quantity
        $bulkTiers = collect($bulkTiers)
            ->unique('quantity')
            ->sortBy('quantity')
            ->values()
            ->all();

        return Inertia::render('Buyer/Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'bulkTiers' => $bulkTiers
        ]);
    }

    /**
     * Calculate savings percentage for bulk pricing.
     */
    private function calculateSavings($basePrice, $bulkPrice, $quantity)
    {
        if ($basePrice <= 0) return 0;

        $regularTotal = $basePrice * $quantity;
        $bulkTotal = $bulkPrice * $quantity;
        $savings = $regularTotal - $bulkTotal;
        $savingsPercentage = ($savings / $regularTotal) * 100;

        return round($savingsPercentage, 1);
    }

    /**
     * Get bulk price for a specific quantity (AJAX endpoint).
     */
    public function getBulkPrice(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if quantity meets MOQ
        if ($request->quantity < $product->minimum_order_quantity) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimum order quantity is ' . $product->minimum_order_quantity,
                'moq' => $product->minimum_order_quantity
            ]);
        }

        $price = $product->getBulkPriceForQuantity($request->quantity);
        $total = $price * $request->quantity;

        // Find applicable bulk price tier
        $applicableTier = null;
        foreach ($product->bulkPrices as $bulkPrice) {
            if ($request->quantity >= $bulkPrice->min_quantity) {
                if (is_null($bulkPrice->max_quantity) || $request->quantity <= $bulkPrice->max_quantity) {
                    $applicableTier = $bulkPrice;
                    break;
                }
            }
        }

        return response()->json([
            'valid' => true,
            'unit_price' => number_format($price, 2),
            'total_price' => number_format($total, 2),
            'applicable_tier' => $applicableTier ? [
                'min_quantity' => $applicableTier->min_quantity,
                'max_quantity' => $applicableTier->max_quantity ?? 'Any',
                'price' => number_format($applicableTier->price, 2)
            ] : null
        ]);
    }

    /**
     * Search products (AJAX endpoint for live search).
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $products = Product::where('status', 'approved')  // Changed from 'active' to 'approved'
            ->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->query . '%')
                    ->orWhere('description', 'like', '%' . $request->query . '%');
            })
            ->with('supplier.user')
            ->limit(10)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'base_price' => number_format($product->base_price, 2),
                    'moq' => $product->minimum_order_quantity,
                    'unit' => $product->unit,
                    'main_image' => $product->main_image,
                    'supplier' => $product->supplier->user->name ?? 'Unknown',
                    'category' => $product->category
                ];
            });

        return response()->json($products);
    }

    /**
     * Filter products by category (AJAX endpoint).
     */
    public function byCategory(Request $request, $category)
    {
        $products = Product::where('status', 'approved')  // Changed from 'active' to 'approved'
            ->where('category', $category)
            ->with(['supplier.user', 'bulkPrices'])
            ->paginate(12);

        if ($request->wantsJson()) {
            return response()->json($products);
        }

        return Inertia::render('Buyer/Products/Index', [
            'products' => $products,
            'categories' => Product::where('status', 'approved')->distinct()->pluck('category'),
            'filters' => ['category' => $category]
        ]);
    }

    /**
     * Get product details for quick view modal (AJAX endpoint).
     */
    public function quickView($id)
    {
        $product = Product::with(['supplier.user', 'bulkPrices'])
            ->where('status', 'approved')  // Changed from 'active' to 'approved'
            ->findOrFail($id);

        $bulkPrices = $product->bulkPrices()
            ->orderBy('min_quantity', 'asc')
            ->get();

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'base_price' => $product->base_price,
                'formatted_price' => number_format($product->base_price, 2),
                'moq' => $product->minimum_order_quantity,
                'unit' => $product->unit,
                'category' => $product->category,
                'main_image' => $product->main_image,
                'slug' => $product->slug,
                'supplier' => [
                    'name' => $product->supplier->user->name ?? 'Unknown',
                    'company_name' => $product->supplier->company_name ?? '',
                    'verified' => $product->supplier->verification_status === 'verified',
                ],
                'bulk_prices' => $bulkPrices->map(function ($price) {
                    return [
                        'min_quantity' => $price->min_quantity,
                        'max_quantity' => $price->max_quantity,
                        'price' => $price->price,
                        'formatted_price' => number_format($price->price, 2)
                    ];
                })
            ]
        ]);
    }

    /**
     * Get supplier products (for supplier profile page).
     */
    public function supplierProducts($supplierId)
    {
        $products = Product::where('supplier_id', $supplierId)
            ->where('status', 'approved')  // Changed from 'active' to 'approved'
            ->with('bulkPrices')
            ->paginate(12);

        return Inertia::render('Buyer/Products/SupplierProducts', [
            'products' => $products,
            'supplierId' => $supplierId
        ]);
    }

    /**
     * Get featured products for homepage.
     */
    public function featured()
    {
        $products = Product::where('status', 'approved')  // Changed from 'active' to 'approved'
            ->with(['supplier.user'])
            ->inRandomOrder()
            ->limit(8)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'base_price' => $product->base_price,
                    'formatted_price' => number_format($product->base_price, 2),
                    'moq' => $product->minimum_order_quantity,
                    'unit' => $product->unit,
                    'category' => $product->category,
                    'main_image' => $product->main_image,
                    'supplier' => [
                        'name' => $product->supplier->user->name ?? 'Unknown',
                        'verified' => $product->supplier->verification_status === 'verified',
                    ]
                ];
            });

        return response()->json($products);
    }
}
