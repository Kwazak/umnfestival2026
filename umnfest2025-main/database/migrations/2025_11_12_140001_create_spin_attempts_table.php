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
        Schema::create('spin_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade'); // Link to order
            $table->string('email'); // Email verification
            $table->foreignId('prize_id')->nullable()->constrained('spin_prizes')->onDelete('set null'); // Prize won
            $table->string('prize_name')->nullable(); // Save prize name in case prize deleted
            $table->string('prize_type')->nullable(); // cashback/merchandise/discount/nothing
            $table->string('prize_value')->nullable(); // Value of prize
            $table->timestamp('spun_at'); // When user spun
            $table->timestamps();
            
            // Ensure 1 order can only spin once
            $table->unique('order_id');
            
            // Index for faster queries
            $table->index('email');
            $table->index('spun_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spin_attempts');
    }
};
