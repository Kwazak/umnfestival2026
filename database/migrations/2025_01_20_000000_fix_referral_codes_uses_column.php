<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if tables exist before running the update
        if (Schema::hasTable('referral_codes') && Schema::hasTable('orders') && Schema::hasTable('tickets')) {
            // Update the uses column to reflect actual ticket usage
            // Count valid and used tickets (not pending) for each referral code
            DB::statement("
                UPDATE referral_codes 
                SET uses = (
                    SELECT COALESCE(COUNT(tickets.id), 0)
                    FROM orders 
                    INNER JOIN tickets ON orders.id = tickets.order_id 
                    WHERE orders.referral_code_id = referral_codes.id 
                    AND tickets.status IN ('valid', 'used')
                )
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset all uses to 0
        DB::table('referral_codes')->update(['uses' => 0]);
    }
};