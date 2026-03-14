<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rfq extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rfq_number',
        'buyer_id',
        'title',
        'description',
        'products_requested',
        'quantity',
        'required_by_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'products_requested' => 'array',
        'quantity' => 'integer',
        'required_by_date' => 'date',
    ];

    /**
     * Get the buyer that owns the RFQ.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the quotes for the RFQ.
     */
    public function quotes()
    {
        return $this->hasMany(RfqQuote::class);
    }

    /**
     * Get the messages for the RFQ.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the order associated with the RFQ.
     */
    public function order()
    {
        return $this->hasOne(Order::class);
    }

    /**
     * Get the accepted quote for this RFQ.
     */
    public function acceptedQuote()
    {
        return $this->quotes()->where('status', 'accepted')->first();
    }

    /**
     * Check if RFQ is open.
     */
    public function isOpen()
    {
        return $this->status === 'open';
    }

    /**
     * Generate RFQ number.
     */
    public static function generateRfqNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastRfq = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastRfq) {
            $lastNumber = intval(substr($lastRfq->rfq_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "RFQ-{$year}{$month}-{$newNumber}";
    }
}
