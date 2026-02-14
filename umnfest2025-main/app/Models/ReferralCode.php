<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ReferralCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'panitia_name',
        'uses',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: A referral code can have many orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Recalculate and update the uses count for this referral code
     * Uses count = number of valid or used tickets from orders using this referral code
     */
    public function recalculateUses()
    {
        $validTicketCount = DB::table('orders')
            ->join('tickets', 'orders.id', '=', 'tickets.order_id')
            ->where('orders.referral_code_id', $this->id)
            ->whereIn('tickets.status', ['valid', 'used'])
            ->count();

        $this->update(['uses' => $validTicketCount]);
        
        return $validTicketCount;
    }

    /**
     * Static method to recalculate uses for all referral codes
     */
    public static function recalculateAllUses()
    {
        $referralCodes = self::all();
        
        foreach ($referralCodes as $referralCode) {
            $referralCode->recalculateUses();
        }
        
        return $referralCodes->count();
    }
}
