<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestStar extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'name',
        'image',
        'below_image',
        'is_revealed',
    ];

    protected $casts = [
        'is_revealed' => 'boolean',
    ];

    /**
     * Scope to get guest stars ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Scope to get only revealed guest stars
     */
    public function scopeRevealed($query)
    {
        return $query->where('is_revealed', true);
    }

    /**
     * Scope to get only unrevealed guest stars
     */
    public function scopeUnrevealed($query)
    {
        return $query->where('is_revealed', false);
    }
}