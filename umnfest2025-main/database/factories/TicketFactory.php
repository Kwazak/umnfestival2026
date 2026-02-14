<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition()
    {
        return [
            'order_id' => Order::factory(),
            'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
            'status' => $this->faker->randomElement(['active', 'used']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
