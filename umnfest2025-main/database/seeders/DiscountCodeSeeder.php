<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiscountCode;

class DiscountCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discountCodes = [
            [
                'code' => 'SAVE15',
                'discount_percentage' => 15.00,
                'quota' => 12,
                'used_count' => 0,
                'is_active' => true,
            ]
        ];

        foreach ($discountCodes as $discountCode) {
            DiscountCode::create($discountCode);
        }
    }
}