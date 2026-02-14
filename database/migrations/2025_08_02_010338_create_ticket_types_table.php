<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ticket_types', function (Blueprint $table) {
            $table->id();
            $table->integer('sort_order')->default(0); // Manual sorting order (1-5)
            $table->string('type')->unique(); // Unique identifier (early-bird, pre-sales-1, etc.)
            $table->string('header'); // Display name (Early Bird, Pre-Sales 1, etc.)
            $table->decimal('price', 10, 2)->nullable(); // Price in IDR (null for coming soon)
            $table->string('button_text'); // Button text (BUY TICKET, SOLD OUT, COMING SOON)
            $table->boolean('is_disabled')->default(true); // Whether button is disabled
            $table->boolean('is_available')->default(false); // Whether ticket is available for purchase
            $table->string('background_color')->default('#0E4280'); // Card background color
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_types');
    }
};