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
            // Drop strict unique constraints so we can implement conditional uniqueness in application layer
            try { $table->dropUnique('orders_buyer_email_unique'); } catch (\Throwable $e) {}
            try { $table->dropUnique('orders_buyer_phone_unique'); } catch (\Throwable $e) {}
            // (Optional) add composite partial-like index alternative? MySQL doesn't support partial index directly.
            // You could add normal index for performance:
            $table->index('buyer_email');
            $table->index('buyer_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove added indexes
            try { $table->dropIndex(['buyer_email']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['buyer_phone']); } catch (\Throwable $e) {}
            // Recreate original unique constraints
            $table->unique('buyer_email', 'orders_buyer_email_unique');
            $table->unique('buyer_phone', 'orders_buyer_phone_unique');
        });
    }
};
