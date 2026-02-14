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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('buyer_phone');
            $table->enum('category', ['internal', 'external']); // UMN internal vs external
            $table->unsignedInteger('ticket_quantity');
            $table->decimal('amount', 10, 2); // Only one amount column
            $table->unsignedBigInteger('referral_code_id')->nullable();
            $table->string('midtrans_transaction_id')->nullable(); // Midtrans transaction ID
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('referral_code_id')->references('id')->on('referral_codes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
