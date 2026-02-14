<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CountdownEvent;

class CountdownEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            [
                'event_key' => 'ucare',
                'name' => 'U Care 2025',
                'target_date' => '2025-09-28 17:00:00', // disesuaikan dengan SQL
                'bg_color' => '#42B5B5',
                'sort_order' => 1,
                'is_active' => true
            ]
        ];

        foreach ($events as $event) {
            CountdownEvent::updateOrCreate(
                ['event_key' => $event['event_key']],
                $event
            );
        }
    }
}
