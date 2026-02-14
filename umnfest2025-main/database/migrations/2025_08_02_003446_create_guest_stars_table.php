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
        Schema::create('guest_stars', function (Blueprint $table) {
            $table->id();
            $table->integer('sort_order')->default(0); // Manual sorting order
            $table->string('name');
            $table->string('image')->nullable(); // URL to main image
            $table->string('below_image')->nullable(); // URL to below image
            $table->boolean('is_revealed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_stars');
    }
};