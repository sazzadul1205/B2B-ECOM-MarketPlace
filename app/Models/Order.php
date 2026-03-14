<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_number',
        'buyer_id',
        'supplier_id',
        'rfq_id',
        'total_amount',
        'shipping_address',
        'payment_status',
        'order_status',
        'confirmed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
    ];

    /**
     * The order status constants.
     */
    const STATUS_PENDING_CONFIRMATION = 'pending_confirmation';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * The payment status constants.
     */
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';

    /**
     * Get the buyer that owns the order.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the supplier that owns the order.
     */
    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    /**
     * Get the RFQ associated with the order.
     */
    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    /**
     * Get the items for the order.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the accepted quote for this order.
     */
    public function quote()
    {
        return $this->hasOne(RfqQuote::class, 'rfq_id', 'rfq_id')
            ->where('supplier_id', $this->supplier_id)
            ->where('status', 'accepted');
    }

    /**
     * Check if order is confirmed.
     */
    public function isConfirmed()
    {
        return !is_null($this->confirmed_at);
    }

    /**
     * Check if order is paid.
     */
    public function isPaid()
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled()
    {
        return in_array($this->order_status, [
            self::STATUS_PENDING_CONFIRMATION,
            self::STATUS_CONFIRMED,
            self::STATUS_PROCESSING
        ]);
    }

    /**
     * Generate order number.
     */
    public static function generateOrderNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastOrder = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = intval(substr($lastOrder->order_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "ORD-{$year}{$month}-{$newNumber}";
    }
}