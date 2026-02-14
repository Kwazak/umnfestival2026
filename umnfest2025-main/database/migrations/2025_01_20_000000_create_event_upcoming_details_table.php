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
        Schema::create('event_upcoming_details', function (Blueprint $table) {
            $table->id();
            $table->integer('sort_order')->default(0);
            $table->string('key')->unique();
            $table->string('image_url')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->string('link')->default('/');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_upcoming_details');
    }
};