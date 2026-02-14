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
            // Update the status enum to include all Midtrans transaction statuses
            $table->enum('status', [
                'pending',          // Initial status when order is created
                'authorize',        // Midtrans authorizes the payment card (must be captured)
                'capture',          // Transaction successful, card balance captured
                'settlement',       // Transaction successfully settled, funds credited
                'deny',             // Payment rejected by provider or FDS
                'cancel',           // Transaction cancelled by Midtrans or partner bank
                'expire',           // Transaction expired due to payment delay
                'refund',           // Transaction marked to be refunded
                'partial_refund',   // Transaction marked to be partially refunded
                'chargeback',       // Transaction marked to be charged back (card only)
                'partial_chargeback', // Transaction marked to be partially charged back
                'failure',          // Unexpected error during transaction processing
                'paid',             // Custom status for successful payments (backward compatibility)
                'failed',           // Custom status for failed payments (backward compatibility)
                'cancelled'         // Custom status for cancelled payments (backward compatibility)
            ])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending')->change();
        });
    }
};