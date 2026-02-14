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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EnhancedChatbotService
{
    private $greetings = [
        'en' => [
            "Hello! 👋 Welcome to UMN Festival 2025! I'm your intelligent AI assistant, ready to help you discover everything about our amazing festival. I can speak both English and Indonesian fluently, so feel free to communicate however you're comfortable! What would you like to know?",
            "Hi there! 🎉 I'm your smart UMN Festival 2025 assistant. I understand context, remember our conversation, and can provide detailed, personalized information about tickets, events, guest stars, merchandise, and much more. How can I assist you today?",
            "Welcome to UMN Festival 2025! 🎊 I'm an intelligent, context-aware AI assistant excited to help you explore our festival. I can mix languages naturally and provide comprehensive, engaging answers. What information are you looking for?",
            "Hey! 🌟 I'm your friendly UMN Festival 2025 AI companion. I'm designed to understand your needs, provide detailed explanations, and make our conversation feel natural and helpful. Ask me anything about the festival!"
        ],
        'id' => [
            "Halo! 👋 Selamat datang di UMN Festival 2025! Saya asisten AI yang cerdas, siap membantu Anda menemukan segala hal tentang festival luar biasa kami. Saya bisa berbicara bahasa Indonesia dan Inggris dengan lancar, jadi silakan berkomunikasi sesuai kenyamanan Anda! Apa yang ingin Anda ketahui?",
            "Hai! 🎉 Saya asisten pintar UMN Festival 2025. Saya memahami konteks, mengingat percakapan kita, dan bisa memberikan informasi detail dan personal tentang tiket, acara, bintang tamu, merchandise, dan banyak lagi. Bagaimana saya bisa membantu Anda hari ini?",
            "Selamat datang di UMN Festival 2025! 🎊 Saya asisten AI yang cerdas dan sadar konteks, senang membantu Anda menjelajahi festival kami. Saya bisa mencampur bahasa secara natural dan memberikan jawaban yang komprehensif dan menarik. Informasi apa yang Anda cari?",
            "Hei! 🌟 Saya teman AI UMN Festival 2025 yang ramah. Saya dirancang untuk memahami kebutuhan Anda, memberikan penjelasan detail, dan membuat percakapan kita terasa natural dan membantu. Tanya apa saja tentang festival!"
        ]
    ];

    /**
     * Core intelligence: Transform short knowledge entries into comprehensive, engaging responses
     * This is the heart of the intelligent chatbot - it takes basic knowledge and expands it
     * into natural, conversational, and informative responses that feel human.
     */
    private function expandKnowledgeResponse($knowledge, $language, $userMessage, $sessionId = null)
    {
        // Get the base answer from knowledge base
        $baseAnswer = $language === 'en' ? $knowledge->answer_en : $knowledge->answer_id;
        
        // If the base answer is already comprehensive (>200 chars), use it as is but enhance it
        if (strlen($baseAnswer) > 200) {
            return $this->enhanceExistingResponse($baseAnswer, $knowledge, $language, $userMessage, $sessionId);
        }
        
        // For short answers, expand them into full, engaging responses
        return $this->createExpandedResponse($baseAnswer, $knowledge, $language, $userMessage, $sessionId);
    }

    /**
     * Enhance already comprehensive responses with context and personality
     */
    private function enhanceExistingResponse($baseAnswer, $knowledge, $language, $userMessage, $sessionId)
    {
        // Add contextual introduction based on user's question
        $introduction = $this->generateContextualIntroduction($userMessage, $knowledge->category, $language);
        
        // Add relevant context or additional information
        $additionalContext = $this->generateAdditionalContext($knowledge->category, $language, $sessionId);
        
        // Add helpful closing with next steps or related information
        $helpfulClosing = $this->generateHelpfulClosing($knowledge->category, $language);
        
        // Combine everything naturally
        $enhancedResponse = $introduction . "\n\n" . $baseAnswer;
        
        if ($additionalContext) {
            $enhancedResponse .= "\n\n" . $additionalContext;
        }
        
        if ($helpfulClosing) {
            $enhancedResponse .= "\n\n" . $helpfulClosing;
        }
        
        return $enhancedResponse;
    }

    /**
     * Create fully expanded responses from short knowledge entries
     */
    private function createExpandedResponse($baseAnswer, $knowledge, $language, $userMessage, $sessionId)
    {
        // Start with contextual introduction
        $introduction = $this->generateContextualIntroduction($userMessage, $knowledge->category, $language);
        
        // Expand the core answer with relevant details
        $expandedCore = $this->expandCoreAnswer($baseAnswer, $knowledge, $language);
        
        // Add supporting information and context
        $supportingInfo = $this->generateSupportingInformation($knowledge->category, $language, $sessionId);
        
        // Add practical next steps or related information
        $practicalInfo = $this->generatePracticalInformation($knowledge->category, $language);
        
        // Combine everything into a natural, flowing response
        $fullResponse = $introduction . "\n\n" . $expandedCore;
        
        if ($supportingInfo) {
            $fullResponse .= "\n\n" . $supportingInfo;
        }
        
        if ($practicalInfo) {
            $fullResponse .= "\n\n" . $practicalInfo;
        }
        
        return $fullResponse;
    }

    /**
     * Generate contextual introductions based on user's question
     */
    private function generateContextualIntroduction($userMessage, $category, $language)
    {
        $userMessageLower = strtolower($userMessage);
        
        // Detect question type and respond appropriately
        if (strpos($userMessageLower, 'what') !== false || strpos($userMessageLower, 'apa') !== false) {
            return $language === 'en' 
                ? "Great question! Let me explain that for you." 
                : "Pertanyaan yang bagus! Biar saya jelaskan untuk Anda.";
        }
        
        if (strpos($userMessageLower, 'how') !== false || strpos($userMessageLower, 'bagaimana') !== false) {
            return $language === 'en' 
                ? "I'd be happy to walk you through that process!" 
                : "Saya senang membantu menjelaskan prosesnya!";
        }
        
        if (strpos($userMessageLower, 'when') !== false || strpos($userMessageLower, 'kapan') !== false) {
            return $language === 'en' 
                ? "Here's the timing information you're looking for:" 
                : "Ini informasi waktu yang Anda cari:";
        }
        
        if (strpos($userMessageLower, 'where') !== false || strpos($userMessageLower, 'dimana') !== false) {
            return $language === 'en' 
                ? "Let me help you with the location details:" 
                : "Biar saya bantu dengan detail lokasinya:";
        }
        
        if (strpos($userMessageLower, 'why') !== false || strpos($userMessageLower, 'mengapa') !== false || strpos($userMessageLower, 'kenapa') !== false) {
            return $language === 'en' 
                ? "That's an excellent question! Here's the reasoning behind it:" 
                : "Itu pertanyaan yang sangat baik! Ini alasannya:";
        }
        
        // Default contextual introduction
        return $language === 'en' 
            ? "I'm excited to help you with that!" 
            : "Saya senang bisa membantu Anda dengan itu!";
    }

    /**
     * Expand core answers with relevant details and context
     */
    private function expandCoreAnswer($baseAnswer, $knowledge, $language)
    {
        $category = $knowledge->category;
        
        // Add category-specific expansions
        switch ($category) {
            case 'tickets':
            case 'tiket':
                return $this->expandTicketAnswer($baseAnswer, $language);
                
            case 'guest_stars':
            case 'bintang_tamu':
                return $this->expandGuestStarAnswer($baseAnswer, $language);
                
            case 'events':
            case 'acara':
                return $this->expandEventAnswer($baseAnswer, $language);
                
            case 'merchandise':
                return $this->expandMerchandiseAnswer($baseAnswer, $language);
                
            case 'location':
            case 'lokasi':
                return $this->expandLocationAnswer($baseAnswer, $language);
                
            case 'payment':
            case 'pembayaran':
                return $this->expandPaymentAnswer($baseAnswer, $language);
                
            default:
                return $this->expandGeneralAnswer($baseAnswer, $language);
        }
    }

    /**
     * Category-specific answer expansions
     */
    private function expandTicketAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nOur ticketing system is designed to be user-friendly and secure. We offer multiple pricing tiers to accommodate different budgets, and all tickets include access to the main festival events. Payment is processed through Midtrans, ensuring your transaction is safe and reliable. Once purchased, your tickets will be delivered instantly to your email, so you can start planning your festival experience right away!";
        } else {
            return $baseAnswer . "\n\nSistem tiket kami dirancang untuk mudah digunakan dan aman. Kami menawarkan berbagai tingkat harga untuk mengakomodasi berbagai budget, dan semua tiket termasuk akses ke acara utama festival. Pembayaran diproses melalui Midtrans, memastikan transaksi Anda aman dan terpercaya. Setelah dibeli, tiket akan langsung dikirim ke email Anda, jadi Anda bisa mulai merencanakan pengalaman festival Anda!";
        }
    }

    private function expandGuestStarAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nWe're incredibly excited about our lineup this year! Our guest stars represent a diverse mix of talents, ensuring there's something for everyone to enjoy. Each performance is carefully curated to create an unforgettable experience. We'll be announcing more artists as we get closer to the festival date, so keep an eye on our social media channels for the latest updates. The energy and talent these artists bring will make UMN Festival 2025 truly special!";
        } else {
            return $baseAnswer . "\n\nKami sangat excited dengan lineup tahun ini! Bintang tamu kami mewakili campuran talenta yang beragam, memastikan ada sesuatu untuk semua orang. Setiap pertunjukan dikurasi dengan hati-hati untuk menciptakan pengalaman yang tak terlupakan. Kami akan mengumumkan lebih banyak artis saat mendekati tanggal festival, jadi pantau terus media sosial kami untuk update terbaru. Energi dan talenta yang dibawa artis-artis ini akan membuat UMN Festival 2025 benar-benar istimewa!";
        }
    }

    private function expandEventAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nEach event at UMN Festival 2025 is thoughtfully designed to bring our community together and create lasting memories. Whether you're interested in competitive gaming, community service, or simply enjoying great entertainment, there's something for you. Most events are free to participate in with your festival ticket, and we encourage everyone to try something new. Our organizing committee has worked hard to ensure each event is engaging, inclusive, and fun for all attendees!";
        } else {
            return $baseAnswer . "\n\nSetiap acara di UMN Festival 2025 dirancang dengan penuh perhatian untuk menyatukan komunitas kita dan menciptakan kenangan yang bertahan lama. Baik Anda tertarik dengan gaming kompetitif, pengabdian masyarakat, atau sekadar menikmati hiburan yang bagus, ada sesuatu untuk Anda. Sebagian besar acara gratis untuk diikuti dengan tiket festival Anda, dan kami mendorong semua orang untuk mencoba sesuatu yang baru. Panitia penyelenggara telah bekerja keras untuk memastikan setiap acara menarik, inklusif, dan menyenangkan untuk semua peserta!";
        }
    }

    private function expandMerchandiseAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nOur merchandise collection is more than just souvenirs – they're pieces of the UMN Festival 2025 experience you can take home! Each item is designed with care, featuring fresh, modern designs that capture the spirit of our festival. We use high-quality materials to ensure your merchandise lasts long after the festival ends. From practical items like lanyards and keychains to stylish apparel, there's something for every taste and budget. These items also make great gifts for friends and family!";
        } else {
            return $baseAnswer . "\n\nKoleksi merchandise kami lebih dari sekadar souvenir – ini adalah bagian dari pengalaman UMN Festival 2025 yang bisa Anda bawa pulang! Setiap item dirancang dengan hati-hati, menampilkan desain segar dan modern yang menangkap semangat festival kami. Kami menggunakan bahan berkualitas tinggi untuk memastikan merchandise Anda tahan lama setelah festival berakhir. Dari item praktis seperti lanyard dan gantungan kunci hingga pakaian stylish, ada sesuatu untuk setiap selera dan budget. Item-item ini juga cocok sebagai hadiah untuk teman dan keluarga!";
        }
    }

    private function expandLocationAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nUMN's campus is strategically located in Serpong, making it easily accessible from Jakarta and surrounding areas. The campus itself is modern and well-equipped, providing the perfect backdrop for our festival. We have ample parking facilities, and the venue is accessible by various public transportation options. The campus features beautiful outdoor spaces and state-of-the-art indoor facilities, ensuring a comfortable experience regardless of weather conditions. Our location team has worked to ensure smooth traffic flow and easy navigation for all attendees!";
        } else {
            return $baseAnswer . "\n\nKampus UMN berlokasi strategis di Serpong, membuatnya mudah diakses dari Jakarta dan daerah sekitarnya. Kampus itu sendiri modern dan lengkap, memberikan latar belakang yang sempurna untuk festival kami. Kami memiliki fasilitas parkir yang memadai, dan venue dapat diakses dengan berbagai pilihan transportasi umum. Kampus menampilkan ruang outdoor yang indah dan fasilitas indoor yang canggih, memastikan pengalaman yang nyaman terlepas dari kondisi cuaca. Tim lokasi kami telah bekerja untuk memastikan alur lalu lintas yang lancar dan navigasi yang mudah untuk semua peserta!";
        }
    }

    private function expandPaymentAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nWe've partnered with Midtrans to provide you with a secure, reliable payment experience. This means you can choose from various payment methods including credit cards, bank transfers, and popular e-wallets, making it convenient for everyone. Our payment system is designed with security as the top priority, protecting your personal and financial information. Once your payment is confirmed, you'll receive an instant confirmation email with your tickets attached. If you encounter any issues during payment, our support team is ready to help you complete your purchase smoothly!";
        } else {
            return $baseAnswer . "\n\nKami bermitra dengan Midtrans untuk memberikan Anda pengalaman pembayaran yang aman dan terpercaya. Ini berarti Anda bisa memilih dari berbagai metode pembayaran termasuk kartu kredit, transfer bank, dan e-wallet populer, membuatnya nyaman untuk semua orang. Sistem pembayaran kami dirancang dengan keamanan sebagai prioritas utama, melindungi informasi pribadi dan keuangan Anda. Setelah pembayaran dikonfirmasi, Anda akan menerima email konfirmasi instan dengan tiket terlampir. Jika Anda mengalami masalah saat pembayaran, tim support kami siap membantu Anda menyelesaikan pembelian dengan lancar!";
        }
    }

    private function expandGeneralAnswer($baseAnswer, $language)
    {
        if ($language === 'en') {
            return $baseAnswer . "\n\nUMN Festival 2025 represents the culmination of months of planning and preparation by our dedicated organizing committee. Every aspect of the festival is designed with our community in mind, ensuring an inclusive, enjoyable experience for all attendees. We're committed to creating not just an event, but a celebration that brings people together and creates lasting memories. Thank you for being part of this amazing journey with us!";
        } else {
            return $baseAnswer . "\n\nUMN Festival 2025 mewakili puncak dari berbulan-bulan perencanaan dan persiapan oleh panitia penyelenggara yang berdedikasi. Setiap aspek festival dirancang dengan komunitas kami dalam pikiran, memastikan pengalaman yang inklusif dan menyenangkan untuk semua peserta. Kami berkomitmen untuk menciptakan bukan hanya sebuah acara, tetapi perayaan yang menyatukan orang-orang dan menciptakan kenangan yang bertahan lama. Terima kasih telah menjadi bagian dari perjalanan luar biasa ini bersama kami!";
        }
    }

    /**
     * Generate additional context based on category and conversation history
     */
    private function generateAdditionalContext($category, $language, $sessionId)
    {
        // Get conversation history to provide relevant context
        $recentTopics = $this->getRecentConversationTopics($sessionId);
        
        // Generate context based on category and recent conversation
        switch ($category) {
            case 'tickets':
            case 'tiket':
                if (!in_array('payment', $recentTopics)) {
                    return $language === 'en' 
                        ? "💡 Pro tip: We accept various payment methods through Midtrans for your convenience!"
                        : "💡 Tips: Kami menerima berbagai metode pembayaran melalui Midtrans untuk kemudahan Anda!";
                }
                break;
                
            case 'guest_stars':
            case 'bintang_tamu':
                if (!in_array('schedule', $recentTopics)) {
                    return $language === 'en' 
                        ? "🎵 Performance schedules will be announced closer to the festival date!"
                        : "🎵 Jadwal pertunjukan akan diumumkan mendekati tanggal festival!";
                }
                break;
                
            case 'events':
            case 'acara':
                if (!in_array('registration', $recentTopics)) {
                    return $language === 'en' 
                        ? "📝 Most events are free with your festival ticket, but some may require separate registration!"
                        : "📝 Sebagian besar acara gratis dengan tiket festival Anda, tapi beberapa mungkin perlu registrasi terpisah!";
                }
                break;
        }
        
        return null;
    }

    /**
     * Generate helpful closing information
     */
    private function generateHelpfulClosing($category, $language)
    {
        $closings = [
            'en' => [
                'tickets' => "Ready to join us? Visit our ticket page to secure your spot at UMN Festival 2025! 🎫",
                'guest_stars' => "Stay tuned to our social media for more artist announcements! 🌟",
                'events' => "Check out our events page for detailed schedules and registration info! 🎪",
                'merchandise' => "Browse our full merchandise collection on the website! 🛍️",
                'location' => "Need directions? Check our website for detailed maps and transportation options! 📍",
                'payment' => "Ready to purchase? Our secure payment system is waiting for you! 💳",
                'default' => "Have more questions? I'm here to help anytime! 😊"
            ],
            'id' => [
                'tickets' => "Siap bergabung dengan kami? Kunjungi halaman tiket untuk mengamankan tempat Anda di UMN Festival 2025! 🎫",
                'guest_stars' => "Pantau terus media sosial kami untuk pengumuman artis lainnya! 🌟",
                'events' => "Lihat halaman acara kami untuk jadwal detail dan info registrasi! 🎪",
                'merchandise' => "Jelajahi koleksi merchandise lengkap kami di website! 🛍️",
                'location' => "Butuh petunjuk arah? Cek website kami untuk peta detail dan pilihan transportasi! 📍",
                'payment' => "Siap untuk membeli? Sistem pembayaran aman kami menunggu Anda! 💳",
                'default' => "Ada pertanyaan lain? Saya di sini untuk membantu kapan saja! 😊"
            ]
        ];
        
        return $closings[$language][$category] ?? $closings[$language]['default'];
    }

    /**
     * Generate supporting information based on category
     */
    private function generateSupportingInformation($category, $language, $sessionId)
    {
        // This method adds relevant supporting details that enhance the main answer
        switch ($category) {
            case 'tickets':
            case 'tiket':
                return $this->getTicketSupportingInfo($language);
                
            case 'guest_stars':
            case 'bintang_tamu':
                return $this->getGuestStarSupportingInfo($language);
                
            case 'events':
            case 'acara':
                return $this->getEventSupportingInfo($language);
                
            default:
                return null;
        }
    }

    /**
     * Generate practical next-step information
     */
    private function generatePracticalInformation($category, $language)
    {
        $practicalInfo = [
            'en' => [
                'tickets' => "🎯 Next steps: Choose your ticket type, complete payment, and you'll receive instant confirmation via email!",
                'guest_stars' => "🎯 What to expect: Amazing performances, possible meet & greets, and unforgettable musical experiences!",
                'events' => "🎯 How to participate: Most events are walk-in friendly, but check individual event requirements on our website!",
                'merchandise' => "🎯 Shopping tips: Items may sell out quickly, so grab your favorites early during the festival!",
                'location' => "🎯 Planning your visit: Arrive early for parking, bring comfortable shoes, and don't forget your ticket!",
                'payment' => "🎯 Payment process: Select tickets → Choose payment method → Complete transaction → Receive confirmation!"
            ],
            'id' => [
                'tickets' => "🎯 Langkah selanjutnya: Pilih jenis tiket, selesaikan pembayaran, dan Anda akan menerima konfirmasi instan via email!",
                'guest_stars' => "🎯 Yang bisa diharapkan: Pertunjukan luar biasa, kemungkinan meet & greet, dan pengalaman musik yang tak terlupakan!",
                'events' => "🎯 Cara berpartisipasi: Sebagian besar acara bisa langsung datang, tapi cek persyaratan acara individual di website kami!",
                'merchandise' => "🎯 Tips belanja: Item mungkin cepat habis, jadi ambil favorit Anda lebih awal selama festival!",
                'location' => "🎯 Merencanakan kunjungan: Datang lebih awal untuk parkir, bawa sepatu nyaman, dan jangan lupa tiket Anda!",
                'payment' => "🎯 Proses pembayaran: Pilih tiket → Pilih metode pembayaran → Selesaikan transaksi → Terima konfirmasi!"
            ]
        ];
        
        return $practicalInfo[$language][$category] ?? null;
    }

    /**
     * Get recent conversation topics for context
     */
    private function getRecentConversationTopics($sessionId)
    {
        if (!$sessionId) return [];
        
        try {
            $recentConversations = ChatbotConversation::where('session_id', $sessionId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->pluck('matched_category')
                ->filter()
                ->unique()
                ->toArray();
                
            return $recentConversations;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Supporting information methods
     */
    private function getTicketSupportingInfo($language)
    {
        return $language === 'en' 
            ? "💰 We offer early bird pricing for the best value, and group discounts may be available for bulk purchases."
            : "💰 Kami menawarkan harga early bird untuk nilai terbaik, dan diskon grup mungkin tersedia untuk pembelian dalam jumlah banyak.";
    }

    private function getGuestStarSupportingInfo($language)
    {
        return $language === 'en' 
            ? "🎤 Our artists are carefully selected to represent diverse genres and ensure an amazing musical journey for all attendees."
            : "🎤 Artis kami dipilih dengan hati-hati untuk mewakili genre yang beragam dan memastikan perjalanan musik yang luar biasa untuk semua peserta.";
    }

    private function getEventSupportingInfo($language)
    {
        return $language === 'en' 
            ? "🏆 From competitive gaming to community service, each event is designed to showcase different aspects of our vibrant university community."
            : "🏆 Dari gaming kompetitif hingga pengabdian masyarakat, setiap acara dirancang untuk menampilkan berbagai aspek komunitas universitas yang dinamis.";
    }

    private $comprehensiveKnowledge = [
        'en' => [
            'festival_info' => [
                'name' => 'UMN Festival 2025',
                'theme' => 'UNIFY 2025',
                'university' => 'Universitas Multimedia Nusantara',
                'location' => 'UMN Campus, Serpong, Tangerang Selatan, Banten, Indonesia',
                'description' => 'The biggest annual festival at Universitas Multimedia Nusantara, bringing together students, alumni, and community through various events, entertainment, and activities.'
            ],
            'events' => [
                'unveiling' => 'Opening ceremony that introduces festival activities and marks the official start',
                'eulympic' => 'E-sports competition to discover gaming talents from UMN and other students',
                'ucare' => 'Community service event focusing on social responsibility',
                'merchandise' => 'Official merchandise line with fresh designs and premium quality'
            ],
            'merchandise_items' => [
                'lanyard' => 'UMN Festival 2025 Lanyard - IDR 20,000',
                'keychain' => 'UMN Festival 2025 Keychain Series - IDR 13,000-20,000',
                'handfan' => 'Nago UMN Festival 2025 Hand Fan - IDR 12,000',
                'tshirt' => 'Official festival t-shirts with premium quality',
                'totebag' => 'Eco-friendly tote bags with festival design'
            ],
            'website_pages' => [
                'home' => 'Main page with festival overview, countdown, and latest updates',
                'ticket' => 'Ticket purchasing page with pricing and availability',
                'event' => 'Detailed information about all festival events',
                'merchandise' => 'Official merchandise store with product catalog',
                'about' => 'About UMN Festival and organizing committee information'
            ]
        ],
        'id' => [
            'festival_info' => [
                'name' => 'UMN Festival 2025',
                'theme' => 'UNIFY 2025',
                'university' => 'Universitas Multimedia Nusantara',
                'location' => 'Kampus UMN, Serpong, Tangerang Selatan, Banten, Indonesia',
                'description' => 'Festival tahunan terbesar di Universitas Multimedia Nusantara yang menyatukan mahasiswa, alumni, dan komunitas melalui berbagai acara, hiburan, dan aktivitas.'
            ],
            'events' => [
                'unveiling' => 'Acara pembuka yang memperkenalkan kegiatan festival dan menandai dimulainya festival secara resmi',
                'eulympic' => 'Kompetisi e-sports untuk menemukan bakat gaming dari mahasiswa UMN dan mahasiswa lainnya',
                'ucare' => 'Acara pengabdian masyarakat yang fokus pada tanggung jawab sosial',
                'merchandise' => 'Lini merchandise resmi dengan desain segar dan kualitas premium'
            ],
            'merchandise_items' => [
                'lanyard' => 'Lanyard UMN Festival 2025 - IDR 20.000',
                'keychain' => 'Seri Gantungan Kunci UMN Festival 2025 - IDR 13.000-20.000',
                'handfan' => 'Kipas Tangan Nago UMN Festival 2025 - IDR 12.000',
                'tshirt' => 'Kaos resmi festival dengan kualitas premium',
                'totebag' => 'Tas ramah lingkungan dengan desain festival'
            ],
            'website_pages' => [
                'home' => 'Halaman utama dengan overview festival, countdown, dan update terbaru',
                'ticket' => 'Halaman pembelian tiket dengan harga dan ketersediaan',
                'event' => 'Informasi detail tentang semua acara festival',
                'merchandise' => 'Toko merchandise resmi dengan katalog produk',
                'about' => 'Tentang UMN Festival dan informasi panitia penyelenggara'
            ]
        ]
    ];

    public function processMessage($message, $language = 'en', $sessionId = null)
    {
        try {
            // Clean and normalize message
            $cleanMessage = $this->cleanMessage($message);
            
            // Check for greetings
            if ($this->isGreeting($cleanMessage)) {
                return $this->handleGreeting($language, $sessionId, $message);
            }

            // Extract keywords
            $keywords = $this->extractKeywords($cleanMessage, $language);
            
            // Multi-layer search approach
            $response = $this->intelligentSearch($keywords, $language, $cleanMessage, $sessionId);
            
            // Log conversation
            if ($sessionId) {
                $this->logConversation($sessionId, $message, $response['response'], $language, $response['category']);
            }
            
            return $response;

        } catch (\Exception $e) {
            Log::error('Enhanced Chatbot error: ' . $e->getMessage());
            return $this->generateErrorResponse($language, $sessionId);
        }
    }

    private function intelligentSearch($keywords, $language, $originalMessage, $sessionId = null)
    {
        // 1. Search knowledge base first with intelligent expansion
        $knowledgeResponse = $this->searchKnowledgeBase($keywords, $language, $sessionId, $originalMessage);
        if ($knowledgeResponse) {
            return $knowledgeResponse;
        }

        // 2. Search comprehensive website data
        $websiteResponse = $this->searchWebsiteContent($keywords, $language, $originalMessage, $sessionId);
        if ($websiteResponse) {
            return $websiteResponse;
        }

        // 3. Search dynamic database content
        $dynamicResponse = $this->searchDynamicContent($keywords, $language, $sessionId);
        if ($dynamicResponse) {
            return $dynamicResponse;
        }

        // 4. Contextual fallback based on keywords
        return $this->generateContextualFallback($keywords, $language, $sessionId);
    }

    private function searchKnowledgeBase($keywords, $language, $sessionId = null, $originalMessage = '')
    {
        if (empty($keywords)) return null;

        $knowledge = ChatbotKnowledge::active()
            ->searchKeywords($keywords)
            ->ordered()
            ->first();

        if ($knowledge) {
            // ✅ CORE INTELLIGENCE: Expand short knowledge entries into comprehensive responses
            $expandedResponse = $this->expandKnowledgeResponse($knowledge, $language, $originalMessage, $sessionId);
            
            return [
                'response' => $expandedResponse,
                'suggestions' => $this->getSuggestions($language, $knowledge->category, $sessionId),
                'category' => $knowledge->category
            ];
        }

        return null;
    }

    private function searchWebsiteContent($keywords, $language, $originalMessage, $sessionId = null)
    {
        $knowledge = $this->comprehensiveKnowledge[$language];

        // Festival general information
        if ($this->matchesKeywords($keywords, ['festival', 'umn', '2025', 'unify', 'about', 'what', 'apa', 'tentang'])) {
            return [
                'response' => $this->buildFestivalOverview($language),
                'suggestions' => $this->getSuggestions($language, 'general', $sessionId),
                'category' => 'general'
            ];
        }

        // Location and venue
        if ($this->matchesKeywords($keywords, ['location', 'where', 'venue', 'address', 'lokasi', 'dimana', 'tempat', 'alamat'])) {
            return [
                'response' => $this->buildLocationInfo($language),
                'suggestions' => $this->getSuggestions($language, 'location', $sessionId),
                'category' => 'location'
            ];
        }

        // Merchandise information
        if ($this->matchesKeywords($keywords, ['merchandise', 'merch', 'product', 'buy', 'shop', 'store', 'produk', 'beli', 'toko'])) {
            return [
                'response' => $this->buildMerchandiseInfo($language),
                'suggestions' => $this->getSuggestions($language, 'merchandise', $sessionId),
                'category' => 'merchandise'
            ];
        }

        // Website navigation help
        if ($this->matchesKeywords($keywords, ['page', 'website', 'navigate', 'find', 'halaman', 'situs', 'cari'])) {
            return [
                'response' => $this->buildNavigationHelp($language),
                'suggestions' => $this->getSuggestions($language, 'navigation', $sessionId),
                'category' => 'navigation'
            ];
        }

        // Payment and purchase
        if ($this->matchesKeywords($keywords, ['payment', 'pay', 'purchase', 'buy', 'order', 'pembayaran', 'bayar', 'beli', 'pesan'])) {
            return [
                'response' => $this->buildPaymentInfo($language),
                'suggestions' => $this->getSuggestions($language, 'payment', $sessionId),
                'category' => 'payment'
            ];
        }

        // University information
        if ($this->matchesKeywords($keywords, ['university', 'umn', 'campus', 'student', 'universitas', 'kampus', 'mahasiswa'])) {
            return [
                'response' => $this->buildUniversityInfo($language),
                'suggestions' => $this->getSuggestions($language, 'university', $sessionId),
                'category' => 'university'
            ];
        }

        return null;
    }

    private function searchDynamicContent($keywords, $language, $sessionId = null)
    {
        // Guest stars with enhanced information
        if ($this->matchesKeywords($keywords, ['guest', 'star', 'artist', 'performer', 'music', 'band', 'bintang', 'tamu', 'artis', 'penampil', 'musik'])) {
            return $this->getEnhancedGuestStarsInfo($language, $sessionId);
        }

        // Tickets with comprehensive details
        if ($this->matchesKeywords($keywords, ['ticket', 'price', 'cost', 'buy', 'purchase', 'available', 'tiket', 'harga', 'beli', 'tersedia'])) {
            return $this->getEnhancedTicketInfo($language, $sessionId);
        }

        // Events with detailed information
        if ($this->matchesKeywords($keywords, ['event', 'activity', 'program', 'schedule', 'acara', 'kegiatan', 'program', 'jadwal'])) {
            return $this->getEnhancedEventsInfo($language, $sessionId);
        }

        // Archive and history
        if ($this->matchesKeywords($keywords, ['archive', 'history', 'past', 'previous', 'arsip', 'sejarah', 'masa', 'lalu'])) {
            return $this->getArchiveInfo($language, $sessionId);
        }

        // Countdown and dates
        if ($this->matchesKeywords($keywords, ['when', 'date', 'time', 'countdown', 'schedule', 'kapan', 'tanggal', 'waktu', 'jadwal'])) {
            return $this->getCountdownInfo($language, $sessionId);
        }

        return null;
    }

    private function buildFestivalOverview($language)
    {
        $info = $this->comprehensiveKnowledge[$language]['festival_info'];
        
        if ($language === 'en') {
            return "🎉 {$info['name']} with theme '{$info['theme']}' is {$info['description']} Located at {$info['location']}, this festival represents the spirit of unity and celebration in the UMN community.";
        } else {
            return "🎉 {$info['name']} dengan tema '{$info['theme']}' adalah {$info['description']} Berlokasi di {$info['location']}, festival ini mewakili semangat persatuan dan perayaan di komunitas UMN.";
        }
    }

    private function buildLocationInfo($language)
    {
        $info = $this->comprehensiveKnowledge[$language]['festival_info'];
        
        if ($language === 'en') {
            return "📍 UMN Festival 2025 is held at {$info['location']}. The campus is easily accessible by public transportation and private vehicles. Parking facilities are available on campus.";
        } else {
            return "📍 UMN Festival 2025 diadakan di {$info['location']}. Kampus mudah diakses dengan transportasi umum dan kendaraan pribadi. Fasilitas parkir tersedia di kampus.";
        }
    }

    private function buildMerchandiseInfo($language)
    {
        $items = $this->comprehensiveKnowledge[$language]['merchandise_items'];
        
        if ($language === 'en') {
            $response = "🛍️ UMN Festival 2025 Official Merchandise:\n\n";
            foreach ($items as $key => $item) {
                $response .= "• {$item}\n";
            }
            $response .= "\nAll merchandise features fresh designs with premium quality. Visit our merchandise page for the complete collection!";
        } else {
            $response = "🛍️ Merchandise Resmi UMN Festival 2025:\n\n";
            foreach ($items as $key => $item) {
                $response .= "• {$item}\n";
            }
            $response .= "\nSemua merchandise menampilkan desain segar dengan kualitas premium. Kunjungi halaman merchandise kami untuk koleksi lengkap!";
        }

        return $response;
    }

    private function buildNavigationHelp($language)
    {
        $pages = $this->comprehensiveKnowledge[$language]['website_pages'];
        
        if ($language === 'en') {
            $response = "🧭 UMN Festival 2025 Website Navigation:\n\n";
            foreach ($pages as $page => $description) {
                $response .= "• **{$page}**: {$description}\n";
            }
            $response .= "\nYou can navigate to any page using the menu at the top of the website!";
        } else {
            $response = "🧭 Navigasi Website UMN Festival 2025:\n\n";
            foreach ($pages as $page => $description) {
                $response .= "• **{$page}**: {$description}\n";
            }
            $response .= "\nAnda dapat navigasi ke halaman manapun menggunakan menu di bagian atas website!";
        }

        return $response;
    }

    private function buildPaymentInfo($language)
    {
        if ($language === 'en') {
            return "💳 Payment Information for UMN Festival 2025:\n\n• We accept various payment methods through Midtrans\n• Secure payment processing with multiple options\n• Instant ticket delivery via email\n• Payment confirmation within minutes\n• Support for credit cards, bank transfers, and e-wallets\n\nFor any payment issues, please contact our support team!";
        } else {
            return "💳 Informasi Pembayaran UMN Festival 2025:\n\n• Kami menerima berbagai metode pembayaran melalui Midtrans\n• Proses pembayaran aman dengan berbagai pilihan\n• Pengiriman tiket instan via email\n• Konfirmasi pembayaran dalam hitungan menit\n• Dukungan untuk kartu kredit, transfer bank, dan e-wallet\n\nUntuk masalah pembayaran, silakan hubungi tim support kami!";
        }
    }

    private function buildUniversityInfo($language)
    {
        if ($language === 'en') {
            return "🏫 About Universitas Multimedia Nusantara (UMN):\n\n• Leading private university in Indonesia\n• Located in Serpong, Tangerang Selatan\n• Focus on multimedia, technology, and creative industries\n• Modern campus with state-of-the-art facilities\n• Home to UMN Festival, the biggest annual celebration\n\nUMN Festival represents the vibrant spirit of our university community!";
        } else {
            return "🏫 Tentang Universitas Multimedia Nusantara (UMN):\n\n• Universitas swasta terkemuka di Indonesia\n• Berlokasi di Serpong, Tangerang Selatan\n• Fokus pada multimedia, teknologi, dan industri kreatif\n• Kampus modern dengan fasilitas canggih\n• Rumah bagi UMN Festival, perayaan tahunan terbesar\n\nUMN Festival mewakili semangat komunitas universitas yang dinamis!";
        }
    }

    private function getEnhancedGuestStarsInfo($language, $sessionId = null)
    {
        $guestStars = Cache::remember('chatbot_guest_stars', 300, function () {
            return GuestStar::orderBy('sort_order')->get();
        });

        $revealed = $guestStars->where('is_revealed', true);
        $upcoming = $guestStars->where('is_revealed', false)->count();

        if ($language === 'en') {
            $response = "🌟 UMN Festival 2025 Guest Stars:\n\n";
            
            if ($revealed->isNotEmpty()) {
                $response .= "✅ Confirmed Artists:\n";
                foreach ($revealed as $star) {
                    $response .= "• {$star->name}\n";
                }
            }
            
            if ($upcoming > 0) {
                $response .= "\n🎭 {$upcoming} more exciting artists to be announced!\n";
            }
            
            $response .= "\nStay tuned to our social media for the latest announcements and performance schedules!";
        } else {
            $response = "🌟 Bintang Tamu UMN Festival 2025:\n\n";
            
            if ($revealed->isNotEmpty()) {
                $response .= "✅ Artis Terkonfirmasi:\n";
                foreach ($revealed as $star) {
                    $response .= "• {$star->name}\n";
                }
            }
            
            if ($upcoming > 0) {
                $response .= "\n🎭 {$upcoming} artis menarik lainnya akan diumumkan!\n";
            }
            
            $response .= "\nPantau terus media sosial kami untuk pengumuman terbaru dan jadwal pertunjukan!";
        }

        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, 'guest_stars', $sessionId),
            'category' => 'guest_stars'
        ];
    }

    private function getEnhancedTicketInfo($language, $sessionId = null)
    {
        $ticketTypes = Cache::remember('chatbot_ticket_types', 300, function () {
            return TicketType::orderBy('sort_order')->get();
        });

        if ($language === 'en') {
            $response = "🎫 UMN Festival 2025 Ticket Information:\n\n";
            
            foreach ($ticketTypes as $ticket) {
                $status = $ticket->is_available ? '✅ Available' : ($ticket->is_disabled ? '❌ Sold Out' : '⏳ Coming Soon');
                $price = $ticket->price ? 'IDR ' . number_format($ticket->price, 0, ',', '.') : 'Price TBA';
                
                $response .= "• **{$ticket->header}**: {$price} - {$status}\n";
            }
            
            $response .= "\n💡 Tips:\n";
            $response .= "• Early bird tickets offer the best value\n";
            $response .= "• Tickets are delivered instantly via email\n";
            $response .= "• Secure payment through Midtrans\n";
            $response .= "• Check for referral codes for discounts\n";
            $response .= "\nVisit our ticket page to purchase now!";
        } else {
            $response = "🎫 Informasi Tiket UMN Festival 2025:\n\n";
            
            foreach ($ticketTypes as $ticket) {
                $status = $ticket->is_available ? '✅ Tersedia' : ($ticket->is_disabled ? '❌ Sold Out' : '⏳ Segera Hadir');
                $price = $ticket->price ? 'IDR ' . number_format($ticket->price, 0, ',', '.') : 'Harga akan diumumkan';
                
                $response .= "• **{$ticket->header}**: {$price} - {$status}\n";
            }
            
            $response .= "\n💡 Tips:\n";
            $response .= "• Tiket early bird menawarkan nilai terbaik\n";
            $response .= "• Tiket dikirim langsung via email\n";
            $response .= "• Pembayaran aman melalui Midtrans\n";
            $response .= "• Cek kode referral untuk diskon\n";
            $response .= "\nKunjungi halaman tiket kami untuk membeli sekarang!";
        }

        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, 'tickets', $sessionId),
            'category' => 'tickets'
        ];
    }

    private function getEnhancedEventsInfo($language, $sessionId = null)
    {
        $events = Cache::remember('chatbot_events', 300, function () {
            return EventUpcomingDetail::where('is_locked', false)->orderBy('sort_order')->get();
        });

        $eventDescriptions = $this->comprehensiveKnowledge[$language]['events'];

        if ($language === 'en') {
            $response = "🎪 UMN Festival 2025 Events:\n\n";
            
            foreach ($events as $event) {
                $response .= "🎉 **{$event->title}**\n";
                if ($event->description) {
                    $response .= strip_tags($event->description) . "\n\n";
                }
            }
            
            $response .= "📅 More exciting events coming soon!\n";
            $response .= "🎯 Each event is designed to bring our community together\n";
            $response .= "🎊 Free participation in most activities\n";
            $response .= "\nVisit our events page for detailed schedules and registration!";
        } else {
            $response = "🎪 Acara UMN Festival 2025:\n\n";
            
            foreach ($events as $event) {
                $response .= "🎉 **{$event->title}**\n";
                if ($event->description) {
                    $response .= strip_tags($event->description) . "\n\n";
                }
            }
            
            $response .= "📅 Acara menarik lainnya segera hadir!\n";
            $response .= "🎯 Setiap acara dirancang untuk menyatukan komunitas kita\n";
            $response .= "🎊 Partisipasi gratis di sebagian besar aktivitas\n";
            $response .= "\nKunjungi halaman acara kami untuk jadwal detail dan pendaftaran!";
        }

        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, 'events', $sessionId),
            'category' => 'events'
        ];
    }

    private function getArchiveInfo($language, $sessionId = null)
    {
        $archives = Cache::remember('chatbot_archives', 300, function () {
            return ArchiveVideo::where('is_active', true)->orderBy('created_at', 'desc')->get();
        });

        if ($language === 'en') {
            $response = "📹 UMN Festival Archives:\n\n";
            $response .= "Relive the magic of previous UMN Festivals! Our archive section features:\n\n";
            $response .= "• Highlight videos from past festivals\n";
            $response .= "• Behind-the-scenes content\n";
            $response .= "• Artist performances and interviews\n";
            $response .= "• Community moments and celebrations\n\n";
            
            if ($archives->isNotEmpty()) {
                $response .= "📺 Available Videos: {$archives->count()} videos\n";
            }
            
            $response .= "\nVisit our archive section to explore the rich history of UMN Festival!";
        } else {
            $response = "📹 Arsip UMN Festival:\n\n";
            $response .= "Rasakan kembali keajaiban UMN Festival sebelumnya! Bagian arsip kami menampilkan:\n\n";
            $response .= "• Video highlight dari festival masa lalu\n";
            $response .= "• Konten behind-the-scenes\n";
            $response .= "• Pertunjukan artis dan wawancara\n";
            $response .= "• Momen komunitas dan perayaan\n\n";
            
            if ($archives->isNotEmpty()) {
                $response .= "📺 Video Tersedia: {$archives->count()} video\n";
            }
            
            $response .= "\nKunjungi bagian arsip kami untuk menjelajahi sejarah kaya UMN Festival!";
        }

        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, 'archive', $sessionId),
            'category' => 'archive'
        ];
    }

    private function getCountdownInfo($language, $sessionId = null)
    {
        $countdownEvents = Cache::remember('chatbot_countdown', 300, function () {
            return CountdownEvent::where('is_active', true)->orderBy('event_date')->get();
        });

        if ($language === 'en') {
            $response = "⏰ UMN Festival 2025 Schedule:\n\n";
            
            if ($countdownEvents->isNotEmpty()) {
                foreach ($countdownEvents as $event) {
                    $date = \Carbon\Carbon::parse($event->event_date);
                    $daysLeft = $date->diffInDays(now());
                    $response .= "📅 **{$event->title}**: {$date->format('F d, Y')}\n";
                    $response .= "⏳ {$daysLeft} days to go!\n\n";
                }
            } else {
                $response .= "Festival dates will be announced soon!\n\n";
            }
            
            $response .= "🎉 Mark your calendars and get ready for an amazing celebration!\n";
            $response .= "📱 Follow our social media for real-time updates!";
        } else {
            $response = "⏰ Jadwal UMN Festival 2025:\n\n";
            
            if ($countdownEvents->isNotEmpty()) {
                foreach ($countdownEvents as $event) {
                    $date = \Carbon\Carbon::parse($event->event_date);
                    $daysLeft = $date->diffInDays(now());
                    $response .= "📅 **{$event->title}**: {$date->format('d F Y')}\n";
                    $response .= "⏳ {$daysLeft} hari lagi!\n\n";
                }
            } else {
                $response .= "Tanggal festival akan segera diumumkan!\n\n";
            }
            
            $response .= "🎉 Tandai kalender Anda dan bersiaplah untuk perayaan yang luar biasa!\n";
            $response .= "📱 Ikuti media sosial kami untuk update real-time!";
        }

        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, 'schedule', $sessionId),
            'category' => 'schedule'
        ];
    }

    private function matchesKeywords($keywords, $searchTerms)
    {
        foreach ($keywords as $keyword) {
            if (in_array($keyword, $searchTerms)) {
                return true;
            }
        }
        return false;
    }

    private function generateContextualFallback($keywords, $language, $sessionId = null)
    {
        // Generate smart fallback based on detected keywords
        if (!empty($keywords)) {
            $detectedTopics = [];
            
            // Detect potential topics
            if ($this->matchesKeywords($keywords, ['ticket', 'tiket', 'price', 'harga'])) {
                $detectedTopics[] = $language === 'en' ? 'tickets' : 'tiket';
            }
            if ($this->matchesKeywords($keywords, ['event', 'acara', 'activity', 'kegiatan'])) {
                $detectedTopics[] = $language === 'en' ? 'events' : 'acara';
            }
            if ($this->matchesKeywords($keywords, ['guest', 'star', 'bintang', 'tamu'])) {
                $detectedTopics[] = $language === 'en' ? 'guest stars' : 'bintang tamu';
            }

            if (!empty($detectedTopics)) {
                if ($language === 'en') {
                    $response = "I noticed you're asking about " . implode(', ', $detectedTopics) . ". ";
                    $response .= "Could you be more specific? I can help you with detailed information about UMN Festival 2025!";
                } else {
                    $response = "Saya melihat Anda bertanya tentang " . implode(', ', $detectedTopics) . ". ";
                    $response .= "Bisakah Anda lebih spesifik? Saya bisa membantu dengan informasi detail tentang UMN Festival 2025!";
                }
                
                return [
                    'response' => $response,
                    'suggestions' => $this->getSuggestions($language, null, $sessionId),
                    'category' => 'contextual_fallback'
                ];
            }
        }

        // Default fallback
        $fallbacks = [
            'en' => [
                "I'm here to help with UMN Festival 2025 information! Try asking about tickets, events, guest stars, merchandise, or general festival details.",
                "I'd love to help you learn about UMN Festival 2025! What specific information are you looking for?",
                "Let me assist you with UMN Festival 2025! I can provide information about events, tickets, artists, and much more."
            ],
            'id' => [
                "Saya di sini untuk membantu dengan informasi UMN Festival 2025! Coba tanyakan tentang tiket, acara, bintang tamu, merchandise, atau detail festival secara umum.",
                "Saya senang membantu Anda belajar tentang UMN Festival 2025! Informasi spesifik apa yang Anda cari?",
                "Biarkan saya membantu Anda dengan UMN Festival 2025! Saya bisa memberikan informasi tentang acara, tiket, artis, dan banyak lagi."
            ]
        ];

        return [
            'response' => $this->getRandomResponse($fallbacks[$language]),
            'suggestions' => $this->getSuggestions($language, null, $sessionId),
            'category' => 'fallback'
        ];
    }

    private function handleGreeting($language, $sessionId, $message)
    {
        $response = $this->getRandomResponse($this->greetings[$language]);
        $this->logConversation($sessionId, $message, $response, $language, 'greeting');
        
        return [
            'response' => $response,
            'suggestions' => $this->getSuggestions($language, null, $sessionId),
            'category' => 'greeting'
        ];
    }

    private function generateErrorResponse($language, $sessionId = null)
    {
        $errorResponse = $language === 'en' 
            ? "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment!"
            : "Maaf, saya sedang mengalami kesulitan teknis. Silakan coba lagi sebentar!";
            
        return [
            'response' => $errorResponse,
            'suggestions' => $this->getSuggestions($language, null, $sessionId),
            'category' => 'error'
        ];
    }

    /**
     * ✅ GUARANTEED FAQ SYSTEM - NEVER RETURNS EMPTY!
     * Enhanced getSuggestions with contextual awareness that ALWAYS provides FAQ
     */
    public function getSuggestions($language, $context = null, $sessionId = null)
    {
        $finalSuggestions = [];

        try {
            // PRIORITY 1: Get contextual suggestions based on recent conversation
            if ($sessionId) {
                $contextualSuggestions = $this->getContextualSuggestions($sessionId, $language);
                if (!empty($contextualSuggestions) && count($contextualSuggestions) >= 4) {
                    $finalSuggestions = $contextualSuggestions;
                }
            }

            // PRIORITY 2: Get category-specific suggestions if context provided
            if (empty($finalSuggestions) && $context) {
                $categorySuggestions = $this->getRelatedSuggestions($context, $language, $sessionId);
                if (!empty($categorySuggestions) && count($categorySuggestions) >= 4) {
                    $finalSuggestions = $categorySuggestions;
                }
            }

            // PRIORITY 3: Enhanced general FAQ suggestions (GUARANTEED FALLBACK)
            if (empty($finalSuggestions)) {
                $finalSuggestions = $this->getGeneralSuggestions($language);
            }

            // ENSURE MINIMUM 4 SUGGESTIONS - NEVER EMPTY!
            if (count($finalSuggestions) < 4) {
                $backupSuggestions = $this->getBackupSuggestions($language);
                $finalSuggestions = array_merge($finalSuggestions, $backupSuggestions);
                $finalSuggestions = array_unique($finalSuggestions);
            }

            // ENSURE MAXIMUM 7 SUGGESTIONS
            if (count($finalSuggestions) > 7) {
                $finalSuggestions = array_slice($finalSuggestions, 0, 7);
            }

            // FINAL GUARANTEE: If still empty, force default suggestions
            if (empty($finalSuggestions)) {
                $finalSuggestions = $this->getGeneralSuggestions($language);
            }

        } catch (\Exception $e) {
            Log::error('FAQ Generation Error: ' . $e->getMessage());
            // Emergency fallback - NEVER let FAQ be empty!
            $finalSuggestions = $this->getGeneralSuggestions($language);
        }

        // ABSOLUTE GUARANTEE: Always return at least 4 suggestions, never empty!
        return array_values(array_slice($finalSuggestions, 0, 7));
    }

    /**
     * Get general suggestions - GUARANTEED to return 7 items
     */
    private function getGeneralSuggestions($language)
    {
        $suggestions = [
            'en' => [
                "What is UMN Festival 2025?",
                "Who are the guest stars performing?",
                "How much are the tickets and where to buy?",
                "What events and activities are happening?",
                "Where can I buy official merchandise?",
                "When is the festival and what's the schedule?",
                "Where is UMN located and how to get there?"
            ],
            'id' => [
                "Apa itu UMN Festival 2025?",
                "Siapa saja bintang tamu yang tampil?",
                "Berapa harga tiket dan dimana belinya?",
                "Acara dan kegiatan apa saja yang ada?",
                "Dimana bisa beli merchandise resmi?",
                "Kapan festival dan bagaimana jadwalnya?",
                "Dimana lokasi UMN dan cara kesana?"
            ]
        ];

        return $suggestions[$language] ?? $suggestions['en'];
    }

    /**
     * Get backup suggestions to ensure FAQ never disappears - GUARANTEED 15 items
     */
    private function getBackupSuggestions($language)
    {
        $backupSuggestions = [
            'en' => [
                "What is UMN Festival 2025?",
                "Who are the guest stars performing?",
                "How much are the tickets and where to buy?",
                "What events and activities are happening?",
                "Where can I buy official merchandise?",
                "When is the festival and what's the schedule?",
                "Where is UMN located and how to get there?",
                "What should I bring to the festival?",
                "Are outside food and drinks allowed?",
                "Is there parking available at the venue?",
                "What are the festival operating hours?",
                "Are there student discounts available?",
                "What payment methods do you accept?",
                "Can I get a refund if I can't attend?",
                "Is there WiFi available at the venue?"
            ],
            'id' => [
                "Apa itu UMN Festival 2025?",
                "Siapa saja bintang tamu yang tampil?",
                "Berapa harga tiket dan dimana belinya?",
                "Acara dan kegiatan apa saja yang ada?",
                "Dimana bisa beli merchandise resmi?",
                "Kapan festival dan bagaimana jadwalnya?",
                "Dimana lokasi UMN dan cara kesana?",
                "Apa yang harus dibawa ke festival?",
                "Apakah boleh bawa makanan dan minuman dari luar?",
                "Apakah ada tempat parkir di venue?",
                "Jam operasional festival berapa saja?",
                "Apakah ada diskon untuk mahasiswa?",
                "Metode pembayaran apa saja yang diterima?",
                "Bisakah refund jika tidak bisa hadir?",
                "Apakah ada WiFi di venue?"
            ]
        ];

        return $backupSuggestions[$language] ?? $backupSuggestions['en'];
    }

    /**
     * Get contextual suggestions based on user's conversation history
     */
    private function getContextualSuggestions($sessionId, $language)
    {
        try {
            // Get recent conversations from this session
            $recentConversations = ChatbotConversation::where('session_id', $sessionId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            if ($recentConversations->isEmpty()) {
                return [];
            }

            // Analyze conversation patterns
            $categories = $recentConversations->pluck('matched_category')->filter()->unique();
            $userMessages = $recentConversations->pluck('user_message')->implode(' ');
            
            // Extract keywords from recent conversations
            $keywords = $this->extractKeywords(strtolower($userMessages), $language);
            
            // Generate smart contextual suggestions
            return $this->generateSmartSuggestions($categories, $keywords, $language);

        } catch (\Exception $e) {
            Log::error('Failed to get contextual suggestions: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate smart suggestions based on conversation context
     */
    private function generateSmartSuggestions($categories, $keywords, $language)
    {
        $smartSuggestions = [];

        // Category-based suggestions
        foreach ($categories as $category) {
            $categorySuggestions = $this->getCategoryFollowUpSuggestions($category, $language);
            $smartSuggestions = array_merge($smartSuggestions, $categorySuggestions);
        }

        // Keyword-based suggestions
        $keywordSuggestions = $this->getKeywordBasedSuggestions($keywords, $language);
        $smartSuggestions = array_merge($smartSuggestions, $keywordSuggestions);

        // Remove duplicates and limit to 4-7 suggestions
        $smartSuggestions = array_unique($smartSuggestions);
        
        if (count($smartSuggestions) > 7) {
            $smartSuggestions = array_slice($smartSuggestions, 0, 7);
        } elseif (count($smartSuggestions) < 4) {
            // Fill with general suggestions if not enough contextual ones
            $generalSuggestions = $this->getGeneralSuggestions($language);
            $smartSuggestions = array_merge($smartSuggestions, array_slice($generalSuggestions, 0, 4 - count($smartSuggestions)));
        }

        return array_values($smartSuggestions);
    }

    /**
     * Get follow-up suggestions based on category
     */
    private function getCategoryFollowUpSuggestions($category, $language)
    {
        $followUpSuggestions = [
            'en' => [
                'tickets' => [
                    "Are there early bird discounts available?",
                    "What payment methods do you accept?",
                    "Can I get a refund if I can't attend?",
                    "Is there a group discount for bulk purchases?",
                    "How will I receive my tickets after payment?"
                ],
                'guest_stars' => [
                    "What time do the performances start?",
                    "Will there be meet and greet sessions?",
                    "Can I request songs from the artists?",
                    "Are there VIP packages for closer access?",
                    "Will performances be recorded or livestreamed?"
                ],
                'events' => [
                    "Do I need to register separately for events?",
                    "Are all events included with festival ticket?",
                    "What should I bring for specific activities?",
                    "Are there age restrictions for any events?",
                    "Can I participate in multiple events?"
                ],
                'merchandise' => [
                    "What sizes are available for clothing items?",
                    "Can I order merchandise online for delivery?",
                    "Are there limited edition items?",
                    "What's the quality of the merchandise?",
                    "Can I exchange items if they don't fit?"
                ],
                'location' => [
                    "Is there parking available at the venue?",
                    "What's the best way to get there by public transport?",
                    "Are there nearby hotels for out-of-town visitors?",
                    "Is the venue accessible for people with disabilities?",
                    "What facilities are available at the campus?"
                ],
                'general' => [
                    "What should I bring to the festival?",
                    "Are outside food and drinks allowed?",
                    "What are the festival operating hours?",
                    "Is there WiFi available at the venue?",
                    "What's the weather contingency plan?"
                ]
            ],
            'id' => [
                'tickets' => [
                    "Apakah ada diskon early bird?",
                    "Metode pembayaran apa saja yang diterima?",
                    "Bisakah refund jika tidak bisa hadir?",
                    "Apakah ada diskon grup untuk pembelian banyak?",
                    "Bagaimana cara menerima tiket setelah bayar?"
                ],
                'guest_stars' => [
                    "Jam berapa pertunjukan dimulai?",
                    "Apakah ada sesi meet and greet?",
                    "Bisakah request lagu ke artis?",
                    "Apakah ada paket VIP untuk akses lebih dekat?",
                    "Apakah pertunjukan akan direkam atau livestream?"
                ],
                'events' => [
                    "Apakah perlu daftar terpisah untuk acara?",
                    "Apakah semua acara termasuk dengan tiket festival?",
                    "Apa yang harus dibawa untuk aktivitas tertentu?",
                    "Apakah ada batasan usia untuk acara tertentu?",
                    "Bisakah ikut beberapa acara sekaligus?"
                ],
                'merchandise' => [
                    "Ukuran apa saja yang tersedia untuk pakaian?",
                    "Bisakah pesan merchandise online untuk dikirim?",
                    "Apakah ada item edisi terbatas?",
                    "Bagaimana kualitas merchandise-nya?",
                    "Bisakah tukar barang jika tidak pas?"
                ],
                'location' => [
                    "Apakah ada tempat parkir di venue?",
                    "Cara terbaik kesana dengan transportasi umum?",
                    "Apakah ada hotel terdekat untuk pengunjung luar kota?",
                    "Apakah venue dapat diakses penyandang disabilitas?",
                    "Fasilitas apa saja yang tersedia di kampus?"
                ],
                'general' => [
                    "Apa yang harus dibawa ke festival?",
                    "Apakah boleh bawa makanan dan minuman dari luar?",
                    "Jam operasional festival berapa saja?",
                    "Apakah ada WiFi di venue?",
                    "Bagaimana rencana jika cuaca buruk?"
                ]
            ]
        ];

        return $followUpSuggestions[$language][$category] ?? [];
    }

    /**
     * Get suggestions based on detected keywords
     */
    private function getKeywordBasedSuggestions($keywords, $language)
    {
        $keywordSuggestions = [];

        foreach ($keywords as $keyword) {
            $suggestions = $this->getKeywordSpecificSuggestions($keyword, $language);
            $keywordSuggestions = array_merge($keywordSuggestions, $suggestions);
        }

        return array_unique($keywordSuggestions);
    }

    /**
     * Get specific suggestions for individual keywords
     */
    private function getKeywordSpecificSuggestions($keyword, $language)
    {
        $keywordMap = [
            'en' => [
                'price' => [
                    "Are there student discounts available?",
                    "What's included in the ticket price?",
                    "Are there different pricing tiers?"
                ],
                'food' => [
                    "What food options are available at the venue?",
                    "Can I bring my own food and drinks?",
                    "Are there vegetarian/vegan options?"
                ],
                'parking' => [
                    "How much does parking cost?",
                    "Is parking free for festival attendees?",
                    "Are there alternative parking locations?"
                ],
                'schedule' => [
                    "What's the detailed event timeline?",
                    "When do gates open and close?",
                    "Are there breaks between performances?"
                ],
                'weather' => [
                    "What happens if it rains during the festival?",
                    "Is the venue indoor or outdoor?",
                    "Should I bring an umbrella or raincoat?"
                ],
                'security' => [
                    "What items are prohibited at the venue?",
                    "Is there bag checking at the entrance?",
                    "Are there security measures in place?"
                ],
                'accessibility' => [
                    "Is the venue wheelchair accessible?",
                    "Are there special accommodations available?",
                    "How can I request accessibility assistance?"
                ]
            ],
            'id' => [
                'harga' => [
                    "Apakah ada diskon untuk mahasiswa?",
                    "Apa saja yang termasuk dalam harga tiket?",
                    "Apakah ada tingkatan harga yang berbeda?"
                ],
                'makanan' => [
                    "Pilihan makanan apa saja yang tersedia di venue?",
                    "Bolehkah bawa makanan dan minuman sendiri?",
                    "Apakah ada pilihan vegetarian/vegan?"
                ],
                'parkir' => [
                    "Berapa biaya parkir?",
                    "Apakah parkir gratis untuk peserta festival?",
                    "Apakah ada lokasi parkir alternatif?"
                ],
                'jadwal' => [
                    "Bagaimana timeline detail acaranya?",
                    "Jam berapa gerbang buka dan tutup?",
                    "Apakah ada jeda antar pertunjukan?"
                ],
                'cuaca' => [
                    "Apa yang terjadi jika hujan saat festival?",
                    "Apakah venue indoor atau outdoor?",
                    "Haruskah bawa payung atau jas hujan?"
                ],
                'keamanan' => [
                    "Barang apa saja yang dilarang di venue?",
                    "Apakah ada pemeriksaan tas di pintu masuk?",
                    "Apakah ada langkah keamanan yang diterapkan?"
                ],
                'aksesibilitas' => [
                    "Apakah venue dapat diakses kursi roda?",
                    "Apakah ada akomodasi khusus yang tersedia?",
                    "Bagaimana cara meminta bantuan aksesibilitas?"
                ]
            ]
        ];

        return $keywordMap[$language][$keyword] ?? [];
    }

    private function getRelatedSuggestions($category, $language, $sessionId = null)
    {
        $suggestions = [
            'en' => [
                'guest_stars' => [
                    "When will more artists be announced?",
                    "What time do performances start?",
                    "Are there meet and greet sessions?",
                    "What genre of music will be performed?",
                    "Can I request songs from the artists?"
                ],
                'tickets' => [
                    "How do I buy tickets?",
                    "Are there student discounts?",
                    "Can I get a refund?",
                    "What payment methods are accepted?",
                    "When do tickets expire?"
                ],
                'events' => [
                    "What is E-Ulympic?",
                    "How do I join the events?",
                    "Are events free to attend?",
                    "What is the event schedule?",
                    "Do I need to register for events?"
                ],
                'merchandise' => [
                    "What merchandise is available?",
                    "How much does merchandise cost?",
                    "Can I buy merchandise online?",
                    "What sizes are available?",
                    "Is shipping available?"
                ],
                'general' => [
                    "Where is the venue?",
                    "What should I bring?",
                    "Is there parking available?",
                    "What are the festival hours?",
                    "Is food available at the venue?"
                ]
            ],
            'id' => [
                'guest_stars' => [
                    "Kapan artis lain akan diumumkan?",
                    "Jam berapa pertunjukan dimulai?",
                    "Apakah ada sesi meet and greet?",
                    "Genre musik apa yang akan dibawakan?",
                    "Bisakah request lagu ke artis?"
                ],
                'tickets' => [
                    "Bagaimana cara beli tiket?",
                    "Apakah ada diskon mahasiswa?",
                    "Bisakah saya refund?",
                    "Metode pembayaran apa yang diterima?",
                    "Kapan tiket expired?"
                ],
                'events' => [
                    "Apa itu E-Ulympic?",
                    "Bagaimana cara ikut acara?",
                    "Apakah acara gratis?",
                    "Bagaimana jadwal acaranya?",
                    "Apakah perlu daftar untuk acara?"
                ],
                'merchandise' => [
                    "Merchandise apa saja yang tersedia?",
                    "Berapa harga merchandise?",
                    "Bisakah beli merchandise online?",
                    "Ukuran apa saja yang tersedia?",
                    "Apakah ada pengiriman?"
                ],
                'general' => [
                    "Dimana lokasinya?",
                    "Apa yang harus dibawa?",
                    "Apakah ada tempat parkir?",
                    "Jam berapa festival buka?",
                    "Apakah ada makanan di venue?"
                ]
            ]
        ];

        return $suggestions[$language][$category] ?? $this->getGeneralSuggestions($language);
    }

    private function getRandomResponse($responses)
    {
        return $responses[array_rand($responses)];
    }

    private function logConversation($sessionId, $userMessage, $botResponse, $language, $category)
    {
        if ($sessionId) {
            try {
                ChatbotConversation::create([
                    'session_id' => $sessionId,
                    'user_message' => $userMessage,
                    'bot_response' => $botResponse,
                    'language' => $language,
                    'matched_category' => $category
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to log conversation: ' . $e->getMessage());
            }
        }
    }

    // Keep existing helper methods
    private function cleanMessage($message)
    {
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
        $festivalKeywords = ['umn', 'festival', '2025', 'unify', 'ticket', 'tiket', 'event', 'acara', 'guest', 'star', 'bintang', 'tamu', 'merchandise', 'merch'];
        foreach ($festivalKeywords as $keyword) {
            if (strpos($message, $keyword) !== false && !in_array($keyword, $keywords)) {
                $keywords[] = $keyword;
            }
        }

        return array_unique($keywords);
    }
}