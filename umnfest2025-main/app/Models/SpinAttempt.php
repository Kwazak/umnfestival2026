<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpinAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'email',
        'prize_id',
        'prize_name',
        'prize_type',
        'prize_value',
        'spun_at',
    ];

    protected $casts = [
        'spun_at' => 'datetime',
    ];

    public function prize()
    {
        return $this->belongsTo(SpinPrize::class, 'prize_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
