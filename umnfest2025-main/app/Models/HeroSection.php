<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_text',
        'event_text_line1',
        'event_text_line2',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the first hero section or create a default one.
     */
    public static function getDefault(): self
    {
        $hero = self::first();
        if (!$hero) {
            $hero = self::create([
                'title_text' => 'UPCOMING EVENT U-CARE',
                'event_text_line1' => 'Event at 27 September 2025 Lobby B,',
                'event_text_line2' => 'Universitas Multimedia Nusantara',
                'is_active' => true,
            ]);
        }
        return $hero;
    }
}
