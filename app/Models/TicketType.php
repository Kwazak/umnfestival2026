<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'type',
        'header',
        'price',
        'button_text',
        'is_disabled',
        'is_available',
        'background_color',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_disabled' => 'boolean',
        'is_available' => 'boolean',
    ];

    /**
     * Scope to get ticket types ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Scope to get only available ticket types
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope to get only disabled ticket types
     */
    public function scopeDisabled($query)
    {
        return $query->where('is_disabled', true);
    }

    /**
     * Get formatted price for display
     */
    public function getFormattedPriceAttribute()
    {
        if ($this->price === null) {
            return '-';
        }
        
        return 'IDR ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get the appropriate button action based on availability
     */
    public function getButtonActionAttribute()
    {
        if ($this->is_available && !$this->is_disabled) {
            return $this->type; // Return type for onBuyTicket function
        }
        
        return null;
    }
}