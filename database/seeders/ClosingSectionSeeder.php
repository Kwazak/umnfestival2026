<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ClosingSection;

class ClosingSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ClosingSection::create([
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
            'is_active' => false,
        ]);
    }
}