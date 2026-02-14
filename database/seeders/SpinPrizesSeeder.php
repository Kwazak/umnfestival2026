<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpinPrizesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prizes = [
            // MEGA PRIZE (1:1000 chance)
            [
                'name' => 'Cashback 100K',
                'type' => 'cashback',
                'probability' => 1, // 1/1000 = 0.1%
                'value' => '100000',
                'display_text' => '💰 Cashback Rp 100.000',
                'is_active' => true,
                'stock' => 10, // Limited to 10 winners
            ],
            
            // BIG PRIZE (1:500 chance)
            [
                'name' => 'Cashback 50K',
                'type' => 'cashback',
                'probability' => 2, // 2/1000 = 0.2%
                'value' => '50000',
                'display_text' => '💰 Cashback Rp 50.000',
                'is_active' => true,
                'stock' => 20,
            ],
            
            // MEDIUM PRIZE (1:100 chance)
            [
                'name' => 'Free T-Shirt',
                'type' => 'merchandise',
                'probability' => 10, // 10/1000 = 1%
                'value' => 'T-Shirt',
                'display_text' => '👕 Free UMN Festival T-Shirt',
                'is_active' => true,
                'stock' => 100,
            ],
            
            // SMALL PRIZE (1:50 chance)
            [
                'name' => 'Free Sticker Pack',
                'type' => 'merchandise',
                'probability' => 20, // 20/1000 = 2%
                'value' => 'Sticker Pack',
                'display_text' => '✨ Free Sticker Pack',
                'is_active' => true,
                'stock' => 200,
            ],
            
            // CONSOLATION (1:20 chance)
            [
                'name' => '10% Discount Next Event',
                'type' => 'discount',
                'probability' => 50, // 50/1000 = 5%
                'value' => '10',
                'display_text' => '🎫 10% Discount for Next Event',
                'is_active' => true,
                'stock' => null, // Unlimited
            ],
            
            // NOTHING (rest of the probability)
            [
                'name' => 'Better Luck Next Time',
                'type' => 'nothing',
                'probability' => 917, // 917/1000 = 91.7%
                'value' => null,
                'display_text' => '😊 Better Luck Next Time!',
                'is_active' => true,
                'stock' => null, // Unlimited
            ],
        ];

        foreach ($prizes as $prize) {
            DB::table('spin_prizes')->insert([
                'name' => $prize['name'],
                'type' => $prize['type'],
                'probability' => $prize['probability'],
                'value' => $prize['value'],
                'display_text' => $prize['display_text'],
                'is_active' => $prize['is_active'],
                'stock' => $prize['stock'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
