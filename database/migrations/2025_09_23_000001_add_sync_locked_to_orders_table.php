<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('sync_locked')->default(false)->after('status');
            $table->text('sync_locked_reason')->nullable()->after('sync_locked');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['sync_locked', 'sync_locked_reason']);
        });
    }
};
