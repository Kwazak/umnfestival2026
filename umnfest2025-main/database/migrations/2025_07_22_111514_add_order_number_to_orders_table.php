<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->after('id');
            }
        });

        // Populate existing rows with unique order numbers
        DB::table('orders')->whereNull('order_number')->orWhere('order_number', '')->get()->each(function ($order) {
            DB::table('orders')->where('id', $order->id)->update(['order_number' => 'ORD-' . strtoupper(Str::random(8))]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'order_number')) {
                $table->dropColumn('order_number');
            }
        });
    }
};
