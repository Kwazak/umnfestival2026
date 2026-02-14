<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percentage', 
        'quota',
        'used_count',
        'is_active'
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: A discount code can have many orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if discount code is available for use
     * Based on ORDER count, not ticket count
     */
    public function isAvailable()
    {
        return $this->is_active && $this->used_count < $this->quota;
    }

    /**
     * Calculate discount amount for given price
     */
    public function calculateDiscount($amount)
    {
        return $amount * ($this->discount_percentage / 100);
    }

    /**
     * Recalculate and update the uses count for this discount code
     * Uses count = number of PAID ORDERS using this discount code
     */
    public function recalculateUses()
    {
        $paidOrderCount = $this->orders()
            ->whereIn('status', ['capture', 'settlement', 'paid'])
            ->count();

        $this->update(['used_count' => $paidOrderCount]);
        
        return $paidOrderCount;
    }

    /**
     * Get remaining quota
     */
    public function getRemainingQuotaAttribute()
    {
        return max(0, $this->quota - $this->used_count);
    }

    /**
     * Scope to get only active discount codes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only available discount codes (active and not exhausted)
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
                    ->whereRaw('used_count < quota');
    }
}