<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventPage;

class EventPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'page_name' => 'unveiling',
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
            ],
            [
                'page_name' => 'eulympic',
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
            ],
            [
                'page_name' => 'ucare',
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
            ],
            [
                'page_name' => 'ulympic',
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
            ],
            [
                'page_name' => 'unify',
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
            ],
        ];

        foreach ($pages as $pageData) {
            EventPage::updateOrCreate(
                ['page_name' => $pageData['page_name']],
                $pageData
            );
        }
    }
}