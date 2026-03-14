<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products with filters.
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

        // Build query with filters
        $query = Product::where('supplier_id', $supplier->id)
            ->with('bulkPrices');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search by name or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort products
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Get products with pagination
        $products = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Product::where('supplier_id', $supplier->id)->count(),
            'active' => Product::where('supplier_id', $supplier->id)->where('status', 'active')->count(),
            'pending' => Product::where('supplier_id', $supplier->id)->where('status', 'pending')->count(),
            'inactive' => Product::where('supplier_id', $supplier->id)->where('status', 'inactive')->count(),
            'out_of_stock' => Product::where('supplier_id', $supplier->id)
                ->where('stock_quantity', '<=', 0)
                ->count(),
            'low_stock' => Product::where('supplier_id', $supplier->id)
                ->where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 10)
                ->count(),
        ];

        // Get unique categories for filter
        $categories = Product::where('supplier_id', $supplier->id)
            ->distinct()
            ->pluck('category');

        return Inertia::render('Supplier/Products/Index', compact('products', 'stats', 'categories'));
    }

    /**
     * Show the form for creating a new product.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        if (!$supplier) {
            return redirect()->route('supplier.profile.edit')
                ->with('error', 'Please complete your supplier profile first.');
        }

        // Common categories (you can move this to a config file)
        $categories = [
            'Electronics',
            'Furniture',
            'Clothing',
            'Food & Beverages',
            'Chemicals',
            'Machinery',
            'Automotive',
            'Construction Materials',
            'Medical Equipment',
            'Office Supplies',
            'Packaging Materials',
            'Raw Materials',
            'Textiles',
            'Tools & Hardware',
            'Other'
        ];

        $units = [
            'piece',
            'kg',
            'gram',
            'liter',
            'ml',
            'meter',
            'cm',
            'box',
            'set',
            'dozen',
            'pair',
            'roll',
            'sheet'
        ];

        return Inertia::render('Supplier/Products/Create', compact('categories', 'units'));
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        if (!$supplier) {
            return redirect()->route('supplier.profile.edit')
                ->with('error', 'Please complete your supplier profile first.');
        }

        // Validate the request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'base_price' => 'required|numeric|min:0',
            'minimum_order_quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:50',
            'stock_quantity' => 'required|integer|min:0',
            'main_image' => 'nullable|image|max:2048', // 2MB max
            'additional_images.*' => 'nullable|image|max:2048',
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();

        // Add supplier ID
        $validated['supplier_id'] = $supplier->id;

        // Set status to pending for admin approval
        $validated['status'] = 'pending';

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            $path = $request->file('main_image')->store('products/main', 'public');
            $validated['main_image'] = $path;
        }

        // Handle additional images
        if ($request->hasFile('additional_images')) {
            $additionalImages = [];
            foreach ($request->file('additional_images') as $image) {
                $path = $image->store('products/additional', 'public');
                $additionalImages[] = $path;
            }
            $validated['additional_images'] = json_encode($additionalImages);
        }

        // Create product
        $product = Product::create($validated);

        // Handle bulk prices if provided
        if ($request->has('bulk_prices') && is_array($request->bulk_prices)) {
            $this->saveBulkPrices($product, $request->bulk_prices);
        }

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product created successfully and is pending approval.');
    }

    /**
     * Show the form for editing the specified product.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)
            ->with('bulkPrices')
            ->findOrFail($id);

        $categories = [
            'Electronics',
            'Furniture',
            'Clothing',
            'Food & Beverages',
            'Chemicals',
            'Machinery',
            'Automotive',
            'Construction Materials',
            'Medical Equipment',
            'Office Supplies',
            'Packaging Materials',
            'Raw Materials',
            'Textiles',
            'Tools & Hardware',
            'Other'
        ];

        $units = [
            'piece',
            'kg',
            'gram',
            'liter',
            'ml',
            'meter',
            'cm',
            'box',
            'set',
            'dozen',
            'pair',
            'roll',
            'sheet'
        ];

        return Inertia::render('Supplier/Products/Edit', compact('product', 'categories', 'units'));
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)->findOrFail($id);

        // Validate the request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'base_price' => 'required|numeric|min:0',
            'minimum_order_quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:50',
            'stock_quantity' => 'required|integer|min:0',
            'main_image' => 'nullable|image|max:2048',
            'additional_images.*' => 'nullable|image|max:2048',
            'status' => 'sometimes|in:active,inactive',
        ]);

        // Update slug only if name changed
        if ($product->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            // Delete old image
            if ($product->main_image) {
                Storage::disk('public')->delete($product->main_image);
            }
            $path = $request->file('main_image')->store('products/main', 'public');
            $validated['main_image'] = $path;
        }

        // Handle additional images
        if ($request->hasFile('additional_images')) {
            $additionalImages = [];
            foreach ($request->file('additional_images') as $image) {
                $path = $image->store('products/additional', 'public');
                $additionalImages[] = $path;
            }

            // Merge with existing images if any
            $existingImages = json_decode($product->additional_images ?? '[]', true);
            $validated['additional_images'] = json_encode(array_merge($existingImages, $additionalImages));
        }

        // Update product
        $product->update($validated);

        // Handle bulk prices if provided
        if ($request->has('bulk_prices') && is_array($request->bulk_prices)) {
            // Delete existing bulk prices
            $product->bulkPrices()->delete();
            // Save new bulk prices
            $this->saveBulkPrices($product, $request->bulk_prices);
        }

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)->findOrFail($id);

        // Check if product has any orders
        if ($product->orderItems()->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Cannot delete product with existing orders. You can deactivate it instead.');
        }

        // Delete images
        if ($product->main_image) {
            Storage::disk('public')->delete($product->main_image);
        }

        $additionalImages = json_decode($product->additional_images ?? '[]', true);
        foreach ($additionalImages as $image) {
            Storage::disk('public')->delete($image);
        }

        // Delete bulk prices
        $product->bulkPrices()->delete();

        // Delete product
        $product->delete();

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Manage bulk pricing tiers.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function bulkPrices($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)
            ->with('bulkPrices')
            ->findOrFail($id);

        return Inertia::render('Supplier/Products/BulkPrices', compact('product'));
    }

    /**
     * Update stock quantity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStock(Request $request, $id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)->findOrFail($id);

        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'adjustment_type' => 'required|in:set,add,subtract',
            'reason' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($product, $validated) {
            $oldStock = $product->stock_quantity;
            $newStock = $validated['stock_quantity'];

            switch ($validated['adjustment_type']) {
                case 'add':
                    $newStock = $oldStock + $validated['stock_quantity'];
                    break;
                case 'subtract':
                    $newStock = max(0, $oldStock - $validated['stock_quantity']);
                    break;
                case 'set':
                    // Use as is
                    break;
            }

            $product->update(['stock_quantity' => $newStock]);

            // Log stock adjustment (if you have a stock movements table)
            // StockMovement::create([
            //     'product_id' => $product->id,
            //     'old_quantity' => $oldStock,
            //     'new_quantity' => $newStock,
            //     'reason' => $validated['reason'],
            //     'user_id' => Auth::id(),
            // ]);
        });

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Stock updated successfully.');
    }

    /**
     * Toggle product status (active/inactive).
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleStatus($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $product = Product::where('supplier_id', $supplier->id)->findOrFail($id);

        $newStatus = $product->status === 'active' ? 'inactive' : 'active';
        $product->update(['status' => $newStatus]);

        $message = $newStatus === 'active'
            ? 'Product activated successfully.'
            : 'Product deactivated successfully.';

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * Save bulk pricing tiers.
     *
     * @param  \App\Models\Product  $product
     * @param  array  $bulkPrices
     * @return void
     */
    private function saveBulkPrices(Product $product, array $bulkPrices)
    {
        foreach ($bulkPrices as $priceData) {
            // Skip empty entries
            if (empty($priceData['min_quantity']) || empty($priceData['price'])) {
                continue;
            }

            $product->bulkPrices()->create([
                'min_quantity' => $priceData['min_quantity'],
                'max_quantity' => $priceData['max_quantity'] ?? null,
                'price' => $priceData['price'],
            ]);
        }
    }

    /**
     * Duplicate a product.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function duplicate($id)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $originalProduct = Product::where('supplier_id', $supplier->id)
            ->with('bulkPrices')
            ->findOrFail($id);

        DB::transaction(function () use ($originalProduct, $supplier) {
            // Replicate product
            $newProduct = $originalProduct->replicate();
            $newProduct->name = $originalProduct->name . ' (Copy)';
            $newProduct->slug = Str::slug($newProduct->name) . '-' . uniqid();
            $newProduct->status = 'pending';
            $newProduct->created_at = now();
            $newProduct->updated_at = now();
            $newProduct->save();

            // Replicate bulk prices
            foreach ($originalProduct->bulkPrices as $bulkPrice) {
                $newBulkPrice = $bulkPrice->replicate();
                $newBulkPrice->product_id = $newProduct->id;
                $newBulkPrice->save();
            }
        });

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product duplicated successfully.');
    }

    /**
     * Bulk delete products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer',
        ]);

        $user = Auth::user();
        $supplier = $user->supplier;

        $products = Product::where('supplier_id', $supplier->id)
            ->whereIn('id', $request->product_ids)
            ->get();

        $deletedCount = 0;
        $skippedCount = 0;

        foreach ($products as $product) {
            // Check if product has orders
            if ($product->orderItems()->exists()) {
                $skippedCount++;
                continue;
            }

            // Delete images
            if ($product->main_image) {
                Storage::disk('public')->delete($product->main_image);
            }

            $additionalImages = json_decode($product->additional_images ?? '[]', true);
            foreach ($additionalImages as $image) {
                Storage::disk('public')->delete($image);
            }

            // Delete bulk prices
            $product->bulkPrices()->delete();

            // Delete product
            $product->delete();
            $deletedCount++;
        }

        $message = "{$deletedCount} products deleted successfully.";
        if ($skippedCount > 0) {
            $message .= " {$skippedCount} products were skipped because they have existing orders.";
        }

        return redirect()
            ->route('supplier.products.index')
            ->with('success', $message);
    }
}
