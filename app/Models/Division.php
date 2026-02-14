<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'name',
        'title',
        'image', // URL string
        'description1',
        'description2',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Order by sort_order ascending
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    // Only active divisions
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}