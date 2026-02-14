<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotKnowledge extends Model
{
    use HasFactory;

    protected $table = 'chatbot_knowledge';

    protected $fillable = [
        'category',
        'question_en',
        'question_id',
        'answer_en',
        'answer_id',
        'keywords',
        'is_active',
        'priority'
    ];

    protected $casts = [
        'keywords' => 'array',
        'is_active' => 'boolean',
        'priority' => 'integer'
    ];

    /**
     * Scope for active knowledge entries
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific category
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Search by keywords
     */
    public function scopeSearchKeywords($query, $keywords)
    {
        return $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $keyword) {
                $q->orWhereJsonContains('keywords', $keyword)
                  ->orWhere('question_en', 'LIKE', "%{$keyword}%")
                  ->orWhere('question_id', 'LIKE', "%{$keyword}%")
                  ->orWhere('answer_en', 'LIKE', "%{$keyword}%")
                  ->orWhere('answer_id', 'LIKE', "%{$keyword}%");
            }
        });
    }

    /**
     * Get ordered by priority
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('created_at', 'desc');
    }
}