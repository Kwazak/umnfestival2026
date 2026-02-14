import React, { useState, useEffect, useMemo } from "react";
import Acara from "../../../images/LogoDivisi/Acara.png";
import BPH from "../../../images/LogoDivisi/BPH.png";
import Dekorasi from "../../../images/LogoDivisi/Dekorasi.png";
import Dokumentasi from "../../../images/LogoDivisi/Dokumentasi.png";
import FreshMoney from "../../../images/LogoDivisi/Fresh_Money.png";
import Keamanan from "../../../images/LogoDivisi/Keamanan.png";
import Konsumsi from "../../../images/LogoDivisi/Konsumsi.png";
import Lomba from "../../../images/LogoDivisi/Lomba.png";
import MediaPartner from "../../../images/LogoDivisi/Media_Partner.png";
import Perlengkapan from "../../../images/LogoDivisi/Perlengkapan.png";
import Publikasi from "../../../images/LogoDivisi/Publikasi.png";
import Sponsor from "../../../images/LogoDivisi/Sponsor.png";
import Ticketing from "../../../images/LogoDivisi/Ticketing.png";
import Visual from "../../../images/LogoDivisi/Visual.png";
import Website from "../../../images/LogoDivisi/Website.png";

import HeaderDivision from "../../Components/AboutUs/Header";
// import { title } from "framer-motion/client";
// If you need 'title', import from 'framer-motion' or define it locally

