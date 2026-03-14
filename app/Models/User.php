<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get the supplier profile associated with the user.
     */
    public function supplier()
    {
        return $this->hasOne(Supplier::class);
    }

    /**
     * Get the RFQs created by the user (as buyer).
     */
    public function rfqs()
    {
        return $this->hasMany(Rfq::class, 'buyer_id');
    }

    /**
     * Get the quotes submitted by the user (as supplier).
     */
    public function quotes()
    {
        return $this->hasMany(RfqQuote::class, 'supplier_id');
    }

    /**
     * Get the orders placed by the user (as buyer).
     */
    public function ordersAsBuyer()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Get the orders received by the user (as supplier).
     */
    public function ordersAsSupplier()
    {
        return $this->hasMany(Order::class, 'supplier_id');
    }

    /**
     * Get the messages sent by the user.
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get the messages received by the user.
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is supplier.
     */
    public function isSupplier()
    {
        return $this->role === 'supplier';
    }

    /**
     * Check if user is buyer.
     */
    public function isBuyer()
    {
        return $this->role === 'buyer';
    }
}
