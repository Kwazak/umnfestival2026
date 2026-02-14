<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotKnowledge;
use Illuminate\Support\Facades\DB;

class ChatbotKnowledgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ChatbotKnowledge::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $knowledge = [
            // General Information
            [
                'category' => 'general',
                'question_en' => 'What is UMN Festival 2025?',
                'question_id' => 'Apa itu UMN Festival 2025?',
                'answer_en' => 'UMN Festival 2025 is the biggest annual festival at Universitas Multimedia Nusantara with the theme "UNIFY 2025". It\'s a celebration that brings together students, alumni, and the community through various events, entertainment, and activities.',
                'answer_id' => 'UMN Festival 2025 adalah festival tahunan terbesar di Universitas Multimedia Nusantara dengan tema "UNIFY 2025". Ini adalah perayaan yang menyatukan mahasiswa, alumni, dan komunitas melalui berbagai acara, hiburan, dan aktivitas.',
                'keywords' => ['umn', 'festival', '2025', 'unify', 'university', 'universitas', 'multimedia', 'nusantara', 'annual', 'tahunan'],
                'priority' => 10
            ],
            [
                'category' => 'general',
                'question_en' => 'What is the theme of UMN Festival 2025?',
                'question_id' => 'Apa tema UMN Festival 2025?',
                'answer_en' => 'The theme of UMN Festival 2025 is "UNIFY 2025" - bringing together the entire UMN community and beyond in a celebration of unity, creativity, and collaboration.',
                'answer_id' => 'Tema UMN Festival 2025 adalah "UNIFY 2025" - menyatukan seluruh komunitas UMN dan sekitarnya dalam perayaan persatuan, kreativitas, dan kolaborasi.',
                'keywords' => ['theme', 'tema', 'unify', '2025', 'unity', 'persatuan'],
                'priority' => 8
            ],
            [
                'category' => 'location',
                'question_en' => 'Where is UMN Festival 2025 held?',
                'question_id' => 'Di mana UMN Festival 2025 diadakan?',
                'answer_en' => 'UMN Festival 2025 is held at Universitas Multimedia Nusantara campus in Serpong, Tangerang Selatan, Banten, Indonesia.',
                'answer_id' => 'UMN Festival 2025 diadakan di kampus Universitas Multimedia Nusantara di Serpong, Tangerang Selatan, Banten, Indonesia.',
                'keywords' => ['location', 'lokasi', 'where', 'dimana', 'campus', 'kampus', 'serpong', 'tangerang', 'banten'],
                'priority' => 9
            ],

            // Events Information
            [
                'category' => 'events',
                'question_en' => 'What is Unveiling 2025?',
                'question_id' => 'Apa itu Unveiling 2025?',
                'answer_en' => 'Unveiling 2025 is the opening ceremony of UMN Festival 2025. It serves to introduce the festival activities, increase UMN students\' awareness about the festival, and marks the official start of UMN Festival 2025.',
                'answer_id' => 'Unveiling 2025 adalah acara pembuka dari UMN Festival 2025. Berguna untuk memperkenalkan kegiatan UMN Festival, meningkatkan kesadaran mahasiswa/i UMN mengenai kegiatan UMN Festival dan menandakan bahwa kegiatan UMN Festival 2025 telah dimulai.',
                'keywords' => ['unveiling', '2025', 'opening', 'ceremony', 'pembuka', 'acara'],
                'priority' => 7
            ],
            [
                'category' => 'events',
                'question_en' => 'What is E-Ulympic 2025?',
                'question_id' => 'Apa itu E-Ulympic 2025?',
                'answer_en' => 'E-Ulympic 2025 is an e-sports competition that aims to expand and discover talents from UMN students as well as other students in e-sports competitions.',
                'answer_id' => 'E-Ulympic 2025 merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat dari mahasiswa/i UMN maupun mahasiswa dan siswa lainnya dalam perlombaan cabang olahraga E-Sports.',
                'keywords' => ['eulympic', 'e-ulympic', 'esports', 'e-sports', 'competition', 'kompetisi', 'gaming', 'tournament'],
                'priority' => 7
            ],
            [
                'category' => 'events',
                'question_en' => 'What is U-Care 2025?',
                'question_id' => 'Apa itu U-Care 2025?',
                'answer_en' => 'U-Care 2025 is a community service event that focuses on social responsibility and giving back to the community as part of UMN Festival 2025.',
                'answer_id' => 'U-Care 2025 adalah acara pengabdian masyarakat yang fokus pada tanggung jawab sosial dan memberikan kembali kepada masyarakat sebagai bagian dari UMN Festival 2025.',
                'keywords' => ['ucare', 'u-care', 'community', 'service', 'social', 'masyarakat', 'pengabdian'],
                'priority' => 7
            ],

            // Tickets Information
            [
                'category' => 'tickets',
                'question_en' => 'How can I buy tickets for UMN Festival 2025?',
                'question_id' => 'Bagaimana cara membeli tiket UMN Festival 2025?',
                'answer_en' => 'You can buy tickets through our official website at the ticket page. We accept various payment methods through Midtrans for your convenience.',
                'answer_id' => 'Anda dapat membeli tiket melalui website resmi kami di halaman tiket. Kami menerima berbagai metode pembayaran melalui Midtrans untuk kemudahan Anda.',
                'keywords' => ['buy', 'purchase', 'ticket', 'tiket', 'beli', 'payment', 'pembayaran', 'midtrans'],
                'priority' => 9
            ],
            [
                'category' => 'tickets',
                'question_en' => 'What ticket types are available?',
                'question_id' => 'Jenis tiket apa saja yang tersedia?',
                'answer_en' => 'We offer several ticket types: Early Bird (sold out), Pre-Sales 1 (sold out), Pre-Sales 2 (currently available), Regular (coming soon), and more to be announced.',
                'answer_id' => 'Kami menawarkan beberapa jenis tiket: Early Bird (sold out), Pre-Sales 1 (sold out), Pre-Sales 2 (tersedia saat ini), Regular (segera hadir), dan lainnya akan diumumkan.',
                'keywords' => ['ticket', 'types', 'tiket', 'jenis', 'early', 'bird', 'pre-sales', 'regular'],
                'priority' => 8
            ],

            // Guest Stars
            [
                'category' => 'guest_stars',
                'question_en' => 'Who are the guest stars for UMN Festival 2025?',
                'question_id' => 'Siapa bintang tamu UMN Festival 2025?',
                'answer_en' => 'Reality Club has been confirmed as one of our guest stars! More exciting artists will be announced soon. Stay tuned to our social media for updates.',
                'answer_id' => 'Reality Club telah dikonfirmasi sebagai salah satu bintang tamu kami! Artis menarik lainnya akan segera diumumkan. Pantau terus media sosial kami untuk update.',
                'keywords' => ['guest', 'star', 'artist', 'performer', 'bintang', 'tamu', 'artis', 'penampil', 'reality', 'club'],
                'priority' => 9
            ],

            // Merchandise
            [
                'category' => 'merchandise',
                'question_en' => 'What merchandise is available for UMN Festival 2025?',
                'question_id' => 'Merchandise apa saja yang tersedia untuk UMN Festival 2025?',
                'answer_en' => 'We have an official merchandise line including lanyards, keychains, hand fans, and more! Check our merchandise page for the complete collection and pricing.',
                'answer_id' => 'Kami memiliki lini merchandise resmi termasuk lanyard, gantungan kunci, kipas tangan, dan lainnya! Cek halaman merchandise kami untuk koleksi lengkap dan harga.',
                'keywords' => ['merchandise', 'merch', 'lanyard', 'keychain', 'fan', 'official', 'resmi'],
                'priority' => 6
            ],

            // Contact & Support
            [
                'category' => 'contact',
                'question_en' => 'How can I contact the organizers?',
                'question_id' => 'Bagaimana cara menghubungi penyelenggara?',
                'answer_en' => 'You can reach us through our official social media channels or visit our website for more contact information. We\'re here to help!',
                'answer_id' => 'Anda dapat menghubungi kami melalui media sosial resmi kami atau kunjungi website kami untuk informasi kontak lebih lanjut. Kami siap membantu!',
                'keywords' => ['contact', 'organizer', 'help', 'support', 'kontak', 'penyelenggara', 'bantuan'],
                'priority' => 5
            ],

            // FAQ
            [
                'category' => 'faq',
                'question_en' => 'Is there an age limit for the festival?',
                'question_id' => 'Apakah ada batasan usia untuk festival?',
                'answer_en' => 'UMN Festival 2025 is open to all ages! However, some specific events might have age recommendations. Check individual event details for more information.',
                'answer_id' => 'UMN Festival 2025 terbuka untuk semua usia! Namun, beberapa acara khusus mungkin memiliki rekomendasi usia. Cek detail acara individual untuk informasi lebih lanjut.',
                'keywords' => ['age', 'limit', 'usia', 'batasan', 'all', 'ages', 'semua'],
                'priority' => 4
            ],
            [
                'category' => 'faq',
                'question_en' => 'Can I get a refund for my ticket?',
                'question_id' => 'Bisakah saya mendapatkan refund untuk tiket saya?',
                'answer_en' => 'Ticket refund policies depend on specific circumstances. Please contact our support team for assistance with refund requests.',
                'answer_id' => 'Kebijakan refund tiket tergantung pada keadaan khusus. Silakan hubungi tim support kami untuk bantuan dengan permintaan refund.',
                'keywords' => ['refund', 'return', 'ticket', 'policy', 'tiket', 'kebijakan'],
                'priority' => 6
            ],

            // Safety & Guidelines
            [
                'category' => 'safety',
                'question_en' => 'What are the safety protocols for the festival?',
                'question_id' => 'Apa protokol keamanan untuk festival?',
                'answer_en' => 'We prioritize the safety of all attendees. Security measures, health protocols, and emergency procedures will be in place throughout the festival.',
                'answer_id' => 'Kami mengutamakan keamanan semua peserta. Langkah-langkah keamanan, protokol kesehatan, dan prosedur darurat akan diterapkan selama festival.',
                'keywords' => ['safety', 'security', 'protocol', 'health', 'keamanan', 'protokol', 'kesehatan'],
                'priority' => 7
            ]
        ];

        foreach ($knowledge as $item) {
            ChatbotKnowledge::create($item);
        }

        $this->command->info('✅ Chatbot knowledge base seeded successfully with ' . count($knowledge) . ' entries.');
    }
}