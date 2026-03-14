<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Initialize cart session or get existing cart.
     */
    protected function getCart()
    {
        if (Auth::check()) {
            // For logged-in users, get or create cart from database
            $cart = Cart::firstOrCreate(
                ['user_id' => Auth::id()],
                ['session_id' => null]
            );

            // Sync any items from session cart if exists
            $this->syncSessionCartToDatabase($cart);

            return $cart;
        } else {
            // For guests, use session-based cart
            $sessionId = Session::getId();
            $cart = Cart::firstOrCreate(
                ['session_id' => $sessionId],
                ['user_id' => null]
            );

            return $cart;
        }
    }

    /**
     * Sync session cart items to database when user logs in.
     */
    protected function syncSessionCartToDatabase($databaseCart)
    {
        $sessionId = Session::getPreviousSessionId() ?? Session::getId();
        $sessionCart = Cart::where('session_id', $sessionId)
            ->where('user_id', null)
            ->first();

        if ($sessionCart && $sessionCart->items->count() > 0) {
            foreach ($sessionCart->items as $sessionItem) {
                $existingItem = $databaseCart->items()
                    ->where('product_id', $sessionItem->product_id)
                    ->first();

                if ($existingItem) {
                    // Merge quantities
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $sessionItem->quantity
                    ]);
                } else {
                    // Transfer item to database cart
                    $sessionItem->update(['cart_id' => $databaseCart->id]);
                }
            }

            // Delete the session cart
            $sessionCart->delete();
        }
    }

    /**
     * Display the cart.
     */
    public function index()
    {
        $cart = $this->getCart();
        $cart->load(['items.product' => function ($q) {
            $q->with(['supplier.user', 'bulkPrices']);
        }]);

        // Group items by supplier
        $itemsBySupplier = $cart->items->groupBy(function ($item) {
            return $item->product->supplier_id;
        });

        // Calculate cart totals
        $cartTotals = $this->calculateCartTotals($cart);

        // Get available shipping methods
        $shippingMethods = $this->getShippingMethods();

        return Inertia::render('Buyer/Cart/Index', compact('cart', 'itemsBySupplier', 'cartTotals', 'shippingMethods'));
    }

    /**
     * Add item to cart.
     */
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit' => 'nullable|string',
        ]);

        $product = Product::with(['supplier', 'bulkPrices'])->findOrFail($validated['product_id']);

        // Validate quantity meets MOQ
        if ($validated['quantity'] < $product->minimum_order_quantity) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Minimum order quantity is ' . $product->minimum_order_quantity . ' ' . ($product->unit ?? 'units'),
                    'moq' => $product->minimum_order_quantity
                ], 422);
            }

            return back()->with('error', 'Minimum order quantity is ' . $product->minimum_order_quantity . ' ' . ($product->unit ?? 'units'));
        }

        // Check stock availability
        if ($product->stock_quantity < $validated['quantity']) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only ' . $product->stock_quantity . ' items available in stock'
                ], 422);
            }

            return back()->with('error', 'Only ' . $product->stock_quantity . ' items available in stock');
        }

        DB::beginTransaction();

        try {
            $cart = $this->getCart();

            // Check if product already exists in cart
            $existingItem = $cart->items()
                ->where('product_id', $product->id)
                ->first();

            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem->quantity + $validated['quantity'];

                // Check stock for total quantity
                if ($product->stock_quantity < $newQuantity) {
                    throw new \Exception('Total quantity exceeds available stock');
                }

                $existingItem->update([
                    'quantity' => $newQuantity,
                    'unit_price' => $this->getBulkPriceForQuantity($product, $newQuantity),
                ]);
            } else {
                // Create new cart item
                $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $this->getBulkPriceForQuantity($product, $validated['quantity']),
                    'supplier_id' => $product->supplier_id,
                ]);
            }

            // Update cart totals
            $this->updateCartTotals($cart);

            DB::commit();

            // Get updated cart count
            $cartCount = $cart->items->sum('quantity');

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product added to cart successfully',
                    'cart_count' => $cartCount,
                    'cart_total' => number_format($cart->total_amount, 2),
                    'cart_html' => view('buyer.cart.partials.mini-cart', compact('cart'))->render()
                ]);
            }

            return redirect()->route('buyer.cart.index')
                ->with('success', 'Product added to cart successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 500);
            }

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, CartItem $item)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min=1',
        ]);

        // Verify cart item belongs to user's cart
        $cart = $this->getCart();
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        $product = $item->product;

        // Check MOQ
        if ($validated['quantity'] < $product->minimum_order_quantity) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Minimum order quantity is ' . $product->minimum_order_quantity
                ], 422);
            }

            return back()->with('error', 'Minimum order quantity is ' . $product->minimum_order_quantity);
        }

        // Check stock
        if ($product->stock_quantity < $validated['quantity']) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only ' . $product->stock_quantity . ' items available'
                ], 422);
            }

            return back()->with('error', 'Only ' . $product->stock_quantity . ' items available');
        }

        DB::beginTransaction();

        try {
            // Update item with new quantity and price
            $item->update([
                'quantity' => $validated['quantity'],
                'unit_price' => $this->getBulkPriceForQuantity($product, $validated['quantity']),
            ]);

            // Update cart totals
            $this->updateCartTotals($cart);

            DB::commit();

            // Recalculate cart totals
            $cartTotals = $this->calculateCartTotals($cart);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cart updated successfully',
                    'item_total' => number_format($item->total_price, 2),
                    'cart_subtotal' => number_format($cartTotals['subtotal'], 2),
                    'cart_total' => number_format($cartTotals['total'], 2),
                    'item_count' => $cart->items->sum('quantity'),
                ]);
            }

            return redirect()->route('buyer.cart.index')
                ->with('success', 'Cart updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update cart');
        }
    }

    /**
     * Remove item from cart.
     */
    public function remove(CartItem $item)
    {
        // Verify cart item belongs to user's cart
        $cart = $this->getCart();
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        DB::beginTransaction();

        try {
            $item->delete();

            // Update cart totals
            $this->updateCartTotals($cart);

            DB::commit();

            if (request()->wantsJson()) {
                $cartTotals = $this->calculateCartTotals($cart);

                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from cart',
                    'cart_count' => $cart->items->sum('quantity'),
                    'cart_subtotal' => number_format($cartTotals['subtotal'], 2),
                    'cart_total' => number_format($cartTotals['total'], 2),
                    'cart_html' => view('buyer.cart.partials.cart-items', compact('cart'))->render()
                ]);
            }

            return redirect()->route('buyer.cart.index')
                ->with('success', 'Item removed from cart');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to remove item');
        }
    }

    /**
     * Clear entire cart.
     */
    public function clear()
    {
        $cart = $this->getCart();

        DB::beginTransaction();

        try {
            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
            ]);

            DB::commit();

            return redirect()->route('buyer.cart.index')
                ->with('success', 'Cart cleared successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to clear cart');
        }
    }

    /**
     * Apply coupon/discount to cart.
     */
    public function applyCoupon(Request $request)
    {
        $validated = $request->validate([
            'coupon_code' => 'required|string|max:50',
        ]);

        $cart = $this->getCart();

        // Validate coupon (implement your coupon logic)
        $coupon = $this->validateCoupon($validated['coupon_code'], $cart);

        if (!$coupon) {
            return back()->with('error', 'Invalid or expired coupon code');
        }

        // Calculate discount
        $discountAmount = $this->calculateDiscount($coupon, $cart);

        // Update cart with discount
        $cart->update([
            'discount_amount' => $discountAmount,
            'coupon_code' => $validated['coupon_code'],
            'total_amount' => $cart->subtotal + $cart->tax_amount + $cart->shipping_amount - $discountAmount,
        ]);

        return redirect()->route('buyer.cart.index')
            ->with('success', 'Coupon applied successfully');
    }

    /**
     * Remove coupon from cart.
     */
    public function removeCoupon()
    {
        $cart = $this->getCart();

        $cart->update([
            'discount_amount' => 0,
            'coupon_code' => null,
            'total_amount' => $cart->subtotal + $cart->tax_amount + $cart->shipping_amount,
        ]);

        return redirect()->route('buyer.cart.index')
            ->with('success', 'Coupon removed successfully');
    }

    /**
     * Update shipping method.
     */
    public function updateShipping(Request $request)
    {
        $validated = $request->validate([
            'shipping_method' => 'required|string',
            'shipping_address' => 'required|string',
        ]);

        $cart = $this->getCart();

        // Calculate shipping amount based on method and cart total
        $shippingAmount = $this->calculateShipping($validated['shipping_method'], $cart);

        $cart->update([
            'shipping_method' => $validated['shipping_method'],
            'shipping_address' => $validated['shipping_address'],
            'shipping_amount' => $shippingAmount,
            'total_amount' => $cart->subtotal + $cart->tax_amount + $shippingAmount - $cart->discount_amount,
        ]);

        return response()->json([
            'success' => true,
            'shipping_amount' => number_format($shippingAmount, 2),
            'cart_total' => number_format($cart->fresh()->total_amount, 2),
        ]);
    }

    /**
     * Get cart count for header (AJAX endpoint).
     */
    public function getCount()
    {
        $cart = $this->getCart();
        $count = $cart->items->sum('quantity');

        return response()->json([
            'count' => $count,
            'total' => number_format($cart->total_amount, 2)
        ]);
    }

    /**
     * Get mini cart for AJAX refresh.
     */
    public function getMiniCart()
    {
        $cart = $this->getCart();
        $cart->load('items.product');

        $html = view('buyer.cart.partials.mini-cart', compact('cart'))->render();

        return response()->json([
            'html' => $html,
            'count' => $cart->items->sum('quantity'),
            'total' => number_format($cart->total_amount, 2)
        ]);
    }

    /**
     * Calculate bulk price for quantity.
     */
    protected function getBulkPriceForQuantity($product, $quantity)
    {
        $bulkPrice = $product->bulkPrices()
            ->where('min_quantity', '<=', $quantity)
            ->where(function ($query) use ($quantity) {
                $query->where('max_quantity', '>=', $quantity)
                    ->orWhereNull('max_quantity');
            })
            ->first();

        return $bulkPrice ? $bulkPrice->price : $product->base_price;
    }

    /**
     * Calculate cart totals.
     */
    protected function calculateCartTotals($cart)
    {
        $subtotal = 0;
        $itemCount = 0;

        foreach ($cart->items as $item) {
            $item->total_price = $item->quantity * $item->unit_price;
            $subtotal += $item->total_price;
            $itemCount += $item->quantity;
        }

        // Calculate tax (example: 10% tax)
        $taxRate = 0.10;
        $taxAmount = $subtotal * $taxRate;

        // Shipping amount (can be dynamic based on methods)
        $shippingAmount = $cart->shipping_amount ?? 0;

        // Discount amount
        $discountAmount = $cart->discount_amount ?? 0;

        $total = $subtotal + $taxAmount + $shippingAmount - $discountAmount;

        return [
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'discount_amount' => $discountAmount,
            'total' => $total,
            'item_count' => $itemCount,
        ];
    }

    /**
     * Update cart totals in database.
     */
    protected function updateCartTotals($cart)
    {
        $totals = $this->calculateCartTotals($cart);

        $cart->update([
            'subtotal' => $totals['subtotal'],
            'tax_amount' => $totals['tax_amount'],
            'total_amount' => $totals['total'],
        ]);

        return $totals;
    }

    /**
     * Get available shipping methods.
     */
    protected function getShippingMethods()
    {
        return [
            'standard' => [
                'name' => 'Standard Shipping',
                'description' => 'Delivery in 5-7 business days',
                'price' => 10.00,
                'estimated_days' => '5-7',
            ],
            'express' => [
                'name' => 'Express Shipping',
                'description' => 'Delivery in 2-3 business days',
                'price' => 20.00,
                'estimated_days' => '2-3',
            ],
            'overnight' => [
                'name' => 'Overnight Shipping',
                'description' => 'Next business day delivery',
                'price' => 35.00,
                'estimated_days' => '1',
            ],
        ];
    }

    /**
     * Validate coupon code.
     */
    protected function validateCoupon($code, $cart)
    {
        // Implement your coupon validation logic here
        // This is a placeholder
        $validCoupons = [
            'WELCOME10' => ['type' => 'percentage', 'value' => 10, 'min_order' => 0],
            'SAVE20' => ['type' => 'percentage', 'value' => 20, 'min_order' => 100],
            'FLAT50' => ['type' => 'fixed', 'value' => 50, 'min_order' => 200],
        ];

        if (isset($validCoupons[$code])) {
            $coupon = $validCoupons[$code];

            // Check minimum order requirement
            if ($cart->subtotal >= $coupon['min_order']) {
                return $coupon;
            }
        }

        return null;
    }

    /**
     * Calculate discount amount.
     */
    protected function calculateDiscount($coupon, $cart)
    {
        if ($coupon['type'] === 'percentage') {
            return $cart->subtotal * ($coupon['value'] / 100);
        } else {
            return min($coupon['value'], $cart->subtotal); // Fixed amount
        }
    }

    /**
     * Calculate shipping cost.
     */
    protected function calculateShipping($method, $cart)
    {
        $shippingMethods = $this->getShippingMethods();

        if (isset($shippingMethods[$method])) {
            // You can add logic for free shipping over certain amount
            if ($cart->subtotal > 200 && $method === 'standard') {
                return 0; // Free standard shipping over $200
            }

            return $shippingMethods[$method]['price'];
        }

        return 10.00; // Default shipping cost
    }

    /**
     * Proceed to checkout.
     */
    public function checkout()
    {
        $cart = $this->getCart();

        if ($cart->items->isEmpty()) {
            return redirect()->route('buyer.cart.index')
                ->with('error', 'Your cart is empty');
        }

        // Check stock availability for all items
        foreach ($cart->items as $item) {
            if ($item->quantity > $item->product->stock_quantity) {
                return redirect()->route('buyer.cart.index')
                    ->with('error', "{$item->product->name} has only {$item->product->stock_quantity} items available");
            }
        }

        // Redirect to order confirmation page
        return redirect()->route('buyer.checkout.index');
    }
}
