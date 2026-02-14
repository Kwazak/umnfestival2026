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
        Schema::create('closing_sections', function (Blueprint $table) {
            $table->id();
            $table->string('image_url')->default('https://umnfestival.com/uploads/eulympicpromotional.png');
            $table->string('head_text')->default('E-ULYMPIC 2025');
            $table->text('content_text')->default('E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat mahasiswa/i UMN maupun di luar UMN dalam perlombaan cabang olahraga E-Sport.

Open Registration : 6 – 16 May 2025
Terbuka untuk 64 Teams Mahasiswa, SMA / Sederajat

Event Day : 19 – 23 May 2025
Venue : Lobby B, Universitas Multimedia Nusantara');
            $table->string('button1_text')->default('Daftar Sekarang');
            $table->string('button1_link')->default('#');
            $table->string('button2_text')->default('Pelajari Lebih Lanjut');
            $table->string('button2_link')->default('#');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('closing_sections');
    }
};