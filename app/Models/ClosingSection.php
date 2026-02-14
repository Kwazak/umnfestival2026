<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClosingSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'image_url',
        'head_text',
        'content_text',
        'button1_text',
        'button1_link',
        'button2_text',
        'button2_link',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the active closing section (only one should be active)
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }

    /**
     * Get the first closing section or create default if none exists
     */
    public static function getDefault()
    {
        $section = self::first();
        
        if (!$section) {
            $section = self::create([
                'image_url' => 'https://umnfestival.com/uploads/eulympicpromotional.png',
                'head_text' => 'E-ULYMPIC 2025',
                'content_text' => 'E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat mahasiswa/i UMN maupun di luar UMN dalam perlombaan cabang olahraga E-Sport.

Open Registration : 6 – 16 May 2025
Terbuka untuk 64 Teams Mahasiswa, SMA / Sederajat

Event Day : 19 – 23 May 2025
Venue : Lobby B, Universitas Multimedia Nusantara',
                'button1_text' => 'Daftar Sekarang',
                'button1_link' => '#',
                'button2_text' => 'Pelajari Lebih Lanjut',
                'button2_link' => '#',
                'is_active' => true,
            ]);
        }
        
        return $section;
    }
}