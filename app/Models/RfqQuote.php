<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RfqQuote extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rfq_quotes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quote_number',
        'rfq_id',
        'supplier_id',
        'total_amount',
        'product_breakdown',
        'valid_until',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
        'product_breakdown' => 'array',
        'valid_until' => 'date',
    ];

    /**
     * Get the RFQ that owns the quote.
     */
    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    /**
     * Get the supplier that owns the quote.
     */
    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    /**
     * Get the supplier profile for this quote.
     */
    public function supplierProfile()
    {
        return $this->hasOneThrough(Supplier::class, User::class, 'id', 'user_id', 'supplier_id', 'id');
    }

    /**
     * Get the order associated with the quote.
     */
    public function order()
    {
        return $this->hasOne(Order::class, 'rfq_id', 'rfq_id')
            ->where('supplier_id', $this->supplier_id);
    }

    /**
     * Check if quote is accepted.
     */
    public function isAccepted()
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if quote is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if quote is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if quote is still valid.
     */
    public function isValid()
    {
        return $this->valid_until->isFuture();
    }

    /**
     * Generate quote number.
     */
    public static function generateQuoteNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastQuote = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastQuote) {
            $lastNumber = intval(substr($lastQuote->quote_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "Q-{$year}{$month}-{$newNumber}";
    }
}
