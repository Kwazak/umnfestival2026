<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'ticket_code',
        'status',
        'checked_in_at',
        'scanned_by',
        'frame_before_1500ms',
        'frame_before_700ms',
        'frame_after_700ms',
        'frame_after_1500ms',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
    ];

    /**
     * Boot method to register model events
     */
    protected static function boot()
    {
        parent::boot();

        // Update referral code uses count when ticket is created
        static::created(function ($ticket) {
            $ticket->updateReferralCodeUses();
        });

        // Update referral code uses count when ticket status is updated
        static::updated(function ($ticket) {
            if ($ticket->isDirty('status')) {
                $ticket->updateReferralCodeUses();
            }
        });

        // Update referral code uses count when ticket is deleted
        static::deleted(function ($ticket) {
            $ticket->updateReferralCodeUses();
        });
    }

    /**
     * Relationship: A ticket belongs to an order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Update the uses count for the referral code associated with this ticket's order
     */
    public function updateReferralCodeUses()
    {
        try {
            // Load order with referral code relationship
            $order = $this->order;
            if (!$order) {
                \Log::warning('Ticket updateReferralCodeUses: Order not found', ['ticket_id' => $this->id]);
                return;
            }

            $order->load('referralCode');
            
            if ($order->referralCode) {
                // Count valid and used tickets for this referral code
                $validTicketCount = \DB::table('orders')
                    ->join('tickets', 'orders.id', '=', 'tickets.order_id')
                    ->where('orders.referral_code_id', $order->referralCode->id)
                    ->whereIn('tickets.status', ['valid', 'used'])
                    ->count();

                $oldUses = $order->referralCode->uses;
                
                // Update the referral code uses count
                $order->referralCode->update(['uses' => $validTicketCount]);
                
                \Log::info('Referral code uses updated automatically', [
                    'referral_code_id' => $order->referralCode->id,
                    'referral_code' => $order->referralCode->code,
                    'old_uses' => $oldUses,
                    'new_uses' => $validTicketCount,
                    'ticket_id' => $this->id,
                    'ticket_status' => $this->status,
                    'order_id' => $order->id
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error updating referral code uses', [
                'ticket_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
