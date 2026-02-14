<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_name',
        'hero_src',
        'paper_src',
        'unveiling_images',
        'board_src',
        'text_src',
        'sponsor_src',
        'medpar_src',
        'bg_color',
        'image_section_bg',
        'is_active',
    ];

    protected $casts = [
        'unveiling_images' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get event page by name or create default one.
     */
    public static function getByName(string $pageName): self
    {
        $page = self::where('page_name', $pageName)->first();
        if (!$page) {
            $page = self::create([
                'page_name' => $pageName,
                'hero_src' => '/resources/images/UnveilingHero.svg',
                'paper_src' => '/resources/images/EventPaper.svg',
                'unveiling_images' => [
                    '/imgs/unveiling/unveiling1.jpg',
                    '/imgs/unveiling/unveiling2.jpg',
                    '/imgs/unveiling/unveiling3.jpg',
                    '/imgs/unveiling/unveiling4.jpg',
                    '/imgs/unveiling/unveiling5.jpg',
                    '/imgs/unveiling/unveiling6.jpg',
                    '/imgs/unveiling/unveiling7.jpg',
                    '/imgs/unveiling/unveiling8.jpg'
                ],
                'board_src' => '/resources/images/SponsorMedparWood.svg',
                'text_src' => '/resources/images/SponsorMedparText.png',
                'sponsor_src' => '/public/imgs/unveiling/Sponsor.png',
                'medpar_src' => '/public/imgs/unveiling/Medpar.png',
                'bg_color' => '#FFC22F',
                'is_active' => true,
            ]);
        }
        return $page;
    }

    /**
     * Get all event pages with their status.
     */
    public static function getAllPages(): array
    {
        $pageNames = ['unveiling', 'eulympic', 'ucare', 'ulympic', 'unify'];
        $pages = [];
        
        foreach ($pageNames as $pageName) {
            $pages[$pageName] = self::getByName($pageName);
        }
        
        return $pages;
    }
}