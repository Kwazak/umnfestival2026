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
            // Store relative paths to captured frames
            $table->string('frame_before_1500ms')->nullable()->after('scanned_by');
            $table->string('frame_before_700ms')->nullable()->after('frame_before_1500ms');
            $table->string('frame_after_700ms')->nullable()->after('frame_before_700ms');
            $table->string('frame_after_1500ms')->nullable()->after('frame_after_700ms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'frame_before_1500ms',
                'frame_before_700ms',
                'frame_after_700ms',
                'frame_after_1500ms',
            ]);
        });
    }
};
