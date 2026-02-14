<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventUpcomingDetail;

class EventUpcomingDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            [
                'sort_order' => 1,
                'key' => '1',
                'image_url' => 'https://umnfestival.com/uploads/Unveiling-card.png',
                'alt_text' => 'Unveiling',
                'title' => 'UNVEILING 2025',
                'description' => 'Sebagai <strong>acara pembuka</strong> dari UMN Festival 2025 yang berguna untuk memperkenalkan kegiatan UMN Festival, meningkatkan kesadaran mahasiswa/i UMN mengenai kegiatan UMN Festival dan menandakan bahwa kegiatan UMN Festival 2025 telah dimulai.',
                'is_locked' => false,
                'link' => '/'
            ],
            [
                'sort_order' => 2,
                'key' => '2',
                'image_url' => 'https://umnfestival.com/uploads/E-Ulympic-card.png',
                'alt_text' => 'Eulympic',
                'title' => 'E-ULYMPIC 2025',
                'description' => 'E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat dari mahasiswa/i UMN maupun mahasiswa dan siswa lainnya dalam perlombaan cabang olahraga E-Sports.',
                'is_locked' => false,
                'link' => '/'
            ],
            [
                'sort_order' => 3,
                'key' => '3',
                'image_url' => 'https://umnfestival.com/uploads/U-Care-card.png',
                'alt_text' => 'U-Care',
                'title' => 'U-CARE 2025',
                'description' => 'Sebagai <strong>acara pembuka</strong> dari UMN Festival 2025 yang berguna untuk memperkenalkan kegiatan UMN Festival, meningkatkan kesadaran mahasiswa/i UMN mengenai kegiatan UMN Festival dan menandakan bahwa kegiatan UMN Festival 2025 telah dimulai.',
                'is_locked' => false,
                'link' => '/'
            ],
            [
                'sort_order' => 4,
                'key' => '4',
                'image_url' => null,
                'alt_text' => null,
                'title' => 'SOMETHING MAGICAL IS COMING SOON ...',
                'description' => null,
                'is_locked' => true,
                'link' => '/'
            ],
            [
                'sort_order' => 5,
                'key' => '5',
                'image_url' => null,
                'alt_text' => null,
                'title' => 'SOMETHING MAGICAL IS COMING SOON ...',
                'description' => null,
                'is_locked' => true,
                'link' => '/'
            ]
        ];

        foreach ($events as $event) {
            EventUpcomingDetail::updateOrCreate(
                ['key' => $event['key']],
                $event
            );
        }
    }
}
