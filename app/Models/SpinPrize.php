<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpinPrize extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'probability',
        'value',
        'display_text',
        'is_active',
        'stock',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'probability' => 'integer',
        'stock' => 'integer',
    ];

    public function attempts()
    {
        return $this->hasMany(SpinAttempt::class, 'prize_id');
    }
}
