<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchiveVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'thumbnail_url',
        'video_id',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get formatted data for frontend
     */
    public function getFormattedDataAttribute()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'thumbnail' => $this->thumbnail_url ?: $this->youtube_thumbnail,
            'videoId' => $this->video_id,
            'sortOrder' => $this->sort_order,
            'isActive' => $this->is_active
        ];
    }

    /**
     * Scope to get active videos ordered by sort_order
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get ordered videos
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Get YouTube thumbnail URL if no custom thumbnail is provided
     */
    public function getYoutubeThumbnailAttribute()
    {
        return "https://img.youtube.com/vi/{$this->video_id}/maxresdefault.jpg";
    }

    /**
     * Get the actual thumbnail URL to use
     */
    public function getActualThumbnailAttribute()
    {
        return $this->thumbnail_url ?: $this->youtube_thumbnail;
    }
}