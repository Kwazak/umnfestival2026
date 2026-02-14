<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TicketType;
use Carbon\Carbon;

class TicketTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        TicketType::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $ticketTypes = [
            [
                'id' => 1,
                'sort_order' => 1,
                'type' => 'early-bird',
                'header' => 'Early Bird',
                'price' => 59000.00,
                'button_text' => 'SOLD OUT',
                'is_disabled' => true,
                'is_available' => false,
                'background_color' => '#0a64d1',
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-03 13:58:11'),
            ],
            [
                'id' => 2,
                'sort_order' => 2,
                'type' => 'pre-sales-1',
                'header' => 'Pre-Sales 1',
                'price' => 65000.00,
                'button_text' => 'SOLD OUT',
                'is_disabled' => true,
                'is_available' => false,
                'background_color' => '#F3C019',
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-01 19:54:05'),
            ],
            [
                'id' => 3,
                'sort_order' => 3,
                'type' => 'pre-sales-2',
                'header' => 'Pre-Sales 2',
                'price' => 77000.00,
                'button_text' => 'BUY TICKET',
                'is_disabled' => false,
                'is_available' => true,
                'background_color' => '#A42128',
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-03 14:31:04'),
            ],
            [
                'id' => 4,
                'sort_order' => 4,
                'type' => 'regular',
                'header' => 'Regular',
                'price' => null,
                'button_text' => 'COMING SOON',
                'is_disabled' => true,
                'is_available' => false,
                'background_color' => '#42B5B5',
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-03 14:30:39'),
            ],
            [
                'id' => 5,
                'sort_order' => 5,
                'type' => 'coming-soon',
                'header' => 'Coming Soon',
                'price' => null,
                'button_text' => 'COMING SOON',
                'is_disabled' => true,
                'is_available' => false,
                'background_color' => '#E34921',
                'created_at' => Carbon::parse('2025-08-01 19:54:05'),
                'updated_at' => Carbon::parse('2025-08-02 10:20:24'),
            ],
        ];

        foreach ($ticketTypes as $ticketType) {
            TicketType::updateOrCreate(
                ['id' => $ticketType['id']],
                $ticketType
            );
        }

        $this->command->info('✅ Ticket types seeded successfully based on SQL.');
    }
}
