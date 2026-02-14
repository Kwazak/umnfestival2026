<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'category',
        'ticket_quantity',
        'amount',
        'final_amount',
        'referral_code_id',
        'discount_code_id',
        'discount_amount',
        'bundle_discount_amount',
        'midtrans_transaction_id',
        'midtrans_payment_type',
        'midtrans_response',
        'status',
        'sync_locked',
        'sync_locked_reason',
        'order_number',
        'paid_at',
        'snap_token',
        'snap_token_created_at',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'bundle_discount_amount' => 'integer',
        'midtrans_response' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'paid_at' => 'datetime',
        'snap_token_created_at' => 'datetime',
        'sync_locked' => 'boolean',
    ];

    /**
     * Relationship: An order can have many tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Relationship: An order belongs to a referral code (optional)
     */
    public function referralCode()
    {
        return $this->belongsTo(ReferralCode::class);
    }

    /**
     * Relationship: An order belongs to a discount code (optional)
     */
    public function discountCode()
    {
        return $this->belongsTo(DiscountCode::class);
    }

    /**
     * Relationship: An order belongs to a user (optional)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the order is in a successful payment state
     */
    public function isSuccessful()
    {
        return in_array($this->status, ['capture', 'settlement', 'paid']);
    }

    /**
     * Check if the order is in a failed payment state
     */
    public function isFailed()
    {
        return in_array($this->status, ['deny', 'cancel', 'expire', 'failure', 'cancelled', 'failed']);
    }

    /**
     * Check if the order is in a pending state
     */
    public function isPending()
    {
        return in_array($this->status, ['pending', 'authorize']);
    }

    /**
     * Check if the order has been refunded
     */
    public function isRefunded()
    {
        return in_array($this->status, ['refund', 'partial_refund']);
    }

    /**
     * Check if the order has chargeback
     */
    public function hasChargeback()
    {
        return in_array($this->status, ['chargeback', 'partial_chargeback']);
    }

    /**
     * Check if the order is expired
     */
    public function isExpired()
    {
        return $this->status === 'expire';
    }

    /**
     * Check if the order should be automatically deleted
     */
    public function shouldBeDeleted()
    {
     // Delete if status is 'expire' or if pending for more than 6 hours (1 hour buffer after 5-hour payment expiry)
     return $this->isExpired() || 
         ($this->status === 'pending' && $this->created_at->lt(now()->subHours(6))) ||
         ($this->status === 'pending' && $this->snap_token_created_at && $this->snap_token_created_at->lt(now()->subHours(6)));
    }

    /**
     * Scope to get all expired orders that should be deleted
     */
    public function scopeExpiredForDeletion($query)
    {
        return $query->where(function ($q) {
                        $q->where('status', 'expire')
                            ->orWhere(function ($subQ) {
                                    $subQ->where('status', 'pending')
                                             ->where('created_at', '<', now()->subHours(6));
                            });
        });
    }

    /**
     * Get human-readable status description
     */
    public function getStatusDescriptionAttribute()
    {
        $descriptions = [
            'pending' => 'Menunggu Pembayaran',
            'authorize' => 'Diotorisasi (Menunggu Capture)',
            'capture' => 'Pembayaran Berhasil',
            'settlement' => 'Pembayaran Selesai',
            'deny' => 'Pembayaran Ditolak',
            'cancel' => 'Pembayaran Dibatalkan',
            'expire' => 'Pembayaran Kedaluwarsa',
            'refund' => 'Dikembalikan',
            'partial_refund' => 'Dikembalikan Sebagian',
            'chargeback' => 'Chargeback',
            'partial_chargeback' => 'Chargeback Sebagian',
            'failure' => 'Gagal',
            'paid' => 'Dibayar', // Legacy status
            'failed' => 'Gagal', // Legacy status
            'cancelled' => 'Dibatalkan', // Legacy status
        ];

        return $descriptions[$this->status] ?? 'Status Tidak Dikenal';
    }
}
