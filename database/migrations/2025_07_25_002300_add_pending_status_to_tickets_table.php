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
        Schema::table('tickets', function (Blueprint $table) {
            // Modify the enum to include 'pending' status
            $table->enum('status', ['pending', 'valid', 'used', 'cancelled'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Revert to original enum values
            $table->enum('status', ['valid', 'used', 'cancelled'])->default('valid')->change();
        });
    }
};
