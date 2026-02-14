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
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., UMNFEST001
            $table->string('panitia_name'); // Committee member name
            $table->unsignedInteger('uses')->default(0); // Counter for how many times used
            $table->boolean('is_active')->default(true); // Active/inactive status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_codes');
    }
};
