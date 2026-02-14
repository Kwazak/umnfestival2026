<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CountdownEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_key',
        'name',
        'target_date',
        'bg_color',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'target_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get formatted data for frontend
     */
    public function getFormattedDataAttribute()
    {
        return [
            'key' => $this->event_key,
            'name' => $this->name,
            'targetDate' => $this->target_date->toISOString(),
            'bgColor' => $this->bg_color
        ];
    }

    /**
     * Scope to get active events ordered by sort_order
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get ordered events
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Check if event has passed
     */
    public function getHasPassedAttribute()
    {
        return $this->target_date->isPast();
    }

    /**
     * Get time remaining until event
     */
    public function getTimeRemainingAttribute()
    {
        if ($this->has_passed) {
            return [
                'days' => 0,
                'hours' => 0,
                'minutes' => 0,
                'seconds' => 0
            ];
        }

        $now = Carbon::now();
        $target = $this->target_date;
        
        $diff = $target->diff($now);
        
        return [
            'days' => $diff->days,
            'hours' => $diff->h,
            'minutes' => $diff->i,
            'seconds' => $diff->s
        ];
    }
}