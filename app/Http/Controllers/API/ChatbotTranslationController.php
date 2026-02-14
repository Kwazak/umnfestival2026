<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotTranslationController extends Controller
{
    /**
     * Translate English text to Indonesian using AI
     */
    public function translate(Request $request)
    {
        try {
            $request->validate([
                'question_en' => 'required|string',
                'answer_en' => 'required|string'
            ]);

            $questionEn = $request->input('question_en');
            $answerEn = $request->input('answer_en');

            // Use enhanced translation system
            $questionId = $this->translateText($questionEn);
            $answerId = $this->translateText($answerEn);

            return response()->json([
                'success' => true,
                'data' => [
                    'question_id' => $questionId,
                    'answer_id' => $answerId
                ],
                'message' => 'Translation completed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Translation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Translation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ ENHANCED: Multi-service translation with better fallback
     */
    private function translateText($text)
    {
        try {
            // Method 1: Use Google Translate API (if available) - Most Accurate
            if (config('services.google_translate.key')) {
                $result = $this->translateWithGoogle($text);
                if ($result && strlen($result) > 2) {
                    return $this->cleanTranslation($result);
                }
            }
            
            // Method 2: Use OpenAI API (if available) - High Quality
            if (config('services.openai.key')) {
                $result = $this->translateWithOpenAI($text);
                if ($result && strlen($result) > 2) {
                    return $this->cleanTranslation($result);
                }
            }
            
            // Method 3: Use enhanced intelligent translation as fallback
            return $this->translateWithIntelligentSystem($text);
            
        } catch (\Exception $e) {
            Log::warning('Translation service failed, using intelligent fallback: ' . $e->getMessage());
            return $this->translateWithIntelligentSystem($text);
        }
    }

    /**
     * Translate using Google Translate API
     */
    private function translateWithGoogle($text)
    {
        try {
            $apiKey = config('services.google_translate.key');
            
            $response = Http::timeout(10)->get('https://translation.googleapis.com/language/translate/v2', [
                'key' => $apiKey,
                'q' => $text,
                'source' => 'en',
                'target' => 'id',
                'format' => 'text'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['data']['translations'][0]['translatedText'];
            }

            throw new \Exception('Google Translate API failed');
        } catch (\Exception $e) {
            Log::warning('Google Translate failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * ✅ ENHANCED: Translate using OpenAI API with better prompts
     */
    private function translateWithOpenAI($text)
    {
        try {
            $apiKey = config('services.openai.key');
            
            $response = Http::timeout(15)->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional Indonesian translator specializing in university events and festivals. Translate the following English text to natural, conversational Indonesian that sounds native. Rules:
1. Maintain the original meaning and context
2. Use natural Indonesian sentence structure
3. Keep proper nouns like "UMN Festival 2025" unchanged
4. Use appropriate Indonesian terms for university/festival context
5. Make it sound conversational and friendly
6. Only return the translated text, nothing else
7. Do not add any prefixes, suffixes, or explanations'
                    ],
                    [
                        'role' => 'user',
                        'content' => $text
                    ]
                ],
                'max_tokens' => 1000,
                'temperature' => 0.2
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return trim($data['choices'][0]['message']['content']);
            }

            throw new \Exception('OpenAI API failed');
        } catch (\Exception $e) {
            Log::warning('OpenAI Translate failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * ✅ NEW: Intelligent translation system with advanced pattern recognition
     */
    private function translateWithIntelligentSystem($text)
    {
        $text = trim($text);
        
        // Step 1: Check for complete sentence patterns
        $exactTranslation = $this->getExactTranslation($text);
        if ($exactTranslation) {
            return $exactTranslation;
        }
        
        // Step 2: Use advanced phrase-based translation
        $phraseTranslation = $this->translateWithAdvancedPhrases($text);
        if ($this->isGoodTranslation($text, $phraseTranslation)) {
            return $phraseTranslation;
        }
        
        // Step 3: Use intelligent sentence reconstruction
        return $this->reconstructIndonesianSentence($text);
    }

    /**
     * ✅ NEW: Get exact translations for common knowledge entry patterns
     */
    private function getExactTranslation($text)
    {
        $patterns = [
            // Festival Information
            '/^what is umn festival( 2025)?(\?)?$/i' => 'Apa itu UMN Festival 2025?',
            '/^umn festival( 2025)? is (.+)$/i' => 'UMN Festival 2025 adalah $2',
            '/^the umn festival( 2025)? is (.+)$/i' => 'UMN Festival 2025 adalah $2',
            
            // Guest Stars
            '/^who are the guest stars(\?)?$/i' => 'Siapa saja bintang tamu yang tampil?',
            '/^the guest stars are (.+)$/i' => 'Bintang tamu yang tampil adalah $1',
            '/^guest stars include (.+)$/i' => 'Bintang tamu termasuk $1',
            '/^(.+) will be performing$/i' => '$1 akan tampil',
            '/^(.+) is performing$/i' => '$1 akan tampil',
            
            // Tickets
            '/^how much are the tickets(\?)?$/i' => 'Berapa harga tiketnya?',
            '/^what is the ticket price(\?)?$/i' => 'Berapa harga tiketnya?',
            '/^tickets cost (.+)$/i' => 'Tiket seharga $1',
            '/^the ticket price is (.+)$/i' => 'Harga tiket adalah $1',
            '/^you can buy tickets (.+)$/i' => 'Anda bisa membeli tiket $1',
            
            // Location and Time
            '/^when is the festival(\?)?$/i' => 'Kapan festivalnya?',
            '/^where is the festival(\?)?$/i' => 'Dimana festivalnya?',
            '/^the festival is on (.+)$/i' => 'Festival ini pada $1',
            '/^the festival will be held (.+)$/i' => 'Festival akan diadakan $1',
            '/^it will be held at (.+)$/i' => 'Akan diadakan di $1',
            
            // Activities
            '/^what activities are available(\?)?$/i' => 'Kegiatan apa saja yang tersedia?',
            '/^what can visitors do(\?)?$/i' => 'Apa yang bisa dilakukan pengunjung?',
            '/^activities include (.+)$/i' => 'Kegiatan termasuk $1',
            '/^visitors can (.+)$/i' => 'Pengunjung bisa $1',
            
            // Merchandise
            '/^where can i buy merchandise(\?)?$/i' => 'Dimana saya bisa beli merchandise?',
            '/^official merchandise is available (.+)$/i' => 'Merchandise resmi tersedia $1',
            '/^you can buy merchandise (.+)$/i' => 'Anda bisa membeli merchandise $1',
            
            // Contact and Support
            '/^how can i contact (.+)(\?)?$/i' => 'Bagaimana cara menghubungi $1?',
            '/^for more information (.+)$/i' => 'Untuk informasi lebih lanjut $1',
            '/^contact us (.+)$/i' => 'Hubungi kami $1',
        ];
        
        foreach ($patterns as $pattern => $translation) {
            if (preg_match($pattern, $text, $matches)) {
                // Replace placeholders with captured groups
                $result = $translation;
                for ($i = 1; $i < count($matches); $i++) {
                    $result = str_replace('$' . $i, $this->translatePhrase($matches[$i]), $result);
                }
                return $result;
            }
        }
        
        return null;
    }

    /**
     * ✅ NEW: Advanced phrase-based translation with context awareness
     */
    private function translateWithAdvancedPhrases($text)
    {
        $translatedText = $text;
        
        // Advanced phrase patterns with context
        $advancedPhrases = [
            // Question starters
            'what is the' => 'apa itu',
            'what are the' => 'apa saja',
            'what is' => 'apa itu',
            'what are' => 'apa saja',
            'when is the' => 'kapan',
            'when are the' => 'kapan',
            'where is the' => 'dimana',
            'where are the' => 'dimana',
            'how much is the' => 'berapa harga',
            'how much are the' => 'berapa harga',
            'how can i' => 'bagaimana cara saya',
            'how do i' => 'bagaimana cara saya',
            'who are the' => 'siapa saja',
            'who is the' => 'siapa',
            
            // Festival specific phrases
            'umn festival 2025' => 'UMN Festival 2025',
            'umn festival' => 'UMN Festival',
            'the festival' => 'festival ini',
            'this festival' => 'festival ini',
            'guest stars' => 'bintang tamu',
            'guest star' => 'bintang tamu',
            'performing artists' => 'artis yang tampil',
            'main stage' => 'panggung utama',
            'side stage' => 'panggung samping',
            
            // Ticket related
            'ticket price' => 'harga tiket',
            'ticket prices' => 'harga tiket',
            'early bird ticket' => 'tiket early bird',
            'regular ticket' => 'tiket reguler',
            'student discount' => 'diskon mahasiswa',
            'group discount' => 'diskon grup',
            'buy tickets' => 'beli tiket',
            'purchase tickets' => 'beli tiket',
            'ticket sales' => 'penjualan tiket',
            'online booking' => 'pemesanan online',
            
            // Location and venue
            'campus area' => 'area kampus',
            'main hall' => 'aula utama',
            'outdoor stage' => 'panggung outdoor',
            'parking area' => 'area parkir',
            'food court' => 'food court',
            'merchandise booth' => 'booth merchandise',
            
            // Time and schedule
            'opening ceremony' => 'upacara pembukaan',
            'closing ceremony' => 'upacara penutupan',
            'main event' => 'acara utama',
            'side events' => 'acara sampingan',
            'time schedule' => 'jadwal waktu',
            'event schedule' => 'jadwal acara',
            
            // Activities
            'live performance' => 'pertunjukan langsung',
            'music performance' => 'pertunjukan musik',
            'dance performance' => 'pertunjukan tari',
            'art exhibition' => 'pameran seni',
            'food festival' => 'festival makanan',
            'games and competitions' => 'permainan dan kompetisi',
            'photo booth' => 'photo booth',
            'meet and greet' => 'meet and greet',
            
            // Services and facilities
            'customer service' => 'layanan pelanggan',
            'information desk' => 'meja informasi',
            'lost and found' => 'barang hilang',
            'first aid' => 'pertolongan pertama',
            'security service' => 'layanan keamanan',
            'shuttle service' => 'layanan shuttle',
            
            // Common phrases
            'more information' => 'informasi lebih lanjut',
            'for details' => 'untuk detail',
            'please visit' => 'silakan kunjungi',
            'please contact' => 'silakan hubungi',
            'available at' => 'tersedia di',
            'you can find' => 'anda bisa temukan',
            'feel free to' => 'jangan ragu untuk',
            'don\'t hesitate to' => 'jangan ragu untuk',
        ];
        
        // Apply advanced phrase translations
        foreach ($advancedPhrases as $english => $indonesian) {
            $translatedText = str_ireplace($english, $indonesian, $translatedText);
        }
        
        // Apply word-level translations for remaining words
        $translatedText = $this->applyWordTranslations($translatedText);
        
        // Clean up the result
        return $this->cleanTranslation($translatedText);
    }

    /**
     * ✅ NEW: Apply word-level translations with better context handling
     */
    private function applyWordTranslations($text)
    {
        $wordTranslations = [
            // Remove unnecessary articles
            ' the ' => ' ',
            ' a ' => ' ',
            ' an ' => ' ',
            
            // Basic connectors
            ' and ' => ' dan ',
            ' or ' => ' atau ',
            ' but ' => ' tapi ',
            ' with ' => ' dengan ',
            ' for ' => ' untuk ',
            ' to ' => ' ke ',
            ' from ' => ' dari ',
            ' in ' => ' di ',
            ' on ' => ' pada ',
            ' at ' => ' di ',
            ' by ' => ' oleh ',
            ' about ' => ' tentang ',
            ' during ' => ' selama ',
            ' after ' => ' setelah ',
            ' before ' => ' sebelum ',
            
            // Festival terms
            ' festival ' => ' festival ',
            ' event ' => ' acara ',
            ' events ' => ' acara-acara ',
            ' activity ' => ' kegiatan ',
            ' activities ' => ' kegiatan ',
            ' performance ' => ' pertunjukan ',
            ' performances ' => ' pertunjukan ',
            ' show ' => ' pertunjukan ',
            ' concert ' => ' konser ',
            ' music ' => ' musik ',
            ' artist ' => ' artis ',
            ' artists ' => ' artis ',
            ' performer ' => ' penampil ',
            ' performers ' => ' penampil ',
            ' singer ' => ' penyanyi ',
            ' band ' => ' band ',
            
            // Places
            ' location ' => ' lokasi ',
            ' venue ' => ' tempat ',
            ' place ' => ' tempat ',
            ' campus ' => ' kampus ',
            ' university ' => ' universitas ',
            ' stage ' => ' panggung ',
            ' hall ' => ' aula ',
            ' building ' => ' gedung ',
            ' area ' => ' area ',
            ' room ' => ' ruangan ',
            
            // Time
            ' time ' => ' waktu ',
            ' date ' => ' tanggal ',
            ' day ' => ' hari ',
            ' days ' => ' hari ',
            ' hour ' => ' jam ',
            ' hours ' => ' jam ',
            ' minute ' => ' menit ',
            ' minutes ' => ' menit ',
            ' schedule ' => ' jadwal ',
            ' start ' => ' mulai ',
            ' end ' => ' selesai ',
            ' begin ' => ' mulai ',
            ' finish ' => ' selesai ',
            
            // Actions
            ' buy ' => ' beli ',
            ' purchase ' => ' beli ',
            ' get ' => ' dapatkan ',
            ' find ' => ' temukan ',
            ' search ' => ' cari ',
            ' visit ' => ' kunjungi ',
            ' go ' => ' pergi ',
            ' come ' => ' datang ',
            ' join ' => ' ikut ',
            ' participate ' => ' berpartisipasi ',
            ' register ' => ' daftar ',
            ' book ' => ' pesan ',
            ' reserve ' => ' pesan ',
            ' contact ' => ' hubungi ',
            
            // Things
            ' ticket ' => ' tiket ',
            ' tickets ' => ' tiket ',
            ' merchandise ' => ' merchandise ',
            ' product ' => ' produk ',
            ' products ' => ' produk ',
            ' item ' => ' barang ',
            ' items ' => ' barang ',
            ' price ' => ' harga ',
            ' cost ' => ' biaya ',
            ' payment ' => ' pembayaran ',
            ' discount ' => ' diskon ',
            ' information ' => ' informasi ',
            ' details ' => ' detail ',
            ' help ' => ' bantuan ',
            ' support ' => ' dukungan ',
            ' service ' => ' layanan ',
            
            // People
            ' student ' => ' mahasiswa ',
            ' students ' => ' mahasiswa ',
            ' visitor ' => ' pengunjung ',
            ' visitors ' => ' pengunjung ',
            ' guest ' => ' tamu ',
            ' guests ' => ' tamu ',
            ' people ' => ' orang-orang ',
            ' person ' => ' orang ',
            
            // Adjectives
            ' available ' => ' tersedia ',
            ' free ' => ' gratis ',
            ' open ' => ' buka ',
            ' closed ' => ' tutup ',
            ' new ' => ' baru ',
            ' old ' => ' lama ',
            ' good ' => ' baik ',
            ' great ' => ' bagus ',
            ' amazing ' => ' luar biasa ',
            ' special ' => ' khusus ',
            ' official ' => ' resmi ',
            ' main ' => ' utama ',
            ' important ' => ' penting ',
            
            // Common words
            ' yes ' => ' ya ',
            ' no ' => ' tidak ',
            ' please ' => ' tolong ',
            ' thank ' => ' terima kasih ',
            ' welcome ' => ' selamat datang ',
            ' hello ' => ' halo ',
            ' sorry ' => ' maaf ',
        ];
        
        foreach ($wordTranslations as $english => $indonesian) {
            $text = str_ireplace($english, $indonesian, $text);
        }
        
        return $text;
    }

    /**
     * ✅ NEW: Reconstruct Indonesian sentence with proper grammar
     */
    private function reconstructIndonesianSentence($text)
    {
        $lowerText = strtolower(trim($text));
        
        // Handle different sentence types
        if (str_ends_with($text, '?')) {
            return $this->reconstructQuestion($text);
        } else {
            return $this->reconstructStatement($text);
        }
    }

    /**
     * ✅ NEW: Reconstruct questions with proper Indonesian structure
     */
    private function reconstructQuestion($text)
    {
        $lowerText = strtolower($text);
        
        // Question word patterns
        if (preg_match('/^what\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            if (strpos($lowerText, 'what is') === 0) {
                return "Apa itu {$content}?";
            } else {
                return "Apa {$content}?";
            }
        }
        
        if (preg_match('/^when\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            return "Kapan {$content}?";
        }
        
        if (preg_match('/^where\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            return "Dimana {$content}?";
        }
        
        if (preg_match('/^who\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            return "Siapa {$content}?";
        }
        
        if (preg_match('/^how\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            if (strpos($lowerText, 'how much') === 0) {
                return "Berapa harga {$content}?";
            } else {
                return "Bagaimana {$content}?";
            }
        }
        
        if (preg_match('/^why\s+(.+)\?$/i', $text, $matches)) {
            $content = $this->translatePhrase($matches[1]);
            return "Mengapa {$content}?";
        }
        
        // Fallback for other questions
        return $this->translatePhrase($text);
    }

    /**
     * ✅ NEW: Reconstruct statements with proper Indonesian structure
     */
    private function reconstructStatement($text)
    {
        // Handle "is/are" statements
        if (preg_match('/^(.+)\s+is\s+(.+)$/i', $text, $matches)) {
            $subject = $this->translatePhrase($matches[1]);
            $predicate = $this->translatePhrase($matches[2]);
            return "{$subject} adalah {$predicate}";
        }
        
        if (preg_match('/^(.+)\s+are\s+(.+)$/i', $text, $matches)) {
            $subject = $this->translatePhrase($matches[1]);
            $predicate = $this->translatePhrase($matches[2]);
            return "{$subject} adalah {$predicate}";
        }
        
        // Handle "will be" statements
        if (preg_match('/^(.+)\s+will\s+be\s+(.+)$/i', $text, $matches)) {
            $subject = $this->translatePhrase($matches[1]);
            $predicate = $this->translatePhrase($matches[2]);
            return "{$subject} akan {$predicate}";
        }
        
        // Handle "can" statements
        if (preg_match('/^(.+)\s+can\s+(.+)$/i', $text, $matches)) {
            $subject = $this->translatePhrase($matches[1]);
            $action = $this->translatePhrase($matches[2]);
            return "{$subject} bisa {$action}";
        }
        
        // Fallback for other statements
        return $this->translatePhrase($text);
    }

    /**
     * ✅ NEW: Translate individual phrases with context
     */
    private function translatePhrase($phrase)
    {
        $phrase = trim($phrase);
        
        // Apply phrase-level translations first
        $phraseTranslations = [
            'umn festival 2025' => 'UMN Festival 2025',
            'umn festival' => 'UMN Festival',
            'guest stars' => 'bintang tamu',
            'official merchandise' => 'merchandise resmi',
            'student discount' => 'diskon mahasiswa',
            'ticket price' => 'harga tiket',
            'main stage' => 'panggung utama',
            'food court' => 'food court',
            'parking area' => 'area parkir',
        ];
        
        foreach ($phraseTranslations as $english => $indonesian) {
            if (strcasecmp($phrase, $english) === 0) {
                return $indonesian;
            }
        }
        
        // Apply word-level translation
        return $this->applyWordTranslations(" {$phrase} ");
    }

    /**
     * ✅ NEW: Check if translation is good quality
     */
    private function isGoodTranslation($original, $translated)
    {
        // Check if translation actually changed the text meaningfully
        $similarity = $this->calculateSimilarity($original, $translated);
        
        // Good translation should change at least 30% of the text
        return $similarity < 0.7 && strlen($translated) > 3;
    }

    /**
     * ✅ NEW: Clean and polish the translation result
     */
    private function cleanTranslation($text)
    {
        // Remove extra spaces
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Remove leading/trailing spaces
        $text = trim($text);
        
        // Fix common issues
        $text = str_replace([' ,', ' .', ' ?', ' !'], [',', '.', '?', '!'], $text);
        
        // Capitalize first letter
        $text = ucfirst($text);
        
        // Remove any remaining unwanted prefixes
        $text = preg_replace('/^\[.*?\]\s*/', '', $text);
        
        return $text;
    }

    /**
     * Calculate similarity between two strings
     */
    private function calculateSimilarity($str1, $str2)
    {
        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen === 0) return 1;
        
        return similar_text(strtolower($str1), strtolower($str2)) / $maxLen;
    }
}