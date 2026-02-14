<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_blast_logs', function (Blueprint $table) {
            $table->id();
            $table->string('mode');
            $table->string('subject');
            $table->unsignedInteger('intended_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->string('status')->default('draft');
            $table->string('sent_by')->nullable();
            $table->text('error_message')->nullable();
            $table->json('payload');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_blast_logs');
    }
};