// Data untuk semua divisi
const staticDivisions = [
    {
        name: "THE HIGH COUNCIL - NAVIGATORS OF DESTINY",
        title: "BADAN PENGURUS HARIAN",
        image: BPH,
        description1:
            "Dalam dunia Dungeons & Dragons, di mana seorang Dungeon Master atau High Council menentukan jalannya kisah, Council berperan sebagai navigator utama yang membimbing semua divisi menuju kejayaan.",
        description2:
            "Seperti kompas sihir yang menunjukkan arah dalam petualangan, Council adalah penjaga keseimbangan dan perancang strategi, memastikan bahwa setiap langkah yang diambil selaras dengan visi besar UMN Festival 2025. Divisi Council juga menjadi acuan utama para divisi lainnya dalam membantu mensukseskan UMN Festival 2025.",
    },
    {
        name: "QUESTMASTERS – THE ARCHITECTS OF ADVENTURE UMN FESTIVAL 2025",
        title: "DIVISI ACARA",
        image: Acara,
        description1:
            "Dalam dunia Dungeons & Dragons, tak ada petualangan yang berjalan tanpa arahan sang Dungeon Master. Seperti seorang perancang takdir, Questmasters hadir sebagai arsitek utama yang menciptakan misi penuh kejutan dan strategi, layaknya Deck of Many Things yang menentukan jalan para petualang!",
        description2:
            "Setiap detail acara yang dirancang oleh Questmasters adalah bagian dari perjalanan epik, memastikan bahwa setiap momen dalam UMN Festival 2025 terasa seperti petualangan yang penuh kejutan, tantangan, dan euforia!",
    },
    {
        name: "TOURNAMENT – MASTER OF THE ARENA UMN FESTIVAL 2025",
        title: "DIVISI LOMBA",
        image: Lomba,
        description1:
            "Dalam dunia Dungeons & Dragons, Grand Tournament of the Realms adalah ajang di mana para petualang membuktikan keberanian dan keterampilan mereka! Tournament hadir sebagai Master of the Arena, memastikan setiap kompetisi berjalan penuh semangat dan keadilan, bukan sekadar pertarungan untuk kemenangan, tetapi juga arena bagi para petualang membangun ikatan dan menunjukkan sportivitas sejati!",
        description2:
            "Seperti Chalice of Champions yang memandu para juara menuju kejayaan, Tournament menjadi penjaga setiap arena kompetisi di UMN Festival 2025, menciptakan medan pertempuran yang mendebarkan dan melahirkan legenda baru di antara para petualang!",
    },
    {
        name: "FEASTMASTERS – FUELING THE ADVENTURE!",
        title: "DIVISI KONSUMSI",
        image: Konsumsi,
        description1:
            "Dalam Dungeons & Dragons, setiap petualang membutuhkan energi untuk bertahan dalam perjalanan epik! Feastmasters hadir sebagai Culinary Enchanters, memastikan bahwa setiap peserta UMN Festival 2025 mendapatkan asupan yang cukup untuk terus beraksi.",
        description2:
            "Layaknya The Cauldron of Everlasting Feast, kuali ajaib yang tak pernah kosong, Feastmasters menyajikan hidangan lezat yang mengisi tenaga dan semangat para petualang.",
    },
    {
        name: "CODEX – THE GRAND ARCHIVE OF UMN FESTIVAL 2025",
        title: "DIVISI WEBSITE",
        image: Website,
        description1:
            "Dalam Dungeons & Dragons, setiap guliran dadu 20 membuka takdir dan mengungkap pengetahuan tersembunyi. Codex hadir sebagai Tomes of Wisdom, menjadi pusat informasi utama UMN Festival 2025 melalui website yang menyimpan seluruh panduan petualangan.",
        description2:
            "Layaknya The Grand Archive of the Arcane, yang mencatat hukum dunia sihir, Codex memastikan setiap petualang dapat dengan mudah menemukan jadwal, peraturan, dan informasi penting dalam satu platform yang selalu siap membimbing mereka.",
    },
    {
        name: "ILLUSIONISTS – MASTERS OF VISUAL ENCHANTMENT UMN FESTIVAL 2025",
        title: "DIVISI VISUAL",
        image: Visual,
        description1:
            "Dalam dunia Dungeons & Dragons, para Illusionists adalah penyihir yang menguasai seni menciptakan ilusi menipu mata dan pikiran dengan keajaiban yang luar biasa. Seperti seer yang menatap ke dalam Crystal Ball of True Sight, mereka merancang visual yang memukau, menghidupkan dunia penuh warna dan fantasi!",
        description2:
            "Dengan sentuhan sihir kreatif, Illusionists membangun atmosfer yang membawa para petualang masuk ke dalam dimensi UMN Festival 2025!",
    },
    {
        name: "CHRONICLERS – KEEPERS OF LEGENDS UMN FESTIVAL 2025",
        title: "DIVISI DOKUMENTASI",
        image: Dokumentasi,
        description1:
            "Dalam Dungeons & Dragons, setiap petualangan epik harus diabadikan agar tak hilang ditelan waktu. Chroniclers adalah penjaga kisah, layaknya seorang Lorekeeper yang mencatat sejarah dunia dalam Tome of Eternal Stories.",
        description2:
            "Dengan Monocle of Timeless Tales, artefak sihir yang menangkap setiap momen penting, mereka mendokumentasikan perjalanan yang terjadi di setiap sudut UMN Festival 2025"
    },
    {
        name: "HERALDS – THE VOICE OF UMN FESTIVAL 2025",
        title: "DIVISI PUBLIKASI",
        image: Publikasi,
        description1:
            "Dalam Dungeons & Dragons, para Heralds adalah pembawa kabar kerajaan, mengirimkan berita penting ke seluruh penjuru dunia! Layaknya Scrolls of Proclamation, gulungan kuno yang berisi pesan dari pemimpin dan penyihir agung, Heralds memastikan bahwa setiap petualang mendapatkan informasi terbaru tentang UMN Festival 2025 melalui media sosial.",
        description2:
            "Seperti Bard of the Digital Age, mereka menghidupkan kisah petualangan ini dengan desain visual, tulisan, dan video yang menarik. Dari pengumuman penting hingga konten epik yang membangkitkan semangat, Heralds memastikan setiap petualang siap untuk bergabung dalam petualangan penuh kejutan!",
    },
    {
        name: "ARTISANS – CRAFTERS OF ENCHANTED REALMS UMN FESTIVAL 2025",
        title: "DIVISI DEKORASI",
        image: Dekorasi,
        description1:
            "Dalam Dungeons & Dragons, setiap dunia petualangan lahir dari imajinasi, dan para Artisans adalah seniman yang menghidupkannya! Layaknya Quill of Enchanted Realms, pena ajaib yang mampu menciptakan dunia-dunia baru, Artisans menyulap UMN Festival 2025 menjadi mahakarya penuh keajaiban.",
        description2:
        "Dengan kreativitas tanpa batas, mereka merancang atmosfer yang membawa setiap petualang masuk ke dalam dunia fantasi menjadikan setiap sudut festival sebagai bagian dari kisah epik yang tak terlupakan!",
    },
    {
        name: "GUARDIANS – DEFENDERS OF UMN FESTIVAL 2025",
        title: "DIVISI KEAMANAN",
        image: Keamanan,
        description1:
        "Dalam Dungeons & Dragons, setiap petualangan epik harus diabadikan agar tak hilang ditelan waktu. Chroniclers adalah penjaga kisah, layaknya seorang Lorekeeper yang mencatat sejarah dunia dalam Tome of Eternal Stories.",
        description2:
        "Dengan Monocle of Timeless Tales, artefak sihir yang menangkap setiap momen penting, mereka mendokumentasikan perjalanan yang terjadi di setiap sudut UMN Festival 2025",
    },
    {
        name: "ARMORY – FORGING THE ESSENTIALS OF UMN FESTIVAL 2025",
        title: "DIVISI PERLENGKAPAN",
        image: Perlengkapan,
        description1:
        "Dalam Dungeons & Dragons, seorang petualang tidak akan pernah melangkah tanpa perlengkapan yang tepat! Armory berperan sebagai Master of the Forge, memastikan bahwa setiap elemen dalam UMN Festival 2025 memiliki alat dan perlengkapan terbaik untuk menunjang perjalanan epik ini.",
        description2:
        "Layaknya Scales of Balance, mereka menjaga keseimbangan dengan menyediakan semua yang dibutuhkan, dari perlengkapan teknis hingga kebutuhan utama setiap acara. Dengan ketelitian dan ketepatan, Armory memastikan bahwa semua item siap digunakan, mendukung setiap #Vanguards dalam menghadapi tantangan di sepanjang festival!",
    },
    {
        name: "PATRONS – THE LEGENDS BEHIND THE GLORY!",
        title: "DIVISI SPONSOR",
        image: Sponsor,
        description1:
        "Dalam Dungeons & Dragons, Patrons adalah kekuatan di balik para petualang, memberikan dukungan, sumber daya, dan akses menuju kejayaan!",
        description2:
        "Layaknya The Chain of Everlasting Bonds, rantai sihir yang memperkuat ikatan, Patrons menjalin kerja sama strategis dengan berbagai pihak untuk memastikan UMN Festival 2025 berjalan megah dan penuh kejutan. Mereka membuka gerbang menuju kesempatan baru, menghadirkan dukungan finansial dan material yang menjadikan festival ini lebih spektakuler!",
    },
    {
        name: "ALLIANCES – WEAVING POWERFUL BONDS ACROSS REALMS",
        title: "DIVISI MEDIA PARTNER",
        image: MediaPartner,
        description1:
        "Dalam Dungeons & Dragons, kekuatan sejati terlahir dari aliansi yang kokoh! Alliances hadir sebagai Arcane Diplomats, menjalin kerja sama dengan berbagai media partner untuk memperluas jangkauan UMN Festival 2025.",
        description2:
        "Layaknya Tome of Ever-Burning Alliances, yang terus mencatat perjanjian dan menghubungkan kerajaan-kerajaan, mereka memastikan bahwa setiap informasi dan promosi tersampaikan dengan baik. Seperti Sending Spells yang menyebarkan pesan ke seluruh dunia, Alliances membawa semangat petualangan ke lebih banyak jiwa yang siap bergabung dalam perjalanan epik ini!",
    },
    {
        name: "TREASURERS – KEEPERS OF THE VAULT OF FORTUNE",
        title: "DIVISI FRESH MONEY",
        image: FreshMoney,
        description1:
        "Dalam Dungeons & Dragons, harta karun bukan sekadar emas berlimpah, tetapi sumber daya berharga yang menentukan jalannya petualangan! Treasurers hadir sebagai Keepers of the Vault, memastikan setiap pemasukan dan pengeluaran dikelola dengan strategi keuangan yang matang demi kelancaran UMN Festival 2025.",
        description2:
        "Layaknya Chest of Arcane Wealth, peti ajaib yang hanya terbuka bagi mereka yang memahami keseimbangan finansial, Treasurers mengalokasikan dana dengan bijak, mengatur pemasukan, pengeluaran, dan peluang dengan ketelitian seorang Dungeon Master yang membagi loot dalam campaign",
    },
    {
        name: "GATEKEEPERS – UNLOCK THE ADVENTURE!",
        title: "DIVISI TICKETING",
        image: Ticketing,
        description1:
        "Dalam Dungeons & Dragons, setiap petualangan dimulai dari gerbang mistis, dijaga oleh Gatekeepers, para penjaga portal yang menentukan siapa yang layak melangkah ke dunia penuh tantangan!",
        description2:
        "Dengan The Sealed Scroll, tiket sakral yang hanya bisa dibuka oleh mereka yang memiliki izin, serta The Key of Passage, kunci yang membuka jalan bagi para petualang, Gatekeepers bertanggung jawab mengatur akses menuju UMN Festival 2025!",
    },
];

