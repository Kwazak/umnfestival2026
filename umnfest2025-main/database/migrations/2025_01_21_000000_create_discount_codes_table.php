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
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->decimal('discount_percentage', 5, 2)->default(15.00);
            $table->integer('quota');
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['code', 'is_active']);
            $table->index('is_active');
        });
        
        // Add constraint using raw SQL (MySQL specific)
        try {
            DB::statement('ALTER TABLE discount_codes ADD CONSTRAINT chk_used_count_quota CHECK (used_count <= quota)');
        } catch (Exception $e) {
            // Ignore if constraint already exists or database doesn't support CHECK constraints
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_codes');
    }
};