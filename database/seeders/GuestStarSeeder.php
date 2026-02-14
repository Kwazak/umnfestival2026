<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\GuestStar;
use Carbon\Carbon;

class GuestStarSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        GuestStar::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $guestStars = [
            [
                'id' => 1,
                'sort_order' => 0,
                'name' => 'Reality Club',
                'image' => 'https://umnfestival.com/uploads/reality-club.png',
                'below_image' => 'https://umnfestival.com/uploads/reality-club-text.svg',
                'is_revealed' => true,
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-01 19:54:05'),
            ],
            [
                'id' => 2,
                'sort_order' => 3,
                'name' => 'Coming Soon',
                'image' => null,
                'below_image' => 'https://umnfestival.com/uploads/coming-soon-text.svg',
                'is_revealed' => false,
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-02 10:49:39'),
            ],
            [
                'id' => 3,
                'sort_order' => 2,
                'name' => 'Raisa Anggiani',
                'image' => 'https://umnfestival.com/uploads/RaisaAFoto.png',
                'below_image' => 'https://umnfestival.com/uploads/RaisaATeks.svg',
                'is_revealed' => true,
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-08 12:38:01'),
            ],
        ];

        foreach ($guestStars as $guestStar) {
            GuestStar::updateOrCreate(
                ['id' => $guestStar['id']],
                $guestStar
            );
        }

        $this->command->info('✅ Guest stars seeded sesuai data SQL.');
    }
}
