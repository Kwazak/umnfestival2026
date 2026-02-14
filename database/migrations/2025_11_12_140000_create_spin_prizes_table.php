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
        Schema::create('spin_prizes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Cashback 50K", "T-Shirt", "Better Luck Next Time"
            $table->enum('type', ['cashback', 'merchandise', 'discount', 'nothing']); // Prize type
            $table->integer('probability'); // Weight (1-1000), higher = more likely
            $table->string('value')->nullable(); // e.g., "50000", "T-Shirt", "10%"
            $table->string('display_text')->nullable(); // Custom text for display
            $table->boolean('is_active')->default(true); // Enable/disable prize
            $table->integer('stock')->nullable(); // Limit stock for merchandise (NULL = unlimited)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spin_prizes');
    }
};
