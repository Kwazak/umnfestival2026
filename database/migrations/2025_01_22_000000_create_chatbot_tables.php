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
        // Create chatbot_knowledge table if it doesn't exist
        if (!Schema::hasTable('chatbot_knowledge')) {
            Schema::create('chatbot_knowledge', function (Blueprint $table) {
                $table->id();
                $table->string('category', 100);
                $table->text('question_en');
                $table->text('question_id');
                $table->text('answer_en');
                $table->text('answer_id');
                $table->json('keywords');
                $table->boolean('is_active')->default(true);
                $table->integer('priority')->default(0);
                $table->timestamps();
                
                $table->index(['category', 'is_active']);
                $table->index('priority');
            });
        }

        // Create chatbot_conversations table if it doesn't exist
        if (!Schema::hasTable('chatbot_conversations')) {
            Schema::create('chatbot_conversations', function (Blueprint $table) {
                $table->id();
                $table->string('session_id');
                $table->text('user_message');
                $table->text('bot_response');
                $table->enum('language', ['en', 'id']);
                $table->string('matched_category')->nullable();
                $table->timestamps();
                
                $table->index(['session_id', 'created_at']);
                $table->index('language');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('chatbot_knowledge');
    }
};