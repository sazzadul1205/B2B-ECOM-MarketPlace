<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\RfqQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of saved/followed suppliers.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get suppliers the buyer has interacted with (saved/followed)
        // You'll need to create a saved_suppliers pivot table for this functionality
        $savedSupplierIds = $this->getSavedSupplierIds($user->id);

        $query = Supplier::whereIn('user_id', $savedSupplierIds)
            ->with(['user', 'products' => function ($q) {
                $q->where('status', 'active')->limit(3);
            }]);

        // Filter by verification status
        if ($request->filled('verified')) {
            $query->where('verification_status', $request->verified === 'yes' ? 'verified' : 'pending');
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Search by company name
        if ($request->filled('search')) {
            $query->where('company_name', 'like', '%' . $request->search . '%');
        }

        // Sort suppliers
        $sort = $request->get('sort', 'name_asc');
        switch ($sort) {
            case 'name_desc':
                $query->orderBy('company_name', 'desc');
                break;
            case 'recent':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default: // name_asc
                $query->orderBy('company_name', 'asc');
                break;
        }

        $suppliers = $query->paginate(12)->withQueryString();

        // Get activity stats for each saved supplier
        foreach ($suppliers as $supplier) {
            $supplier->stats = $this->getSupplierInteractionStats($user->id, $supplier->user_id);
        }

        // Get cities for filter dropdown
        $cities = Supplier::whereIn('user_id', $savedSupplierIds)
            ->distinct()
            ->pluck('city');

        return Inertia::render('Buyer/Suppliers/Index', compact('suppliers', 'cities'));
    }

    /**
     * Display the specified supplier profile.
     */
    public function show($userId)
    {
        $buyerId = Auth::id();

        $supplier = User::where('id', $userId)
            ->where('role', 'supplier')
            ->with(['supplier'])
            ->firstOrFail();

        // Check if supplier profile exists
        if (!$supplier->supplier) {
            abort(404, 'Supplier profile not found.');
        }

        // Get supplier products
        $products = Product::where('supplier_id', $supplier->supplier->id)
            ->where('status', 'active')
            ->with('bulkPrices')
            ->paginate(8);

        // Get recent quotes from this supplier to the buyer
        $recentQuotes = RfqQuote::where('supplier_id', $userId)
            ->whereHas('rfq', function ($q) use ($buyerId) {
                $q->where('buyer_id', $buyerId);
            })
            ->with('rfq')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get completed orders with this supplier
        $completedOrders = Order::where('buyer_id', $buyerId)
            ->where('supplier_id', $userId)
            ->where('order_status', Order::STATUS_DELIVERED)
            ->count();

        // Check if supplier is saved/followed
        $isSaved = $this->isSupplierSaved($buyerId, $userId);

        // Get supplier stats
        $stats = [
            'total_products' => Product::where('supplier_id', $supplier->supplier->id)->where('status', 'active')->count(),
            'total_quotes' => RfqQuote::where('supplier_id', $userId)->count(),
            'completed_orders' => $completedOrders,
            'response_rate' => $this->calculateResponseRate($userId),
            'avg_response_time' => $this->calculateAvgResponseTime($userId, $buyerId),
        ];

        // Get reviews/ratings (if you have a reviews system)
        $reviews = $this->getSupplierReviews($userId);

        return Inertia::render('Buyer/Suppliers/Show', compact('supplier', 'products', 'recentQuotes', 'stats', 'isSaved', 'reviews'));
    }

    /**
     * Save/follow a supplier.
     */
    public function save($supplierId)
    {
        $buyerId = Auth::id();

        // Verify supplier exists
        $supplier = User::where('id', $supplierId)
            ->where('role', 'supplier')
            ->firstOrFail();

        // Save supplier (you need to implement this based on your database structure)
        $saved = $this->saveSupplier($buyerId, $supplierId);

        if ($saved) {
            return response()->json([
                'success' => true,
                'message' => 'Supplier saved successfully.',
                'action' => 'saved'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to save supplier.'
        ], 500);
    }

    /**
     * Unsave/unfollow a supplier.
     */
    public function unsave($supplierId)
    {
        $buyerId = Auth::id();

        // Remove from saved suppliers
        $unsaved = $this->unsaveSupplier($buyerId, $supplierId);

        if ($unsaved) {
            return response()->json([
                'success' => true,
                'message' => 'Supplier removed from saved list.',
                'action' => 'unsaved'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to remove supplier.'
        ], 500);
    }

    /**
     * Toggle save/unfollow status (AJAX endpoint).
     */
    public function toggleSave(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:users,id'
        ]);

        $buyerId = Auth::id();
        $supplierId = $request->supplier_id;

        $isSaved = $this->isSupplierSaved($buyerId, $supplierId);

        if ($isSaved) {
            $this->unsaveSupplier($buyerId, $supplierId);
            $message = 'Supplier removed from saved list.';
            $action = 'unsaved';
        } else {
            $this->saveSupplier($buyerId, $supplierId);
            $message = 'Supplier saved successfully.';
            $action = 'saved';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'action' => $action,
            'is_saved' => !$isSaved
        ]);
    }

    /**
     * Get supplier products (AJAX endpoint for lazy loading).
     */
    public function getProducts(Request $request, $supplierId)
    {
        $supplier = User::where('id', $supplierId)
            ->where('role', 'supplier')
            ->with('supplier')
            ->firstOrFail();

        $products = Product::where('supplier_id', $supplier->supplier->id)
            ->where('status', 'active')
            ->with('bulkPrices')
            ->paginate(12);

        if ($request->wantsJson()) {
            return response()->json($products);
        }

        return view('buyer.suppliers.partials.products', compact('products'));
    }

    /**
     * Search suppliers (AJAX endpoint for live search).
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $suppliers = Supplier::where('company_name', 'like', '%' . $request->query . '%')
            ->orWhere('city', 'like', '%' . $request->query . '%')
            ->with('user')
            ->limit(10)
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->user_id,
                    'company_name' => $supplier->company_name,
                    'city' => $supplier->city,
                    'verification_status' => $supplier->verification_status,
                    'product_count' => $supplier->products()->where('status', 'active')->count(),
                ];
            });

        return response()->json($suppliers);
    }

    /**
     * Get suppliers by category (suppliers that have products in a category).
     */
    public function byCategory($category)
    {
        $suppliers = Supplier::whereHas('products', function ($q) use ($category) {
            $q->where('category', $category)
                ->where('status', 'active');
        })
            ->with('user')
            ->paginate(12);

        return Inertia::render('Buyer/Suppliers/ByCategory', compact('suppliers', 'category'));
    }

    /**
     * Get featured/recommended suppliers.
     */
    public function featured()
    {
        // Get top suppliers based on order volume, ratings, etc.
        $suppliers = Supplier::where('verification_status', 'verified')
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active');
            }])
            ->with('user')
            ->orderBy('products_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json($suppliers);
    }

    /**
     * Get supplier statistics for dashboard.
     */
    public function statistics()
    {
        $buyerId = Auth::id();
        $savedSupplierIds = $this->getSavedSupplierIds($buyerId);

        $stats = [
            'total_saved' => count($savedSupplierIds),
            'verified_suppliers' => Supplier::whereIn('user_id', $savedSupplierIds)
                ->where('verification_status', 'verified')
                ->count(),
            'active_quotes' => RfqQuote::whereIn('supplier_id', $savedSupplierIds)
                ->whereHas('rfq', function ($q) use ($buyerId) {
                    $q->where('buyer_id', $buyerId);
                })
                ->where('status', 'pending')
                ->count(),
            'total_orders' => Order::where('buyer_id', $buyerId)
                ->whereIn('supplier_id', $savedSupplierIds)
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get saved supplier IDs (helper method).
     * You need to implement this based on your database structure.
     */
    private function getSavedSupplierIds($buyerId)
    {
        // Option 1: If you have a saved_suppliers pivot table
        // return DB::table('saved_suppliers')
        //     ->where('buyer_id', $buyerId)
        //     ->pluck('supplier_id')
        //     ->toArray();

        // Option 2: If you're using JSON column in users table
        // $user = User::find($buyerId);
        // return $user->saved_suppliers ?? [];

        // Option 3: For now, return suppliers the buyer has interacted with
        $interactedSupplierIds = collect();

        // Get suppliers from quotes
        $quoteSupplierIds = RfqQuote::whereHas('rfq', function ($q) use ($buyerId) {
            $q->where('buyer_id', $buyerId);
        })->pluck('supplier_id');

        $interactedSupplierIds = $interactedSupplierIds->concat($quoteSupplierIds);

        // Get suppliers from orders
        $orderSupplierIds = Order::where('buyer_id', $buyerId)
            ->pluck('supplier_id');

        $interactedSupplierIds = $interactedSupplierIds->concat($orderSupplierIds);

        return $interactedSupplierIds->unique()->toArray();
    }

    /**
     * Check if supplier is saved (helper method).
     */
    private function isSupplierSaved($buyerId, $supplierId)
    {
        // Implement based on your saved suppliers mechanism
        // return DB::table('saved_suppliers')
        //     ->where('buyer_id', $buyerId)
        //     ->where('supplier_id', $supplierId)
        //     ->exists();

        // For now, check if they've interacted
        return in_array($supplierId, $this->getSavedSupplierIds($buyerId));
    }

    /**
     * Save supplier (helper method).
     */
    private function saveSupplier($buyerId, $supplierId)
    {
        // Implement based on your database structure
        // Example with pivot table:
        // return DB::table('saved_suppliers')->insert([
        //     'buyer_id' => $buyerId,
        //     'supplier_id' => $supplierId,
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);

        // For now, just return true (you need to implement properly)
        return true;
    }

    /**
     * Unsave supplier (helper method).
     */
    private function unsaveSupplier($buyerId, $supplierId)
    {
        // Implement based on your database structure
        // Example with pivot table:
        // return DB::table('saved_suppliers')
        //     ->where('buyer_id', $buyerId)
        //     ->where('supplier_id', $supplierId)
        //     ->delete();

        // For now, just return true (you need to implement properly)
        return true;
    }

    /**
     * Get supplier interaction stats (helper method).
     */
    private function getSupplierInteractionStats($buyerId, $supplierId)
    {
        $quotesCount = RfqQuote::where('supplier_id', $supplierId)
            ->whereHas('rfq', function ($q) use ($buyerId) {
                $q->where('buyer_id', $buyerId);
            })
            ->count();

        $ordersCount = Order::where('buyer_id', $buyerId)
            ->where('supplier_id', $supplierId)
            ->count();

        $lastInteraction = Order::where('buyer_id', $buyerId)
            ->where('supplier_id', $supplierId)
            ->orderBy('created_at', 'desc')
            ->first();

        return [
            'quotes_count' => $quotesCount,
            'orders_count' => $ordersCount,
            'last_interaction' => $lastInteraction ? $lastInteraction->created_at->diffForHumans() : 'Never',
        ];
    }

    /**
     * Calculate supplier response rate (helper method).
     */
    private function calculateResponseRate($supplierId)
    {
        // This would need a proper implementation based on your messaging system
        // For now, return a placeholder
        return rand(85, 100) . '%';
    }

    /**
     * Calculate average response time (helper method).
     */
    private function calculateAvgResponseTime($supplierId, $buyerId)
    {
        // This would need a proper implementation based on your messaging system
        // For now, return a placeholder
        $hours = rand(1, 24);
        return $hours . ' ' . ($hours == 1 ? 'hour' : 'hours');
    }

    /**
     * Get supplier reviews (helper method).
     * Implement this if you have a reviews/ratings system.
     */
    private function getSupplierReviews($supplierId)
    {
        // Return empty collection for now
        return collect([]);
    }
}
