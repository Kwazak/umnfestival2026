<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\EnhancedChatbotService;
use App\Models\ChatbotKnowledge;
use App\Models\ChatbotConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    protected $chatbotService;

    public function __construct(EnhancedChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Process chat message
     */
    public function chat(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000',
                'language' => 'required|in:en,id',
                'session_id' => 'nullable|string|max:255'
            ]);

            // Generate session ID if not provided
            $sessionId = $request->session_id ?: Str::uuid()->toString();

            // Sanitize input
            $message = strip_tags(trim($request->message));
            $language = $request->language;

            // Process message through chatbot service
            $result = $this->chatbotService->processMessage($message, $language, $sessionId);

            return response()->json([
                'success' => true,
                'data' => [
                    'response' => $result['response'],
                    'suggestions' => $result['suggestions'],
                    'category' => $result['category'],
                    'session_id' => $sessionId,
                    'timestamp' => now()->toISOString()
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input provided',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Chatbot API error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = $request->language === 'id' 
                ? 'Maaf, terjadi kesalahan. Silakan coba lagi.'
                : 'Sorry, an error occurred. Please try again.';

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 500);
        }
    }

    /**
     * Get suggested questions with contextual awareness
     */
    public function getSuggestions(Request $request)
    {
        try {
            $request->validate([
                'language' => 'required|in:en,id',
                'category' => 'nullable|string',
                'session_id' => 'nullable|string|max:255'
            ]);

            $language = $request->language;
            $category = $request->category;
            $sessionId = $request->session_id;
            
            $suggestions = $this->chatbotService->getSuggestions($language, $category, $sessionId);

            return response()->json([
                'success' => true,
                'data' => [
                    'suggestions' => $suggestions,
                    'language' => $language,
                    'category' => $category,
                    'session_id' => $sessionId,
                    'contextual' => !empty($sessionId),
                    'count' => count($suggestions)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to get suggestions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get suggestions'
            ], 500);
        }
    }

    /**
     * Get conversation history for a session
     */
    public function getHistory(Request $request)
    {
        try {
            $request->validate([
                'session_id' => 'required|string',
                'limit' => 'nullable|integer|min:1|max:50'
            ]);

            $sessionId = $request->session_id;
            $limit = $request->limit ?? 20;

            $conversations = ChatbotConversation::session($sessionId)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->reverse()
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'conversations' => $conversations,
                    'session_id' => $sessionId,
                    'total' => $conversations->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get conversation history'
            ], 500);
        }
    }

    /**
     * Get chatbot analytics (admin only)
     */
    public function getAnalytics(Request $request)
    {
        try {
            $days = $request->get('days', 7);
            $startDate = now()->subDays($days);

            $analytics = [
                'total_conversations' => ChatbotConversation::where('created_at', '>=', $startDate)->count(),
                'unique_sessions' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->distinct('session_id')->count('session_id'),
                'language_distribution' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->selectRaw('language, COUNT(*) as count')
                    ->groupBy('language')
                    ->pluck('count', 'language'),
                'category_distribution' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->whereNotNull('matched_category')
                    ->selectRaw('matched_category, COUNT(*) as count')
                    ->groupBy('matched_category')
                    ->pluck('count', 'matched_category'),
                'daily_conversations' => ChatbotConversation::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->pluck('count', 'date')
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get analytics'
            ], 500);
        }
    }

    /**
     * Health check endpoint
     */
    public function health()
    {
        try {
            // Test database connection
            $knowledgeCount = ChatbotKnowledge::active()->count();
            
            return response()->json([
                'success' => true,
                'status' => 'healthy',
                'data' => [
                    'knowledge_entries' => $knowledgeCount,
                    'timestamp' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'unhealthy',
                'message' => 'Service unavailable'
            ], 503);
        }
    }

    /**
     * Get chatbot statistics (public)
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_knowledge' => ChatbotKnowledge::active()->count(),
                'total_conversations' => ChatbotConversation::count(),
                'languages_supported' => ['en', 'id'],
                'categories' => ChatbotKnowledge::active()
                    ->distinct('category')
                    ->pluck('category')
                    ->filter()
                    ->values(),
                'last_updated' => ChatbotKnowledge::latest('updated_at')->first()?->updated_at
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get stats'
            ], 500);
        }
    }
}