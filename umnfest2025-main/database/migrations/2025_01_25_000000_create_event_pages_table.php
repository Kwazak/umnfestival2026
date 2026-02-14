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
        Schema::create('event_pages', function (Blueprint $table) {
            $table->id();
            $table->string('page_name')->unique(); // unveiling, eulympic, ucare, ulympic, unify
            $table->string('hero_src')->nullable();
            $table->string('paper_src')->nullable();
            $table->json('unveiling_images')->nullable(); // array of image URLs
            $table->string('board_src')->nullable();
            $table->string('text_src')->nullable();
            $table->string('sponsor_src')->nullable();
            $table->string('medpar_src')->nullable();
            $table->string('bg_color')->default('#FFC22F');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_pages');
    }
};