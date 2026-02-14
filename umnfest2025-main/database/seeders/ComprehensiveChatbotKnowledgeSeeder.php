<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotKnowledge;
use Illuminate\Support\Facades\DB;

class ComprehensiveChatbotKnowledgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ChatbotKnowledge::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $comprehensiveKnowledge = [
            // GENERAL FESTIVAL INFORMATION
            [
                'category' => 'general',
                'question_en' => 'What is UMN Festival 2025?',
                'question_id' => 'Apa itu UMN Festival 2025?',
                'answer_en' => 'UMN Festival 2025 is the biggest annual festival at Universitas Multimedia Nusantara with the theme "UNIFY 2025". It\'s a celebration that brings together students, alumni, and the community through various events, entertainment, and activities. This year\'s theme emphasizes unity, creativity, and collaboration within the UMN community.',
                'answer_id' => 'UMN Festival 2025 adalah festival tahunan terbesar di Universitas Multimedia Nusantara dengan tema "UNIFY 2025". Ini adalah perayaan yang menyatukan mahasiswa, alumni, dan komunitas melalui berbagai acara, hiburan, dan aktivitas. Tema tahun ini menekankan persatuan, kreativitas, dan kolaborasi dalam komunitas UMN.',
                'keywords' => ['umn', 'festival', '2025', 'unify', 'university', 'universitas', 'multimedia', 'nusantara', 'annual', 'tahunan', 'biggest', 'terbesar'],
                'priority' => 10
            ],
            [
                'category' => 'general',
                'question_en' => 'What is the theme of UMN Festival 2025?',
                'question_id' => 'Apa tema UMN Festival 2025?',
                'answer_en' => 'The theme of UMN Festival 2025 is "UNIFY 2025" - bringing together the entire UMN community and beyond in a celebration of unity, creativity, and collaboration. This theme represents our commitment to connecting people through shared experiences and memorable moments.',
                'answer_id' => 'Tema UMN Festival 2025 adalah "UNIFY 2025" - menyatukan seluruh komunitas UMN dan sekitarnya dalam perayaan persatuan, kreativitas, dan kolaborasi. Tema ini mewakili komitmen kami untuk menghubungkan orang melalui pengalaman bersama dan momen berkesan.',
                'keywords' => ['theme', 'tema', 'unify', '2025', 'unity', 'persatuan', 'collaboration', 'kolaborasi'],
                'priority' => 9
            ],

            // LOCATION AND VENUE
            [
                'category' => 'location',
                'question_en' => 'Where is UMN Festival 2025 held?',
                'question_id' => 'Di mana UMN Festival 2025 diadakan?',
                'answer_en' => 'UMN Festival 2025 is held at Universitas Multimedia Nusantara campus in Serpong, Tangerang Selatan, Banten, Indonesia. The campus features modern facilities and ample space for all festival activities. It\'s easily accessible by public transportation and private vehicles.',
                'answer_id' => 'UMN Festival 2025 diadakan di kampus Universitas Multimedia Nusantara di Serpong, Tangerang Selatan, Banten, Indonesia. Kampus ini memiliki fasilitas modern dan ruang yang luas untuk semua aktivitas festival. Mudah diakses dengan transportasi umum dan kendaraan pribadi.',
                'keywords' => ['location', 'lokasi', 'where', 'dimana', 'campus', 'kampus', 'serpong', 'tangerang', 'banten', 'venue', 'tempat'],
                'priority' => 9
            ],
            [
                'category' => 'location',
                'question_en' => 'How do I get to UMN campus?',
                'question_id' => 'Bagaimana cara ke kampus UMN?',
                'answer_en' => 'UMN campus is located in Serpong, Tangerang Selatan. You can reach it by: 1) Public transport: Take KRL to Serpong station, then use angkot or online transport, 2) Private vehicle: Use GPS navigation to "Universitas Multimedia Nusantara", 3) Online transport: Available from Jakarta and surrounding areas. Parking is available on campus.',
                'answer_id' => 'Kampus UMN berlokasi di Serpong, Tangerang Selatan. Anda bisa mencapainya dengan: 1) Transportasi umum: Naik KRL ke stasiun Serpong, lalu gunakan angkot atau transport online, 2) Kendaraan pribadi: Gunakan navigasi GPS ke "Universitas Multimedia Nusantara", 3) Transport online: Tersedia dari Jakarta dan sekitarnya. Parkir tersedia di kampus.',
                'keywords' => ['direction', 'transport', 'how', 'get', 'reach', 'arah', 'transportasi', 'cara', 'sampai', 'krl', 'serpong'],
                'priority' => 8
            ],

            // EVENTS DETAILED INFORMATION
            [
                'category' => 'events',
                'question_en' => 'What is Unveiling 2025?',
                'question_id' => 'Apa itu Unveiling 2025?',
                'answer_en' => 'Unveiling 2025 is the grand opening ceremony of UMN Festival 2025. It serves to introduce all festival activities, increase awareness among UMN students about the festival, and officially marks the beginning of UMN Festival 2025. This event sets the tone for the entire festival celebration.',
                'answer_id' => 'Unveiling 2025 adalah upacara pembukaan besar UMN Festival 2025. Berguna untuk memperkenalkan semua kegiatan festival, meningkatkan kesadaran mahasiswa UMN tentang festival, dan secara resmi menandai dimulainya UMN Festival 2025. Acara ini menentukan nada untuk seluruh perayaan festival.',
                'keywords' => ['unveiling', '2025', 'opening', 'ceremony', 'pembuka', 'acara', 'grand', 'official'],
                'priority' => 8
            ],
            [
                'category' => 'events',
                'question_en' => 'What is E-Ulympic 2025?',
                'question_id' => 'Apa itu E-Ulympic 2025?',
                'answer_en' => 'E-Ulympic 2025 is an exciting e-sports competition designed to discover and showcase gaming talents from UMN students and other participants. This tournament features various popular games and provides a platform for competitive gaming enthusiasts to demonstrate their skills and compete for prizes.',
                'answer_id' => 'E-Ulympic 2025 adalah kompetisi e-sports yang menarik yang dirancang untuk menemukan dan menampilkan bakat gaming dari mahasiswa UMN dan peserta lainnya. Turnamen ini menampilkan berbagai game populer dan menyediakan platform bagi penggemar gaming kompetitif untuk menunjukkan kemampuan mereka dan bersaing untuk hadiah.',
                'keywords' => ['eulympic', 'e-ulympic', 'esports', 'e-sports', 'competition', 'kompetisi', 'gaming', 'tournament', 'game'],
                'priority' => 8
            ],
            [
                'category' => 'events',
                'question_en' => 'What is U-Care 2025?',
                'question_id' => 'Apa itu U-Care 2025?',
                'answer_en' => 'U-Care 2025 is a community service event that focuses on social responsibility and giving back to the community. This meaningful program allows participants to engage in various volunteer activities and make a positive impact on society as part of the UMN Festival 2025 celebration.',
                'answer_id' => 'U-Care 2025 adalah acara pengabdian masyarakat yang fokus pada tanggung jawab sosial dan memberikan kembali kepada masyarakat. Program bermakna ini memungkinkan peserta untuk terlibat dalam berbagai kegiatan sukarela dan membuat dampak positif pada masyarakat sebagai bagian dari perayaan UMN Festival 2025.',
                'keywords' => ['ucare', 'u-care', 'community', 'service', 'social', 'masyarakat', 'pengabdian', 'volunteer', 'sukarela'],
                'priority' => 8
            ],

            // TICKETS COMPREHENSIVE INFORMATION
            [
                'category' => 'tickets',
                'question_en' => 'How can I buy tickets for UMN Festival 2025?',
                'question_id' => 'Bagaimana cara membeli tiket UMN Festival 2025?',
                'answer_en' => 'You can buy tickets through our official website at the ticket page. We accept various payment methods through Midtrans including credit cards, bank transfers, and e-wallets. After successful payment, tickets are delivered instantly to your email. The process is secure, fast, and user-friendly.',
                'answer_id' => 'Anda dapat membeli tiket melalui website resmi kami di halaman tiket. Kami menerima berbagai metode pembayaran melalui Midtrans termasuk kartu kredit, transfer bank, dan e-wallet. Setelah pembayaran berhasil, tiket dikirim langsung ke email Anda. Prosesnya aman, cepat, dan user-friendly.',
                'keywords' => ['buy', 'purchase', 'ticket', 'tiket', 'beli', 'payment', 'pembayaran', 'midtrans', 'website', 'email'],
                'priority' => 9
            ],
            [
                'category' => 'tickets',
                'question_en' => 'What ticket types are available?',
                'question_id' => 'Jenis tiket apa saja yang tersedia?',
                'answer_en' => 'We offer several ticket types for UMN Festival 2025: Early Bird (sold out), Pre-Sales 1 (sold out), Pre-Sales 2 (currently available), Regular (coming soon), and more to be announced. Each type offers different pricing and benefits. Check our ticket page for current availability and pricing.',
                'answer_id' => 'Kami menawarkan beberapa jenis tiket untuk UMN Festival 2025: Early Bird (sold out), Pre-Sales 1 (sold out), Pre-Sales 2 (tersedia saat ini), Regular (segera hadir), dan lainnya akan diumumkan. Setiap jenis menawarkan harga dan manfaat yang berbeda. Cek halaman tiket kami untuk ketersediaan dan harga terkini.',
                'keywords' => ['ticket', 'types', 'tiket', 'jenis', 'early', 'bird', 'pre-sales', 'regular', 'available', 'tersedia'],
                'priority' => 9
            ],
            [
                'category' => 'tickets',
                'question_en' => 'Are there student discounts available?',
                'question_id' => 'Apakah ada diskon untuk mahasiswa?',
                'answer_en' => 'Yes! We offer special discounts for students. You can use referral codes and discount codes for additional savings. Check with your student organization or follow our social media for the latest discount codes. Student verification may be required for certain discounts.',
                'answer_id' => 'Ya! Kami menawarkan diskon khusus untuk mahasiswa. Anda bisa menggunakan kode referral dan kode diskon untuk penghematan tambahan. Cek dengan organisasi mahasiswa Anda atau ikuti media sosial kami untuk kode diskon terbaru. Verifikasi mahasiswa mungkin diperlukan untuk diskon tertentu.',
                'keywords' => ['student', 'discount', 'mahasiswa', 'diskon', 'referral', 'code', 'kode', 'savings', 'hemat'],
                'priority' => 7
            ],

            // GUEST STARS AND ENTERTAINMENT
            [
                'category' => 'guest_stars',
                'question_en' => 'Who are the guest stars for UMN Festival 2025?',
                'question_id' => 'Siapa bintang tamu UMN Festival 2025?',
                'answer_en' => 'Reality Club has been confirmed as one of our amazing guest stars for UMN Festival 2025! They\'re a popular Indonesian indie rock band known for their energetic performances. More exciting artists will be announced soon, so stay tuned to our social media for updates!',
                'answer_id' => 'Reality Club telah dikonfirmasi sebagai salah satu bintang tamu luar biasa kami untuk UMN Festival 2025! Mereka adalah band indie rock Indonesia populer yang dikenal dengan penampilan energik mereka. Artis menarik lainnya akan segera diumumkan, jadi pantau terus media sosial kami untuk update!',
                'keywords' => ['guest', 'star', 'artist', 'performer', 'bintang', 'tamu', 'artis', 'penampil', 'reality', 'club', 'band', 'music'],
                'priority' => 9
            ],
            [
                'category' => 'guest_stars',
                'question_en' => 'When will more guest stars be announced?',
                'question_id' => 'Kapan bintang tamu lainnya akan diumumkan?',
                'answer_en' => 'We\'re continuously working on bringing more amazing artists to UMN Festival 2025! New guest star announcements will be made regularly leading up to the festival. Follow our official social media accounts and website for the latest updates and exclusive reveals.',
                'answer_id' => 'Kami terus bekerja untuk menghadirkan lebih banyak artis luar biasa ke UMN Festival 2025! Pengumuman bintang tamu baru akan dibuat secara berkala menjelang festival. Ikuti akun media sosial resmi dan website kami untuk update terbaru dan pengungkapan eksklusif.',
                'keywords' => ['announce', 'announcement', 'more', 'artists', 'when', 'kapan', 'umumkan', 'pengumuman', 'lebih', 'artis'],
                'priority' => 7
            ],

            // MERCHANDISE DETAILED INFORMATION
            [
                'category' => 'merchandise',
                'question_en' => 'What merchandise is available for UMN Festival 2025?',
                'question_id' => 'Merchandise apa saja yang tersedia untuk UMN Festival 2025?',
                'answer_en' => 'We have an amazing official merchandise line for UMN Festival 2025! Available items include: Lanyards (IDR 20,000), Keychain Series (IDR 13,000-20,000), Nago Hand Fans (IDR 12,000), official t-shirts, tote bags, and more! All merchandise features fresh designs with premium quality materials.',
                'answer_id' => 'Kami memiliki lini merchandise resmi yang luar biasa untuk UMN Festival 2025! Item yang tersedia meliputi: Lanyard (IDR 20.000), Seri Gantungan Kunci (IDR 13.000-20.000), Kipas Tangan Nago (IDR 12.000), kaos resmi, tote bag, dan lainnya! Semua merchandise menampilkan desain segar dengan bahan berkualitas premium.',
                'keywords' => ['merchandise', 'merch', 'lanyard', 'keychain', 'fan', 'tshirt', 'totebag', 'official', 'resmi', 'design', 'desain'],
                'priority' => 8
            ],
            [
                'category' => 'merchandise',
                'question_en' => 'Where can I buy UMN Festival merchandise?',
                'question_id' => 'Dimana saya bisa membeli merchandise UMN Festival?',
                'answer_en' => 'You can purchase UMN Festival 2025 merchandise through our official merchandise page on the website. We offer secure online ordering with various payment options. Merchandise will also be available at the festival venue during the event. Check our merchandise page for the complete catalog and pricing!',
                'answer_id' => 'Anda dapat membeli merchandise UMN Festival 2025 melalui halaman merchandise resmi di website kami. Kami menawarkan pemesanan online yang aman dengan berbagai pilihan pembayaran. Merchandise juga akan tersedia di venue festival selama acara. Cek halaman merchandise kami untuk katalog lengkap dan harga!',
                'keywords' => ['buy', 'purchase', 'where', 'beli', 'dimana', 'online', 'website', 'venue', 'catalog', 'katalog'],
                'priority' => 7
            ],

            // WEBSITE NAVIGATION AND PAGES
            [
                'category' => 'navigation',
                'question_en' => 'What pages are available on the UMN Festival website?',
                'question_id' => 'Halaman apa saja yang tersedia di website UMN Festival?',
                'answer_en' => 'Our UMN Festival 2025 website features several pages: 1) Home - Festival overview and latest updates, 2) Ticket - Purchase tickets with pricing info, 3) Event - Detailed information about all festival events, 4) Merchandise - Official product catalog and store, 5) About - Information about the festival and organizing committee. Navigate using the menu at the top!',
                'answer_id' => 'Website UMN Festival 2025 kami memiliki beberapa halaman: 1) Home - Overview festival dan update terbaru, 2) Ticket - Beli tiket dengan info harga, 3) Event - Informasi detail tentang semua acara festival, 4) Merchandise - Katalog produk resmi dan toko, 5) About - Informasi tentang festival dan panitia penyelenggara. Navigasi menggunakan menu di atas!',
                'keywords' => ['website', 'pages', 'navigation', 'menu', 'halaman', 'situs', 'navigasi', 'home', 'ticket', 'event', 'merchandise', 'about'],
                'priority' => 6
            ],

            // PAYMENT AND PURCHASE PROCESS
            [
                'category' => 'payment',
                'question_en' => 'What payment methods are accepted?',
                'question_id' => 'Metode pembayaran apa saja yang diterima?',
                'answer_en' => 'We accept various secure payment methods through Midtrans: Credit cards (Visa, Mastercard), Bank transfers (BCA, Mandiri, BNI, BRI), E-wallets (GoPay, OVO, DANA), and other digital payment options. All transactions are processed securely with instant confirmation.',
                'answer_id' => 'Kami menerima berbagai metode pembayaran aman melalui Midtrans: Kartu kredit (Visa, Mastercard), Transfer bank (BCA, Mandiri, BNI, BRI), E-wallet (GoPay, OVO, DANA), dan opsi pembayaran digital lainnya. Semua transaksi diproses dengan aman dengan konfirmasi instan.',
                'keywords' => ['payment', 'method', 'pembayaran', 'metode', 'midtrans', 'credit', 'card', 'bank', 'transfer', 'ewallet', 'gopay', 'ovo', 'dana'],
                'priority' => 8
            ],
            [
                'category' => 'payment',
                'question_en' => 'How long does payment processing take?',
                'question_id' => 'Berapa lama proses pembayaran?',
                'answer_en' => 'Payment processing is typically instant! Once you complete your payment through Midtrans, you\'ll receive immediate confirmation and your tickets will be delivered to your email within minutes. If you experience any delays, please contact our support team for assistance.',
                'answer_id' => 'Proses pembayaran biasanya instan! Setelah Anda menyelesaikan pembayaran melalui Midtrans, Anda akan menerima konfirmasi langsung dan tiket akan dikirim ke email Anda dalam hitungan menit. Jika mengalami keterlambatan, silakan hubungi tim support kami untuk bantuan.',
                'keywords' => ['processing', 'time', 'instant', 'proses', 'waktu', 'instan', 'confirmation', 'konfirmasi', 'email', 'minutes', 'menit'],
                'priority' => 7
            ],

            // UNIVERSITY INFORMATION
            [
                'category' => 'university',
                'question_en' => 'Tell me about Universitas Multimedia Nusantara',
                'question_id' => 'Ceritakan tentang Universitas Multimedia Nusantara',
                'answer_en' => 'Universitas Multimedia Nusantara (UMN) is a leading private university in Indonesia, located in Serpong, Tangerang Selatan. UMN focuses on multimedia, technology, and creative industries with modern facilities and innovative programs. The university is known for its vibrant campus life and strong industry connections.',
                'answer_id' => 'Universitas Multimedia Nusantara (UMN) adalah universitas swasta terkemuka di Indonesia, berlokasi di Serpong, Tangerang Selatan. UMN fokus pada multimedia, teknologi, dan industri kreatif dengan fasilitas modern dan program inovatif. Universitas ini dikenal dengan kehidupan kampus yang dinamis dan koneksi industri yang kuat.',
                'keywords' => ['university', 'universitas', 'umn', 'multimedia', 'nusantara', 'private', 'swasta', 'serpong', 'technology', 'teknologi'],
                'priority' => 6
            ],

            // SAFETY AND GUIDELINES
            [
                'category' => 'safety',
                'question_en' => 'What are the safety protocols for UMN Festival 2025?',
                'question_id' => 'Apa protokol keamanan untuk UMN Festival 2025?',
                'answer_en' => 'We prioritize the safety and security of all attendees at UMN Festival 2025. Our safety measures include: Professional security personnel, Emergency response teams, Health and safety protocols, Clear evacuation procedures, First aid stations, and 24/7 security monitoring. Your safety is our top priority!',
                'answer_id' => 'Kami mengutamakan keamanan dan keselamatan semua peserta di UMN Festival 2025. Langkah keamanan kami meliputi: Personel keamanan profesional, Tim tanggap darurat, Protokol kesehatan dan keselamatan, Prosedur evakuasi yang jelas, Pos pertolongan pertama, dan monitoring keamanan 24/7. Keamanan Anda adalah prioritas utama kami!',
                'keywords' => ['safety', 'security', 'protocol', 'keamanan', 'protokol', 'emergency', 'darurat', 'health', 'kesehatan', 'first', 'aid'],
                'priority' => 8
            ],

            // CONTACT AND SUPPORT
            [
                'category' => 'contact',
                'question_en' => 'How can I contact the organizers?',
                'question_id' => 'Bagaimana cara menghubungi penyelenggara?',
                'answer_en' => 'You can reach the UMN Festival 2025 organizing team through: Our official social media channels (Instagram, Facebook, YouTube), Email support through our website contact form, Direct messages on social media platforms, or visit the UMN campus information desk. We\'re always ready to help!',
                'answer_id' => 'Anda dapat menghubungi tim penyelenggara UMN Festival 2025 melalui: Saluran media sosial resmi kami (Instagram, Facebook, YouTube), Dukungan email melalui formulir kontak website kami, Pesan langsung di platform media sosial, atau kunjungi meja informasi kampus UMN. Kami selalu siap membantu!',
                'keywords' => ['contact', 'organizer', 'help', 'support', 'kontak', 'penyelenggara', 'bantuan', 'social', 'media', 'email'],
                'priority' => 7
            ],

            // FAQ AND COMMON QUESTIONS
            [
                'category' => 'faq',
                'question_en' => 'Is there an age limit for UMN Festival 2025?',
                'question_id' => 'Apakah ada batasan usia untuk UMN Festival 2025?',
                'answer_en' => 'UMN Festival 2025 is open to all ages! We welcome everyone to join our celebration. However, some specific events or activities might have age recommendations for safety or content reasons. Check individual event details for any specific requirements.',
                'answer_id' => 'UMN Festival 2025 terbuka untuk semua usia! Kami menyambut semua orang untuk bergabung dalam perayaan kami. Namun, beberapa acara atau aktivitas khusus mungkin memiliki rekomendasi usia untuk alasan keamanan atau konten. Cek detail acara individual untuk persyaratan khusus.',
                'keywords' => ['age', 'limit', 'usia', 'batasan', 'all', 'ages', 'semua', 'open', 'terbuka', 'everyone'],
                'priority' => 6
            ],
            [
                'category' => 'faq',
                'question_en' => 'What should I bring to UMN Festival 2025?',
                'question_id' => 'Apa yang harus saya bawa ke UMN Festival 2025?',
                'answer_en' => 'For UMN Festival 2025, we recommend bringing: Your ticket (digital or printed), Valid ID, Comfortable clothing and shoes, Water bottle (stay hydrated!), Portable charger for your phone, Cash for merchandise and food, and a positive attitude! Some items may be restricted for security reasons.',
                'answer_id' => 'Untuk UMN Festival 2025, kami merekomendasikan membawa: Tiket Anda (digital atau cetak), ID yang valid, Pakaian dan sepatu yang nyaman, Botol air (tetap terhidrasi!), Charger portable untuk ponsel, Uang tunai untuk merchandise dan makanan, dan sikap positif! Beberapa item mungkin dibatasi untuk alasan keamanan.',
                'keywords' => ['bring', 'what', 'items', 'bawa', 'apa', 'barang', 'ticket', 'tiket', 'id', 'clothing', 'pakaian', 'water', 'air'],
                'priority' => 6
            ],

            // PARKING AND FACILITIES
            [
                'category' => 'facilities',
                'question_en' => 'Is parking available at UMN Festival 2025?',
                'question_id' => 'Apakah ada tempat parkir di UMN Festival 2025?',
                'answer_en' => 'Yes! Parking facilities are available at the UMN campus for festival attendees. We have designated parking areas for cars and motorcycles. Parking is free for festival ticket holders. We recommend arriving early as parking spaces are limited during peak hours.',
                'answer_id' => 'Ya! Fasilitas parkir tersedia di kampus UMN untuk peserta festival. Kami memiliki area parkir khusus untuk mobil dan motor. Parkir gratis untuk pemegang tiket festival. Kami merekomendasikan datang lebih awal karena tempat parkir terbatas selama jam sibuk.',
                'keywords' => ['parking', 'parkir', 'car', 'motorcycle', 'mobil', 'motor', 'free', 'gratis', 'campus', 'kampus'],
                'priority' => 7
            ],
            [
                'category' => 'facilities',
                'question_en' => 'What facilities are available at the venue?',
                'question_id' => 'Fasilitas apa saja yang tersedia di venue?',
                'answer_en' => 'UMN campus offers excellent facilities for festival attendees: Modern auditoriums and performance spaces, Food courts and dining options, Restrooms and prayer rooms, ATM machines, Free WiFi throughout campus, Air-conditioned indoor areas, Medical facilities and first aid stations, and accessible facilities for people with disabilities.',
                'answer_id' => 'Kampus UMN menawarkan fasilitas excellent untuk peserta festival: Auditorium modern dan ruang pertunjukan, Food court dan pilihan makan, Toilet dan mushola, Mesin ATM, WiFi gratis di seluruh kampus, Area indoor ber-AC, Fasilitas medis dan pos pertolongan pertama, dan fasilitas aksesibel untuk penyandang disabilitas.',
                'keywords' => ['facilities', 'fasilitas', 'venue', 'auditorium', 'food', 'restroom', 'wifi', 'atm', 'medical', 'accessible'],
                'priority' => 6
            ],

            // SCHEDULE AND TIMING
            [
                'category' => 'schedule',
                'question_en' => 'What are the festival hours?',
                'question_id' => 'Jam berapa festival berlangsung?',
                'answer_en' => 'UMN Festival 2025 will run throughout the day with various activities and performances. Specific timing for each event will be announced closer to the festival date. Generally, activities start in the morning and continue until evening. Check our countdown and events page for detailed schedules!',
                'answer_id' => 'UMN Festival 2025 akan berlangsung sepanjang hari dengan berbagai aktivitas dan pertunjukan. Waktu spesifik untuk setiap acara akan diumumkan lebih dekat dengan tanggal festival. Umumnya, aktivitas dimulai pagi hari dan berlanjut hingga malam. Cek halaman countdown dan events kami untuk jadwal detail!',
                'keywords' => ['hours', 'time', 'schedule', 'jam', 'waktu', 'jadwal', 'timing', 'morning', 'evening', 'pagi', 'malam'],
                'priority' => 7
            ],

            // FOOD AND DINING
            [
                'category' => 'food',
                'question_en' => 'Will food be available at UMN Festival 2025?',
                'question_id' => 'Apakah akan ada makanan di UMN Festival 2025?',
                'answer_en' => 'Absolutely! UMN campus has excellent food courts and dining options that will be available during the festival. You\'ll find a variety of local and international cuisines, snacks, beverages, and special festival food stalls. Prices are student-friendly and there are options for all dietary preferences.',
                'answer_id' => 'Tentu saja! Kampus UMN memiliki food court dan pilihan makan yang excellent yang akan tersedia selama festival. Anda akan menemukan berbagai masakan lokal dan internasional, snack, minuman, dan stan makanan khusus festival. Harga ramah mahasiswa dan ada pilihan untuk semua preferensi diet.',
                'keywords' => ['food', 'dining', 'eat', 'makanan', 'makan', 'food', 'court', 'cuisine', 'masakan', 'snack', 'beverage', 'minuman'],
                'priority' => 6
            ],

            // ACCESSIBILITY AND INCLUSION
            [
                'category' => 'accessibility',
                'question_en' => 'Is UMN Festival 2025 accessible for people with disabilities?',
                'question_id' => 'Apakah UMN Festival 2025 dapat diakses oleh penyandang disabilitas?',
                'answer_en' => 'Yes! UMN Festival 2025 is committed to being inclusive and accessible for everyone. The UMN campus features wheelchair-accessible pathways, elevators, accessible restrooms, designated parking spaces, and assistance services. If you need special accommodations, please contact us in advance.',
                'answer_id' => 'Ya! UMN Festival 2025 berkomitmen untuk inklusif dan dapat diakses oleh semua orang. Kampus UMN memiliki jalur yang dapat diakses kursi roda, elevator, toilet yang dapat diakses, tempat parkir khusus, dan layanan bantuan. Jika Anda memerlukan akomodasi khusus, silakan hubungi kami sebelumnya.',
                'keywords' => ['accessible', 'disability', 'wheelchair', 'inclusion', 'aksesibel', 'disabilitas', 'kursi', 'roda', 'inklusif', 'elevator'],
                'priority' => 7
            ],

            // SOCIAL MEDIA AND UPDATES
            [
                'category' => 'social_media',
                'question_en' => 'Where can I follow UMN Festival 2025 updates?',
                'question_id' => 'Dimana saya bisa mengikuti update UMN Festival 2025?',
                'answer_en' => 'Stay connected with UMN Festival 2025 through our official social media channels! Follow us on Instagram, Facebook, and YouTube for the latest announcements, behind-the-scenes content, artist reveals, and exclusive updates. Don\'t miss any exciting news about the festival!',
                'answer_id' => 'Tetap terhubung dengan UMN Festival 2025 melalui saluran media sosial resmi kami! Ikuti kami di Instagram, Facebook, dan YouTube untuk pengumuman terbaru, konten behind-the-scenes, pengungkapan artis, dan update eksklusif. Jangan sampai ketinggalan berita menarik tentang festival!',
                'keywords' => ['social', 'media', 'follow', 'updates', 'instagram', 'facebook', 'youtube', 'sosial', 'ikuti', 'update', 'announcement'],
                'priority' => 6
            ]
        ];

        foreach ($comprehensiveKnowledge as $item) {
            ChatbotKnowledge::create($item);
        }

        $this->command->info('✅ Comprehensive chatbot knowledge base seeded successfully with ' . count($comprehensiveKnowledge) . ' entries.');
    }
}