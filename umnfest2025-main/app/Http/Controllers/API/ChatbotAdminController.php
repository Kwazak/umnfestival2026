<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatbotKnowledge;
use App\Models\ChatbotConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatbotAdminController extends Controller
{
    /**
     * Get all knowledge entries with pagination
     */
    public function getKnowledge(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $category = $request->get('category');
            $status = $request->get('status');

            $query = ChatbotKnowledge::query();

            // Apply filters
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question_en', 'LIKE', "%{$search}%")
                      ->orWhere('question_id', 'LIKE', "%{$search}%")
                      ->orWhere('answer_en', 'LIKE', "%{$search}%")
                      ->orWhere('answer_id', 'LIKE', "%{$search}%");
                });
            }

            if ($category) {
                $query->where('category', $category);
            }

            if ($status !== null) {
                $query->where('is_active', $status === 'active');
            }

            $knowledge = $query->orderBy('priority', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $knowledge
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch knowledge entries'
            ], 500);
        }
    }

    /**
     * Create new knowledge entry
     */
    public function createKnowledge(Request $request)
    {
        try {
            // Log the incoming request for debugging
            \Log::info('Creating knowledge entry', [
                'request_data' => $request->all(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip()
            ]);

            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:100',
                'question_en' => 'required|string',
                'question_id' => 'required|string',
                'answer_en' => 'required|string',
                'answer_id' => 'required|string',
                'keywords' => 'required|array',
                'keywords.*' => 'string|max:50',
                'priority' => 'nullable|integer|min:0|max:10',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                \Log::warning('Knowledge creation validation failed', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the knowledge entry
            $knowledgeData = [
                'category' => $request->category,
                'question_en' => $request->question_en,
                'question_id' => $request->question_id,
                'answer_en' => $request->answer_en,
                'answer_id' => $request->answer_id,
                'keywords' => $request->keywords,
                'priority' => $request->priority ?? 0,
                'is_active' => $request->is_active ?? true
            ];

            \Log::info('Creating knowledge with data', $knowledgeData);

            $knowledge = ChatbotKnowledge::create($knowledgeData);

            \Log::info('Knowledge entry created successfully', [
                'id' => $knowledge->id,
                'category' => $knowledge->category
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Knowledge entry created successfully',
                'data' => $knowledge->fresh() // Get fresh data from database
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Failed to create knowledge entry', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create knowledge entry: ' . $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Update knowledge entry
     */
    public function updateKnowledge(Request $request, $id)
    {
        try {
            $knowledge = ChatbotKnowledge::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:100',
                'question_en' => 'required|string',
                'question_id' => 'required|string',
                'answer_en' => 'required|string',
                'answer_id' => 'required|string',
                'keywords' => 'required|array',
                'keywords.*' => 'string|max:50',
                'priority' => 'nullable|integer|min:0|max:10',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $knowledge->update([
                'category' => $request->category,
                'question_en' => $request->question_en,
                'question_id' => $request->question_id,
                'answer_en' => $request->answer_en,
                'answer_id' => $request->answer_id,
                'keywords' => $request->keywords,
                'priority' => $request->priority ?? 0,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Knowledge entry updated successfully',
                'data' => $knowledge
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Knowledge entry not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update knowledge entry'
            ], 500);
        }
    }

    /**
     * Delete knowledge entry
     */
    public function deleteKnowledge($id)
    {
        try {
            $knowledge = ChatbotKnowledge::findOrFail($id);
            $knowledge->delete();

            return response()->json([
                'success' => true,
                'message' => 'Knowledge entry deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Knowledge entry not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete knowledge entry'
            ], 500);
        }
    }

    /**
     * Toggle knowledge entry status
     */
    public function toggleKnowledgeStatus($id)
    {
        try {
            $knowledge = ChatbotKnowledge::findOrFail($id);
            $knowledge->update(['is_active' => !$knowledge->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Knowledge entry status updated successfully',
                'data' => $knowledge
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Knowledge entry not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update knowledge entry status'
            ], 500);
        }
    }

    /**
     * Get chatbot analytics and statistics
     */
    public function getAnalytics(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);

            $analytics = [
                'overview' => [
                    'total_knowledge_entries' => ChatbotKnowledge::count(),
                    'active_knowledge_entries' => ChatbotKnowledge::active()->count(),
                    'total_conversations' => ChatbotConversation::where('created_at', '>=', $startDate)->count(),
                    'unique_sessions' => ChatbotConversation::where('created_at', '>=', $startDate)
                        ->distinct('session_id')->count('session_id'),
                ],
                'language_distribution' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->selectRaw('language, COUNT(*) as count')
                    ->groupBy('language')
                    ->pluck('count', 'language'),
                'category_distribution' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->whereNotNull('matched_category')
                    ->selectRaw('matched_category, COUNT(*) as count')
                    ->groupBy('matched_category')
                    ->orderBy('count', 'desc')
                    ->pluck('count', 'matched_category'),
                'daily_conversations' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->pluck('count', 'date'),
                'knowledge_by_category' => ChatbotKnowledge::selectRaw('category, COUNT(*) as count, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count')
                    ->groupBy('category')
                    ->orderBy('count', 'desc')
                    ->get(),
                'recent_conversations' => ChatbotConversation::with([])
                    ->select('user_message', 'bot_response', 'language', 'matched_category', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics'
            ], 500);
        }
    }

    /**
     * Get conversation history with filters
     */
    public function getConversations(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 20);
            $language = $request->get('language');
            $category = $request->get('category');
            $search = $request->get('search');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');

            $query = ChatbotConversation::query();

            // Apply filters
            if ($language) {
                $query->where('language', $language);
            }

            if ($category) {
                $query->where('matched_category', $category);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('user_message', 'LIKE', "%{$search}%")
                      ->orWhere('bot_response', 'LIKE', "%{$search}%");
                });
            }

            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }

            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            $conversations = $query->orderBy('created_at', 'desc')
                                  ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $conversations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    /**
     * Get available categories
     */
    public function getCategories()
    {
        try {
            $categories = ChatbotKnowledge::select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    /**
     * Bulk import knowledge entries
     */
    public function bulkImport(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'entries' => 'required|array',
                'entries.*.category' => 'required|string|max:100',
                'entries.*.question_en' => 'required|string',
                'entries.*.question_id' => 'required|string',
                'entries.*.answer_en' => 'required|string',
                'entries.*.answer_id' => 'required|string',
                'entries.*.keywords' => 'required|array',
                'entries.*.priority' => 'nullable|integer|min:0|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $imported = 0;
            $errors = [];

            DB::beginTransaction();

            foreach ($request->entries as $index => $entry) {
                try {
                    ChatbotKnowledge::create([
                        'category' => $entry['category'],
                        'question_en' => $entry['question_en'],
                        'question_id' => $entry['question_id'],
                        'answer_en' => $entry['answer_en'],
                        'answer_id' => $entry['answer_id'],
                        'keywords' => $entry['keywords'],
                        'priority' => $entry['priority'] ?? 0,
                        'is_active' => true
                    ]);
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Entry {$index}: " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$imported} entries",
                'data' => [
                    'imported' => $imported,
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to import entries'
            ], 500);
        }
    }

    /**
     * Export knowledge entries
     */
    public function exportKnowledge(Request $request)
    {
        try {
            $category = $request->get('category');
            $status = $request->get('status');

            $query = ChatbotKnowledge::query();

            if ($category) {
                $query->where('category', $category);
            }

            if ($status !== null) {
                $query->where('is_active', $status === 'active');
            }

            $knowledge = $query->orderBy('category')
                              ->orderBy('priority', 'desc')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $knowledge
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export knowledge entries'
            ], 500);
        }
    }

    /**
     * Test chatbot response
     */
    public function testResponse(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:500',
                'language' => 'required|in:en,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $chatbotService = app(\App\Services\EnhancedChatbotService::class);
            $response = $chatbotService->processMessage(
                $request->message, 
                $request->language, 
                'admin_test_' . time()
            );

            return response()->json([
                'success' => true,
                'data' => $response
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to test chatbot response'
            ], 500);
        }
    }
}