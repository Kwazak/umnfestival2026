<?php

namespace App\Services;

use App\Models\ChatbotKnowledge;
use App\Models\ChatbotConversation;
use App\Models\GuestStar;
use App\Models\TicketType;
use App\Models\EventUpcomingDetail;
use App\Models\CountdownEvent;
use App\Models\ArchiveVideo;
use App\Models\ClosingSection;
use App\Models\DiscountCode;
use App\Models\ReferralCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class ChatbotService
{
    private $fallbackResponses = [
        'en' => [
            "I'm here to help you with information about UMN Festival 2025! Could you please rephrase your question?",
            "I'd be happy to help! Can you ask me about tickets, events, guest stars, or general festival information?",
            "I'm not sure I understand. Try asking about UMN Festival 2025 events, tickets, or guest stars!",
            "Let me help you with UMN Festival 2025 information. What would you like to know about?"
        ],
        'id' => [
            "Saya di sini untuk membantu Anda dengan informasi tentang UMN Festival 2025! Bisakah Anda mengulang pertanyaan Anda?",
            "Saya senang membantu! Anda bisa bertanya tentang tiket, acara, bintang tamu, atau informasi festival secara umum!",
            "Saya kurang mengerti. Coba tanyakan tentang acara UMN Festival 2025, tiket, atau bintang tamu!",
            "Biarkan saya membantu Anda dengan informasi UMN Festival 2025. Apa yang ingin Anda ketahui?"
        ]
    ];

    private $greetings = [
        'en' => [
            "Hello! Welcome to UMN Festival 2025! I'm here to help you with any questions about our amazing festival. What would you like to know?",
            "Hi there! I'm your UMN Festival 2025 assistant. Feel free to ask me about tickets, events, guest stars, or anything else about the festival!",
            "Welcome! I'm excited to help you learn more about UMN Festival 2025. What can I tell you about our festival?"
        ],
        'id' => [
            "Halo! Selamat datang di UMN Festival 2025! Saya di sini untuk membantu Anda dengan pertanyaan tentang festival yang luar biasa ini. Apa yang ingin Anda ketahui?",
            "Hai! Saya asisten UMN Festival 2025 Anda. Silakan tanyakan tentang tiket, acara, bintang tamu, atau hal lain tentang festival!",
            "Selamat datang! Saya senang membantu Anda mempelajari lebih lanjut tentang UMN Festival 2025. Apa yang bisa saya ceritakan tentang festival kami?"
        ]
    ];

    public function processMessage($message, $language = 'en', $sessionId = null)
    {
        try {
            // Clean and normalize message
            $cleanMessage = $this->cleanMessage($message);
            
            // Check if it's a greeting
            if ($this->isGreeting($cleanMessage)) {
                $response = $this->getRandomResponse($this->greetings[$language]);
                $this->logConversation($sessionId, $message, $response, $language, 'greeting');
                return [
                    'response' => $response,
                    'suggestions' => $this->getSuggestions($language),
                    'category' => 'greeting'
                ];
            }

            // Extract keywords
            $keywords = $this->extractKeywords($cleanMessage, $language);
            
            // Search knowledge base
            $knowledge = $this->searchKnowledge($keywords, $language);
            
            if ($knowledge) {
                $response = $language === 'en' ? $knowledge->answer_en : $knowledge->answer_id;
                $this->logConversation($sessionId, $message, $response, $language, $knowledge->category);
                
                return [
                    'response' => $response,
                    'suggestions' => $this->getRelatedSuggestions($knowledge->category, $language),
                    'category' => $knowledge->category
                ];
            }

            // Try dynamic data search
            $dynamicResponse = $this->searchDynamicData($keywords, $language);
            if ($dynamicResponse) {
                $this->logConversation($sessionId, $message, $dynamicResponse['response'], $language, $dynamicResponse['category']);
                return $dynamicResponse;
            }

            // Fallback response
            $response = $this->getRandomResponse($this->fallbackResponses[$language]);
            $this->logConversation($sessionId, $message, $response, $language, 'fallback');
            
            return [
                'response' => $response,
                'suggestions' => $this->getSuggestions($language),
                'category' => 'fallback'
            ];

        } catch (\Exception $e) {
            \Log::error('Chatbot error: ' . $e->getMessage());
            
            $errorResponse = $language === 'en' 
                ? "I'm sorry, I'm having trouble right now. Please try again later!"
                : "Maaf, saya sedang mengalami masalah. Silakan coba lagi nanti!";
                
            return [
                'response' => $errorResponse,
                'suggestions' => $this->getSuggestions($language),
                'category' => 'error'
            ];
        }
    }

    private function cleanMessage($message)
    {
        // Remove extra spaces, convert to lowercase, remove special characters
        $cleaned = strtolower(trim($message));
        $cleaned = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleaned);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        return $cleaned;
    }

    private function isGreeting($message)
    {
        $greetingWords = [
            'en' => ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start', 'begin'],
            'id' => ['halo', 'hai', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'mulai']
        ];

        foreach ($greetingWords['en'] as $greeting) {
            if (strpos($message, $greeting) !== false) {
                return true;
            }
        }
        
        foreach ($greetingWords['id'] as $greeting) {
            if (strpos($message, $greeting) !== false) {
                return true;
            }
        }

        return false;
    }

    private function extractKeywords($message, $language)
    {
        // Common stop words to remove
        $stopWords = [
            'en' => ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'they', 'we', 'you', 'i', 'me', 'my', 'your', 'what', 'when', 'where', 'how', 'why', 'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'am', 'are', 'was', 'were', 'be', 'been', 'being'],
            'id' => ['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'oleh', 'sebagai', 'ini', 'itu', 'adalah', 'akan', 'telah', 'sudah', 'sedang', 'bisa', 'dapat', 'harus', 'mau', 'ingin', 'saya', 'anda', 'kamu', 'kami', 'mereka', 'apa', 'kapan', 'dimana', 'bagaimana', 'mengapa', 'kenapa']
        ];

        $words = explode(' ', $message);
        $keywords = [];

        foreach ($words as $word) {
            $word = trim($word);
            if (strlen($word) > 2 && !in_array($word, $stopWords['en']) && !in_array($word, $stopWords['id'])) {
                $keywords[] = $word;
            }
        }

        // Add festival-specific keywords
        $festivalKeywords = ['umn', 'festival', '2025', 'unify', 'ticket', 'tiket', 'event', 'acara', 'guest', 'star', 'bintang', 'tamu'];
        foreach ($festivalKeywords as $keyword) {
            if (strpos($message, $keyword) !== false && !in_array($keyword, $keywords)) {
                $keywords[] = $keyword;
            }
        }

        return array_unique($keywords);
    }

    private function searchKnowledge($keywords, $language)
    {
        if (empty($keywords)) {
            return null;
        }

        return ChatbotKnowledge::active()
            ->searchKeywords($keywords)
            ->ordered()
            ->first();
    }

    private function searchDynamicData($keywords, $language)
    {
        // Search guest stars
        if (in_array('guest', $keywords) || in_array('star', $keywords) || in_array('bintang', $keywords) || in_array('tamu', $keywords) || in_array('artist', $keywords) || in_array('artis', $keywords)) {
            return $this->getGuestStarsInfo($language);
        }

        // Search tickets
        if (in_array('ticket', $keywords) || in_array('tiket', $keywords) || in_array('price', $keywords) || in_array('harga', $keywords) || in_array('buy', $keywords) || in_array('beli', $keywords)) {
            return $this->getTicketInfo($language);
        }

        // Search events
        if (in_array('event', $keywords) || in_array('acara', $keywords) || in_array('schedule', $keywords) || in_array('jadwal', $keywords)) {
            return $this->getEventsInfo($language);
        }

        return null;
    }

    private function getGuestStarsInfo($language)
    {
        $guestStars = GuestStar::where('is_revealed', true)->orderBy('sort_order')->get();
        
        if ($guestStars->isEmpty()) {
            $response = $language === 'en' 
                ? "We're still announcing our amazing guest stars for UMN Festival 2025! Stay tuned for exciting reveals coming soon."
                : "Kami masih mengumumkan bintang tamu yang luar biasa untuk UMN Festival 2025! Nantikan pengumuman menarik yang akan datang.";
        } else {
            $starNames = $guestStars->pluck('name')->filter()->toArray();
            if ($language === 'en') {
                $response = "Our confirmed guest stars for UMN Festival 2025 include: " . implode(', ', $starNames) . ". More exciting announcements are coming soon!";
            } else {
                $response = "Bintang tamu yang telah dikonfirmasi untuk UMN Festival 2025 termasuk: " . implode(', ', $starNames) . ". Pengumuman menarik lainnya akan segera datang!";
            }
        }

        return [
            'response' => $response,
            'suggestions' => $this->getRelatedSuggestions('guest_stars', $language),
            'category' => 'guest_stars'
        ];
    }

    private function getTicketInfo($language)
    {
        $ticketTypes = TicketType::orderBy('sort_order')->get();
        
        if ($ticketTypes->isEmpty()) {
            $response = $language === 'en' 
                ? "Ticket information will be available soon! Please check back later for pricing and availability."
                : "Informasi tiket akan segera tersedia! Silakan periksa kembali nanti untuk harga dan ketersediaan.";
        } else {
            $availableTickets = $ticketTypes->where('is_available', true);
            $soldOutTickets = $ticketTypes->where('is_available', false);

            if ($language === 'en') {
                $response = "Here's our current ticket information for UMN Festival 2025:\n\n";
                
                if ($availableTickets->isNotEmpty()) {
                    $response .= "🎫 Available Tickets:\n";
                    foreach ($availableTickets as $ticket) {
                        $price = $ticket->price ? 'IDR ' . number_format($ticket->price, 0, ',', '.') : 'Price TBA';
                        $response .= "• {$ticket->header}: {$price}\n";
                    }
                }
                
                if ($soldOutTickets->isNotEmpty()) {
                    $response .= "\n❌ Sold Out:\n";
                    foreach ($soldOutTickets as $ticket) {
                        $response .= "• {$ticket->header}\n";
                    }
                }
            } else {
                $response = "Berikut informasi tiket terkini untuk UMN Festival 2025:\n\n";
                
                if ($availableTickets->isNotEmpty()) {
                    $response .= "🎫 Tiket Tersedia:\n";
                    foreach ($availableTickets as $ticket) {
                        $price = $ticket->price ? 'IDR ' . number_format($ticket->price, 0, ',', '.') : 'Harga akan diumumkan';
                        $response .= "• {$ticket->header}: {$price}\n";
                    }
                }
                
                if ($soldOutTickets->isNotEmpty()) {
                    $response .= "\n❌ Sold Out:\n";
                    foreach ($soldOutTickets as $ticket) {
                        $response .= "• {$ticket->header}\n";
                    }
                }
            }
        }

        return [
            'response' => $response,
            'suggestions' => $this->getRelatedSuggestions('tickets', $language),
            'category' => 'tickets'
        ];
    }

    private function getEventsInfo($language)
    {
        $events = EventUpcomingDetail::where('is_locked', false)->orderBy('sort_order')->get();
        
        if ($events->isEmpty()) {
            $response = $language === 'en' 
                ? "Event details will be announced soon! Stay tuned for our exciting lineup of activities."
                : "Detail acara akan segera diumumkan! Nantikan lineup kegiatan menarik kami.";
        } else {
            if ($language === 'en') {
                $response = "Here are our confirmed events for UMN Festival 2025:\n\n";
                foreach ($events as $event) {
                    $response .= "🎉 {$event->title}\n";
                    if ($event->description) {
                        $response .= strip_tags($event->description) . "\n\n";
                    }
                }
            } else {
                $response = "Berikut acara yang telah dikonfirmasi untuk UMN Festival 2025:\n\n";
                foreach ($events as $event) {
                    $response .= "🎉 {$event->title}\n";
                    if ($event->description) {
                        $response .= strip_tags($event->description) . "\n\n";
                    }
                }
            }
        }

        return [
            'response' => $response,
            'suggestions' => $this->getRelatedSuggestions('events', $language),
            'category' => 'events'
        ];
    }

    private function getRandomResponse($responses)
    {
        return $responses[array_rand($responses)];
    }

    private function logConversation($sessionId, $userMessage, $botResponse, $language, $category)
    {
        if ($sessionId) {
            ChatbotConversation::create([
                'session_id' => $sessionId,
                'user_message' => $userMessage,
                'bot_response' => $botResponse,
                'language' => $language,
                'matched_category' => $category
            ]);
        }
    }

    public function getSuggestions($language)
    {
        $suggestions = [
            'en' => [
                "What is UMN Festival 2025?",
                "Who are the guest stars?",
                "How much are the tickets?",
                "What events are happening?",
                "When is the festival?",
                "Where is UMN Festival held?"
            ],
            'id' => [
                "Apa itu UMN Festival 2025?",
                "Siapa bintang tamunya?",
                "Berapa harga tiketnya?",
                "Acara apa saja yang ada?",
                "Kapan festivalnya?",
                "Dimana UMN Festival diadakan?"
            ]
        ];

        return $suggestions[$language] ?? $suggestions['en'];
    }

    private function getRelatedSuggestions($category, $language)
    {
        $suggestions = [
            'en' => [
                'guest_stars' => [
                    "When will more artists be announced?",
                    "What time do performances start?",
                    "Are there meet and greet sessions?"
                ],
                'tickets' => [
                    "How do I buy tickets?",
                    "Are there student discounts?",
                    "Can I get a refund?"
                ],
                'events' => [
                    "What is E-Ulympic?",
                    "How do I join the events?",
                    "Are events free to attend?"
                ],
                'general' => [
                    "Where is the venue?",
                    "What should I bring?",
                    "Is there parking available?"
                ]
            ],
            'id' => [
                'guest_stars' => [
                    "Kapan artis lain akan diumumkan?",
                    "Jam berapa pertunjukan dimulai?",
                    "Apakah ada sesi meet and greet?"
                ],
                'tickets' => [
                    "Bagaimana cara beli tiket?",
                    "Apakah ada diskon mahasiswa?",
                    "Bisakah saya refund?"
                ],
                'events' => [
                    "Apa itu E-Ulympic?",
                    "Bagaimana cara ikut acara?",
                    "Apakah acara gratis?"
                ],
                'general' => [
                    "Dimana lokasinya?",
                    "Apa yang harus saya bawa?",
                    "Apakah ada tempat parkir?"
                ]
            ]
        ];

        return $suggestions[$language][$category] ?? $this->getSuggestions($language);
    }
}