<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventUpcomingDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'key',
        'image_url',
        'alt_text',
        'title',
        'description',
        'is_locked',
        'link'
    ];

    protected $casts = [
        'is_locked' => 'boolean',
    ];

    /**
     * Get formatted data for frontend
     */
    public function getFormattedDataAttribute()
    {
        return [
            'key' => $this->key,
            'image' => $this->image_url,
            'alt' => $this->alt_text,
            'title' => $this->title,
            'description' => $this->description,
            'isLocked' => $this->is_locked,
            'link' => $this->link
        ];
    }

    /**
     * Scope to get ordered events
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
}