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
        Schema::table('orders', function (Blueprint $table) {
            // Add unique constraint to buyer_email to prevent duplicate emails
            $table->unique('buyer_email', 'orders_buyer_email_unique');
            
            // Add unique constraint to buyer_phone to prevent duplicate phone numbers
            $table->unique('buyer_phone', 'orders_buyer_phone_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop unique constraints
            $table->dropUnique('orders_buyer_email_unique');
            $table->dropUnique('orders_buyer_phone_unique');
        });
    }
};