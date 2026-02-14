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
        // First, migrate payment_status values to status column if they differ
        $orders = DB::table('orders')->whereNotNull('payment_status')->get();
        
        foreach ($orders as $order) {
            // Only update if payment_status has a more specific value than status
            if ($order->payment_status !== 'pending' && $order->status === 'pending') {
                DB::table('orders')
                    ->where('id', $order->id)
                    ->update(['status' => $order->payment_status]);
            }
        }

        // Now drop the unnecessary columns
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key constraint for user_id first
            $table->dropForeign(['user_id']);
            
            // Drop the columns
            $table->dropColumn(['user_id', 'payment_status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Re-add user_id with foreign key
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users');
            
            // Re-add payment_status and expires_at
            $table->string('payment_status')->default('pending')->after('amount');
            $table->timestamp('expires_at')->nullable()->after('paid_at');
        });
        
        // Restore payment_status values from status column
        DB::table('orders')->update(['payment_status' => DB::raw('status')]);
    }
};