export default function DivisionSection() {
    const CLONE_COUNT = 5;
    const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT);
    const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
    
    // State untuk menyimpan ukuran item carousel yang responsif
    const [itemWidth, setItemWidth] = useState(215);
    const [itemGap, setItemGap] = useState(24);

    // useEffect untuk mendeteksi dan mengubah ukuran carousel untuk semua breakpoint
    useEffect(() => {
        const updateCarouselSize = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1536) { // 2xl breakpoint
                setItemWidth(315);
                setItemGap(32);
            } else if (screenWidth >= 768) { // md breakpoint
                setItemWidth(215);
                setItemGap(24);
            } else { // mobile
                setItemWidth(100);
                setItemGap(16);
            }
        };

        updateCarouselSize();
        window.addEventListener('resize', updateCarouselSize);
        return () => window.removeEventListener('resize', updateCarouselSize);
    }, []);

    // Load divisions dynamically from API, fallback to static on failure
    const [divisions, setDivisions] = useState(staticDivisions);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await fetch('/api/divisions');
                const data = await res.json();
                if (res.ok && data?.success && Array.isArray(data.data) && data.data.length) {
                    if (isMounted) setDivisions(data.data);
                }
            } catch {}
            finally { if (isMounted) setLoading(false); }
        })();
        return () => { isMounted = false; };
    }, []);

    const displayItems = useMemo(() => {
        if (divisions.length === 0) return [];
        const lastClones = divisions.slice(-CLONE_COUNT);
        const firstClones = divisions.slice(0, CLONE_COUNT);
        return [...lastClones, ...divisions, ...firstClones];
    }, []);

    const handleNext = () => {
        if (!isTransitionEnabled) return;
        setCurrentIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (!isTransitionEnabled) return;
        setCurrentIndex((prev) => prev - 1);
    };

    const handleTransitionEnd = () => {
        if (currentIndex >= divisions.length + CLONE_COUNT) {
            setIsTransitionEnabled(false);
            setCurrentIndex(currentIndex - divisions.length);
        } else if (currentIndex < CLONE_COUNT) {
            setIsTransitionEnabled(false);
            setCurrentIndex(currentIndex + divisions.length);
        }
    };

    useEffect(() => {
        if (!isTransitionEnabled) {
            const timer = setTimeout(() => setIsTransitionEnabled(true), 50);
            return () => clearTimeout(timer);
        }
    }, [isTransitionEnabled, currentIndex]);
    
    const offset = -(currentIndex * (itemWidth + itemGap));
    const selectedDataIndex = divisions.length ? (currentIndex - CLONE_COUNT + divisions.length) % divisions.length : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Loading divisions...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center space-y-6 min-h-screen w-full my-20 md:my-30 md:px-0 lg:px-0">
            <HeaderDivision />

            <div className="relative w-full flex items-center justify-center pb-8 overflow-hidden">
                <button
                    onClick={handlePrev}
                    className="absolute left-2 md:left-5 z-20 text-black bg-slate-100 hover:bg-slate-200 font-bold p-4 
                    w-8 h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 xl:w-18 xl:h-18
                    text-sm md:text-xl lg:text-2xl 2xl:text-3xl
                    rounded-full shadow-lg flex items-center justify-center"
                >
                    ◀
                </button>
                <div className="w-full overflow-hidden">
                    <div
                        className={`flex items-center space-x-4 md:space-x-6 2xl:space-x-8 ${isTransitionEnabled ? 'transition-transform duration-500 ease-out' : ''}`}
                        style={{
                            transform: `translateX(calc(50% - ${itemWidth / 2}px)) translateX(${offset}px)`,
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {displayItems.map((div, index) => {
                            const originalItemIndex = (index - CLONE_COUNT + divisions.length) % divisions.length;
                            const isActive = originalItemIndex === selectedDataIndex && index >= CLONE_COUNT && index < divisions.length + CLONE_COUNT;
                            
                            return (
                                <button
                                    key={index}
                                    className={`flex-shrink-0 
                                    w-[100px] h-[110px] md:w-[215px] md:h-[316px] 2xl:w-[315px] 2xl:h-[420px] 
                                    overflow-hidden transition-transform duration-500 
                                    ${isActive ? "scale-125 md:scale-130" : "scale-100 md:scale-110"}`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    <img src={div.image} alt={div.name} className="w-full h-full object-contain" onError={(e)=>{e.currentTarget.src='https://via.placeholder.com/300x300?text=Division';}}/>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={handleNext}
                    className="absolute right-2 md:right-5 z-20 text-black bg-slate-100 hover:bg-slate-200 font-bold p-4 
                    w-8 h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 xl:w-18 xl:h-18
                    text-sm md:text-xl lg:text-2xl 2xl:text-3xl
                    rounded-full shadow-lg flex items-center justify-center"
                >
                    ▶
                </button>
            </div>

            <div className="max-w-[90%] mx-10 w-full bg-[#B72A2A] text-white 
                px-10 md:px-20 py-10 md:py-16 
                rounded-3xl border-[4px] 
                md:border-[6px] border-yellow-400 transition-all duration-500 ease-in-out">
                {divisions[selectedDataIndex] && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-28 md:w-[70%] md:h-[28vw] lg:w-[50%] lg:h-[22vw] bg-slate-200">
                                {/* Image Divisi */}
                                <img src={divisions[selectedDataIndex].image} alt={divisions[selectedDataIndex].name} className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <div className="lg:px-20">
                            {/* Judul Divisi */}
                            <h2 className="text-center text-sm md:text-3xl uppercase">{divisions[selectedDataIndex].name}</h2>
                            {/* Sub Judul Divisi */}
                            <h2 className="text-center text-sm md:text-2xl uppercase mt-2">{divisions[selectedDataIndex].title}</h2>
                            {/* Desc 1  */}
                            <p className="mt-4 text-center text-sm md:text-lg lg:text-xl font-light">{divisions[selectedDataIndex].description1}</p>
                            {/* Desc 2 */}
                            <p className="mt-4 text-center text-sm md:text-lg lg:text-xl font-light">{divisions[selectedDataIndex].description2}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}