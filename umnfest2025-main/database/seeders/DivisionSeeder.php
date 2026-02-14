<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Division;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        // Default placeholder image (admin can change later)
        $placeholder = 'https://via.placeholder.com/600x300?text=Division';

        $divisions = [
            [
                'sort_order' => 0,
                'name' => 'THE HIGH COUNCIL - NAVIGATORS OF DESTINY',
                'title' => 'BADAN PENGURUS HARIAN',
                'image' => $placeholder,
                'description1' => 'Dalam dunia Dungeons & Dragons, di mana seorang Dungeon Master atau High Council menentukan jalannya kisah, Council berperan sebagai navigator utama yang membimbing semua divisi menuju kejayaan.',
                'description2' => 'Seperti kompas sihir yang menunjukkan arah dalam petualangan, Council adalah penjaga keseimbangan dan perancang strategi, memastikan bahwa setiap langkah yang diambil selaras dengan visi besar UMN Festival 2025. Divisi Council juga menjadi acuan utama para divisi lainnya dalam membantu mensukseskan UMN Festival 2025.',
                'is_active' => true,
            ],
            [
                'sort_order' => 1,
                'name' => 'QUESTMASTERS – THE ARCHITECTS OF ADVENTURE UMN FESTIVAL 2025',
                'title' => 'DIVISI ACARA',
                'image' => $placeholder,
                'description1' => 'Dalam dunia Dungeons & Dragons, tak ada petualangan yang berjalan tanpa arahan sang Dungeon Master. Seperti seorang perancang takdir, Questmasters hadir sebagai arsitek utama yang menciptakan misi penuh kejutan dan strategi, layaknya Deck of Many Things yang menentukan jalan para petualang!',
                'description2' => 'Setiap detail acara yang dirancang oleh Questmasters adalah bagian dari perjalanan epik, memastikan bahwa setiap momen dalam UMN Festival 2025 terasa seperti petualangan yang penuh kejutan, tantangan, dan euforia!',
                'is_active' => true,
            ],
            [
                'sort_order' => 2,
                'name' => 'TOURNAMENT – MASTER OF THE ARENA UMN FESTIVAL 2025',
                'title' => 'DIVISI LOMBA',
                'image' => $placeholder,
                'description1' => 'Dalam dunia Dungeons & Dragons, Grand Tournament of the Realms adalah ajang di mana para petualang membuktikan keberanian dan keterampilan mereka! Tournament hadir sebagai Master of the Arena, memastikan setiap kompetisi berjalan penuh semangat dan keadilan, bukan sekadar pertarungan untuk kemenangan, tetapi juga arena bagi para petualang membangun ikatan dan menunjukkan sportivitas sejati!',
                'description2' => 'Seperti Chalice of Champions yang memandu para juara menuju kejayaan, Tournament menjadi penjaga setiap arena kompetisi di UMN Festival 2025, menciptakan medan pertempuran yang mendebarkan dan melahirkan legenda baru di antara para petualang!',
                'is_active' => true,
            ],
            [
                'sort_order' => 3,
                'name' => 'FEASTMASTERS – FUELING THE ADVENTURE!',
                'title' => 'DIVISI KONSUMSI',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap petualang membutuhkan energi untuk bertahan dalam perjalanan epik! Feastmasters hadir sebagai Culinary Enchanters, memastikan bahwa setiap peserta UMN Festival 2025 mendapatkan asupan yang cukup untuk terus beraksi.',
                'description2' => 'Layaknya The Cauldron of Everlasting Feast, kuali ajaib yang tak pernah kosong, Feastmasters menyajikan hidangan lezat yang mengisi tenaga dan semangat para petualang.',
                'is_active' => true,
            ],
            [
                'sort_order' => 4,
                'name' => 'CODEX – THE GRAND ARCHIVE OF UMN FESTIVAL 2025',
                'title' => 'DIVISI WEBSITE',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap guliran dadu 20 membuka takdir dan mengungkap pengetahuan tersembunyi. Codex hadir sebagai Tomes of Wisdom, menjadi pusat informasi utama UMN Festival 2025 melalui website yang menyimpan seluruh panduan petualangan.',
                'description2' => 'Layaknya The Grand Archive of the Arcane, yang mencatat hukum dunia sihir, Codex memastikan setiap petualang dapat dengan mudah menemukan jadwal, peraturan, dan informasi penting dalam satu platform yang selalu siap membimbing mereka.',
                'is_active' => true,
            ],
            [
                'sort_order' => 5,
                'name' => 'ILLUSIONISTS – MASTERS OF VISUAL ENCHANTMENT UMN FESTIVAL 2025',
                'title' => 'DIVISI VISUAL',
                'image' => $placeholder,
                'description1' => 'Dalam dunia Dungeons & Dragons, para Illusionists adalah penyihir yang menguasai seni menciptakan ilusi menipu mata dan pikiran dengan keajaiban yang luar biasa. Seperti seer yang menatap ke dalam Crystal Ball of True Sight, mereka merancang visual yang memukau, menghidupkan dunia penuh warna dan fantasi!',
                'description2' => 'Dengan sentuhan sihir kreatif, Illusionists membangun atmosfer yang membawa para petualang masuk ke dalam dimensi UMN Festival 2025!',
                'is_active' => true,
            ],
            [
                'sort_order' => 6,
                'name' => 'CHRONICLERS – KEEPERS OF LEGENDS UMN FESTIVAL 2025',
                'title' => 'DIVISI DOKUMENTASI',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap petualangan epik harus diabadikan agar tak hilang ditelan waktu. Chroniclers adalah penjaga kisah, layaknya seorang Lorekeeper yang mencatat sejarah dunia dalam Tome of Eternal Stories.',
                'description2' => 'Dengan Monocle of Timeless Tales, artefak sihir yang menangkap setiap momen penting, mereka mendokumentasikan perjalanan yang terjadi di setiap sudut UMN Festival 2025',
                'is_active' => true,
            ],
            [
                'sort_order' => 7,
                'name' => 'HERALDS – THE VOICE OF UMN FESTIVAL 2025',
                'title' => 'DIVISI PUBLIKASI',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, para Heralds adalah pembawa kabar kerajaan, mengirimkan berita penting ke seluruh penjuru dunia! Layaknya Scrolls of Proclamation, gulungan kuno yang berisi pesan dari pemimpin dan penyihir agung, Heralds memastikan bahwa setiap petualang mendapatkan informasi terbaru tentang UMN Festival 2025 melalui media sosial.',
                'description2' => 'Seperti Bard of the Digital Age, mereka menghidupkan kisah petualangan ini dengan desain visual, tulisan, dan video yang menarik. Dari pengumuman penting hingga konten epik yang membangkitkan semangat, Heralds memastikan setiap petualang siap untuk bergabung dalam petualangan penuh kejutan!',
                'is_active' => true,
            ],
            [
                'sort_order' => 8,
                'name' => 'ARTISANS – CRAFTERS OF ENCHANTED REALMS UMN FESTIVAL 2025',
                'title' => 'DIVISI DEKORASI',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap dunia petualangan lahir dari imajinasi, dan para Artisans adalah seniman yang menghidupkannya! Layaknya Quill of Enchanted Realms, pena ajaib yang mampu menciptakan dunia-dunia baru, Artisans menyulap UMN Festival 2025 menjadi mahakarya penuh keajaiban.',
                'description2' => 'Dengan kreativitas tanpa batas, mereka merancang atmosfer yang membawa setiap petualang masuk ke dalam dunia fantasi menjadikan setiap sudut festival sebagai bagian dari kisah epik yang tak terlupakan!',
                'is_active' => true,
            ],
            [
                'sort_order' => 9,
                'name' => 'GUARDIANS – DEFENDERS OF UMN FESTIVAL 2025',
                'title' => 'DIVISI KEAMANAN',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap petualangan epik harus diabadikan agar tak hilang ditelan waktu. Chroniclers adalah penjaga kisah, layaknya seorang Lorekeeper yang mencatat sejarah dunia dalam Tome of Eternal Stories.',
                'description2' => 'Dengan Monocle of Timeless Tales, artefak sihir yang menangkap setiap momen penting, mereka mendokumentasikan perjalanan yang terjadi di setiap sudut UMN Festival 2025',
                'is_active' => true,
            ],
            [
                'sort_order' => 10,
                'name' => 'ARMORY – FORGING THE ESSENTIALS OF UMN FESTIVAL 2025',
                'title' => 'DIVISI PERLENGKAPAN',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, seorang petualang tidak akan pernah melangkah tanpa perlengkapan yang tepat! Armory berperan sebagai Master of the Forge, memastikan bahwa setiap elemen dalam UMN Festival 2025 memiliki alat dan perlengkapan terbaik untuk menunjang perjalanan epik ini.',
                'description2' => 'Layaknya Scales of Balance, mereka menjaga keseimbangan dengan menyediakan semua yang dibutuhkan, dari perlengkapan teknis hingga kebutuhan utama setiap acara. Dengan ketelitian dan ketepatan, Armory memastikan bahwa semua item siap digunakan, mendukung setiap #Vanguards dalam menghadapi tantangan di sepanjang festival!',
                'is_active' => true,
            ],
            [
                'sort_order' => 11,
                'name' => 'PATRONS – THE LEGENDS BEHIND THE GLORY!',
                'title' => 'DIVISI SPONSOR',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, Patrons adalah kekuatan di balik para petualang, memberikan dukungan, sumber daya, dan akses menuju kejayaan!',
                'description2' => 'Layaknya The Chain of Everlasting Bonds, rantai sihir yang memperkuat ikatan, Patrons menjalin kerja sama strategis dengan berbagai pihak untuk memastikan UMN Festival 2025 berjalan megah dan penuh kejutan. Mereka membuka gerbang menuju kesempatan baru, menghadirkan dukungan finansial dan material yang menjadikan festival ini lebih spektakuler!',
                'is_active' => true,
            ],
            [
                'sort_order' => 12,
                'name' => 'ALLIANCES – WEAVING POWERFUL BONDS ACROSS REALMS',
                'title' => 'DIVISI MEDIA PARTNER',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, kekuatan sejati terlahir dari aliansi yang kokoh! Alliances hadir sebagai Arcane Diplomats, menjalin kerja sama dengan berbagai media partner untuk memperluas jangkauan UMN Festival 2025.',
                'description2' => 'Layaknya Tome of Ever-Burning Alliances, yang terus mencatat perjanjian dan menghubungkan kerajaan-kerajaan, mereka memastikan bahwa setiap informasi dan promosi tersampaikan dengan baik. Seperti Sending Spells yang menyebarkan pesan ke seluruh dunia, Alliances membawa semangat petualangan ke lebih banyak jiwa yang siap bergabung dalam perjalanan epik ini!',
                'is_active' => true,
            ],
            [
                'sort_order' => 13,
                'name' => 'TREASURERS – KEEPERS OF THE VAULT OF FORTUNE',
                'title' => 'DIVISI FRESH MONEY',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, harta karun bukan sekadar emas berlimpah, tetapi sumber daya berharga yang menentukan jalannya petualangan! Treasurers hadir sebagai Keepers of the Vault, memastikan setiap pemasukan dan pengeluaran dikelola dengan strategi keuangan yang matang demi kelancaran UMN Festival 2025.',
                'description2' => 'Layaknya Chest of Arcane Wealth, peti ajaib yang hanya terbuka bagi mereka yang memahami keseimbangan finansial, Treasurers mengalokasikan dana dengan bijak, mengatur pemasukan, pengeluaran, dan peluang dengan ketelitian seorang Dungeon Master yang membagi loot dalam campaign',
                'is_active' => true,
            ],
            [
                'sort_order' => 14,
                'name' => 'GATEKEEPERS – UNLOCK THE ADVENTURE!',
                'title' => 'DIVISI TICKETING',
                'image' => $placeholder,
                'description1' => 'Dalam Dungeons & Dragons, setiap petualangan dimulai dari gerbang mistis, dijaga oleh Gatekeepers, para penjaga portal yang menentukan siapa yang layak melangkah ke dunia penuh tantangan!',
                'description2' => 'Dengan The Sealed Scroll, tiket sakral yang hanya bisa dibuka oleh mereka yang memiliki izin, serta The Key of Passage, kunci yang membuka jalan bagi para petualang, Gatekeepers bertanggung jawab mengatur akses menuju UMN Festival 2025!',
                'is_active' => true,
            ],
        ];

        foreach ($divisions as $d) {
            Division::updateOrCreate(
                ['name' => $d['name']],
                $d
            );
        }
    }
}