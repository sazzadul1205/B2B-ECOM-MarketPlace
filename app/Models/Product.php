<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'supplier_id',
        'name',
        'slug',
        'description',
        'category',
        'base_price',
        'minimum_order_quantity',
        'unit',
        'bulk_prices',
        'stock_quantity',
        'main_image',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_price' => 'decimal:2',
        'minimum_order_quantity' => 'integer',
        'stock_quantity' => 'integer',
        'bulk_prices' => 'array',
    ];

    /**
     * Get the supplier that owns the product.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user (supplier) that owns the product through supplier.
     */
    public function user()
    {
        return $this->hasOneThrough(User::class, Supplier::class, 'id', 'id', 'supplier_id', 'user_id');
    }

    /**
     * Get the bulk prices for the product.
     */
    public function bulkPrices()
    {
        return $this->hasMany(ProductBulkPrice::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Get the bulk price for a specific quantity.
     */
    public function getBulkPriceForQuantity($quantity)
    {
        $bulkPrice = $this->bulkPrices()
            ->where('min_quantity', '<=', $quantity)
            ->where(function ($query) use ($quantity) {
                $query->where('max_quantity', '>=', $quantity)
                    ->orWhereNull('max_quantity');
            })
            ->first();

        return $bulkPrice ? $bulkPrice->price : $this->base_price;
    }
}
