<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ArchiveVideo;

class ArchiveVideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $videos = [
            [
                'title' => 'OFFICIAL TRAILER E-ULYMPIC 2025',
                'thumbnail_url' => 'https://umnfestival.com/uploads/archive1.png',
                'video_id' => 'BIz9MJIPdIg',
                'sort_order' => 1,
                'is_active' => true
            ],
            [
                'title' => 'UNVEILING 2025 AFTERMOVIE',
                'thumbnail_url' => 'https://umnfestival.com/uploads/archive2.png',
                'video_id' => 'XmL9BcfFtWk',
                'sort_order' => 2,
                'is_active' => true
            ],
            [
                'title' => 'UPCOMING EVENTS',
                'thumbnail_url' => 'https://umnfestival.com/uploads/archive1.png',
                'video_id' => 'BIz9MJIPdIg',
                'sort_order' => 3,
                'is_active' => true
            ]
        ];

        foreach ($videos as $video) {
            ArchiveVideo::updateOrCreate(
                ['video_id' => $video['video_id'], 'sort_order' => $video['sort_order']], // Menggunakan kombinasi video_id dan sort_order untuk keunikan
                $video
            );
        }
    }
}
