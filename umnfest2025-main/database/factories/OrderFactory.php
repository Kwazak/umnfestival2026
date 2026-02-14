<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        $basePrice = 100000;
        $quantity = $this->faker->numberBetween(1, 10);
        $amount = $basePrice * $quantity;

        return [
            'buyer_name' => $this->faker->name,
            'buyer_email' => $this->faker->unique()->safeEmail,
            'buyer_phone' => $this->faker->phoneNumber,
            'category' => $this->faker->randomElement(['internal', 'external']),
            'ticket_quantity' => $quantity,
            'amount' => $amount,
            'final_amount' => $amount,
            'referral_code_id' => null,
            'midtrans_transaction_id' => null,
            'status' => 'pending',
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'paid_at' => null,
        ];
    }
}
