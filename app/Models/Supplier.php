<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'company_name',
        'trade_license_number',
        'company_phone',
        'company_email',
        'company_address',
        'city',
        'verification_status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'verification_status' => 'string',
    ];

    /**
     * Get the user that owns the supplier profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the products for the supplier.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the quotes for the supplier.
     */
    public function quotes()
    {
        return $this->hasMany(RfqQuote::class, 'supplier_id', 'user_id');
    }

    /**
     * Get the orders for the supplier.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'supplier_id', 'user_id');
    }

    /**
     * Check if supplier is verified.
     */
    public function isVerified()
    {
        return $this->verification_status === 'verified';
    }
}
