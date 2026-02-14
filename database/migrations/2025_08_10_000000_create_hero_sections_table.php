<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title_text')->default('UPCOMING EVENT U-CARE');
            $table->string('event_text_line1')->default('Event at 27 September 2025 Lobby B,');
            $table->string('event_text_line2')->default('Universitas Multimedia Nusantara');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_sections');
    }
};
