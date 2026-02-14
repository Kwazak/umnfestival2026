import React, { useEffect, useState } from "react";
import introImg from "../../../images/intro-img.webp";
import introImg480 from "../../../images/intro-img-w480.webp";
import introImg768 from "../../../images/intro-img-w768.webp";
import introImg1024 from "../../../images/intro-img-w1024.webp";
import introImg1440 from "../../../images/intro-img-w1440.webp";
// Closing + Extra Sections assets
import EulympicPromo from "../../../images/eulympicpromotional.webp";
import merchImg from "../../../images/merchandiseClosing.webp";
import rc from "../../../images/Merchandise/reality-club.webp";

export default function IntroductionSection({ bgColor, borderColor }) {
    // State & data for integrated ClosingSection
    const [closingData, setClosingData] = useState(null);
    const [closingLoading, setClosingLoading] = useState(true);

    useEffect(() => {
        const fetchClosingData = async () => {
            try {
                const response = await fetch('/api/closing-section');
                const data = await response.json();
                if (data.success) {
                    setClosingData(data.data);
                }
            } catch (e) {
                console.error('Failed to fetch closing section data:', e);
            } finally {
                setClosingLoading(false);
            }
        };
        fetchClosingData();
    }, []);

    const processText = (text) => {
        if (!text) return '';
        const lines = text.split('\n');
        return lines.map((line, idx) => (
            <React.Fragment key={idx}>
                {line}
                {idx < lines.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const defaultClosing = {
        image_url: EulympicPromo,
        head_text: 'E-ULYMPIC 2025',
        content_text: `E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat mahasiswa/i UMN maupun di luar UMN dalam perlombaan cabang olahraga E-Sport.\n\nOpen Registration : 6 – 16 May 2025\nTerbuka untuk 64 Teams Mahasiswa, SMA / Sederajat\n\nEvent Day : 19 – 23 May 2025\nVenue : Lobby B, Universitas Multimedia Nusantara`,
        button1_text: 'Daftar Sekarang',
        button1_link: '#',
        button2_text: 'Pelajari Lebih Lanjut',
        button2_link: '#',
        is_active: true
    };

    // Decide which data to show: if API returns inactive, hide section entirely.
    const apiReturned = !!closingData;
    const closingSectionData = closingData || defaultClosing;
    const showClosing = !(apiReturned && closingData && closingData.is_active === false);
    const animatedBackgroundStyle = {
        background:
            "linear-gradient(270deg, #A42128, #822021, #620f11ff, #A42128)",
        backgroundSize: "400% 400%",
        animation: "animatedGradient 15s ease infinite",
    };

    // If a bgColor prop is provided, use it to override the section background
    const sectionStyle = bgColor ? { background: bgColor } : animatedBackgroundStyle;
    // If a borderColor prop is provided, we'll apply it via inline style to keep this override local
    const borderStyle = borderColor ? { borderColor: borderColor } : {};

    return (
        <section
            style={sectionStyle}
            className="w-full min-h-screen px-4 flex justify-center relative overflow-hidden py-16"
        >
            <style>
                {`
                    @keyframes animatedGradient {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        section { animation: none !important; }
                    }
                `}
            </style>

            <div className="w-full flex flex-col items-center">
            {/* Intro Card */}
            <div
                className="
                flex flex-col lg:flex-row gap-6 lg:gap-0
                w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px]
                h-auto lg:h-[380px] xl:h-[425px]
                rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg bg-white border-[5px]"
                style={borderStyle}>

                {/* Bagian kiri/atas - Gambar */}
                <div className="
                    w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                    h-[300px] sm:h-[340px] md:h-[360px] lg:h-full
                    relative
                    lg:border-r lg:border-black
                ">
                    <img
                        src={introImg}
                        srcSet={`${introImg480} 480w, ${introImg768} 768w, ${introImg1024} 1024w, ${introImg1440} 1440w`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 553px"
                        alt="UMN Festival Introduction"
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* Bagian kanan/bawah - Konten */}
                <div className="
                    w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-8 lg:py-12
                    flex flex-col justify-center
                    gap-4 lg:gap-6
                    text-center lg:text-left
                    -mt-2 sm:mt-0
                ">
                    {/* Head Text */}
                    <div className="text-left">
                        <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">
                            UMN FESTIVAL 2025
                        </p>
                    </div>

                    {/* Description Text */}
                    <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify
                                    text-[13px]
                                    sm:text-[15px]
                                    md:text-[16px]
                                    lg:text-[17px]
                                    xl:text-[19px]">
                        <strong>UMN FESTIVAL</strong> merupakan
                        kegiatan festival tahunan terbesar
                        Universitas Multimedia Nusantara yang berada
                        dibawah naungan <strong>BEM UMN</strong>.
                        Kegiatan ini dilaksanakan dalam rangka
                        memperingati hari ulang tahun UMN yang telah
                        berdiri sejak tahun 2005 dan akan merayakan
                        ulang tahun ke 19 pada tahun 2025.
                    </div>

                    {/* Button */}
                    <div className="flex justify-center lg:justify-start mt-3">
                        <a href="/about" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[160px] h-[32px] text-[15px]
                                        sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                        md:w-[165px] md:h-[37px] md:text-[17px]
                                        lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                        xl:w-[222px] xl:h-[44px] xl:text-[22px]"
                           role="button">
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                </div>
            </div>

            {/* Closing Section */}
            {closingLoading ? (
                <div className="w-full flex justify-center mt-20">
                    <div className="text-white/80 text-sm animate-pulse">Loading closing section...</div>
                </div>
                ) : showClosing && (
                <div className="mt-20 flex flex-col lg:flex-row w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] h-auto lg:h-[400px] xl:h-[500px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg bg-white border-4" style={borderStyle}>
                    <div className="w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px] h-[320px] lg:h-full relative lg:border-r">
                        <img src={closingSectionData.image_url} alt={closingSectionData.head_text} className="w-full h-full object-cover object-center" loading="lazy" decoding="async" onError={(e) => { e.target.src = EulympicPromo; }} />
                    </div>
                    <div className="w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px] px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 lg:py-12 flex flex-col justify-center gap-4 lg:gap-6 text-center lg:text-left">
                        <div className="text-left">
                            <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">{closingSectionData.head_text}</p>
                        </div>
                        <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify text-[13px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[19px]">{processText(closingSectionData.content_text)}</div>
                        <div className="flex flex-col sm:flex-row lg:justify-start gap-3 sm:gap-4 mt-3">
                            <button onClick={() => { const l = closingSectionData.button1_link; if (l && l !== '#') { if (l.startsWith('http')) window.open(l, '_blank'); else window.location.href = l; } }} className="text-white bg-[#B42129] rounded-full cursor-pointer hover:bg-[#892026] transition-all duration-200 w-[160px] h-[32px] text-[15px] sm:w-[160px] sm:h-[32px] sm:text-[16px] md:w-[165px] md:h-[37px] md:text-[17px] lg:w-[191px] lg:h-[37px] lg:text-[19px] xl:w-[222px] xl:h-[44px] xl:text-[22px]">{closingSectionData.button1_text}</button>
                            <button onClick={() => { const l = closingSectionData.button2_link; if (l && l !== '#') { if (l.startsWith('http')) window.open(l, '_blank'); else window.location.href = l; } }} className="text-white bg-[#B42129] rounded-full cursor-pointer hover:bg-[#892026] transition-all duration-200 w-[160px] h-[32px] text-[15px] sm:w-[160px] sm:h-[32px] sm:text-[16px] md:w-[165px] md:h-[37px] md:text-[17px] lg:w-[191px] lg:h-[37px] lg:text-[19px] xl:w-[222px] xl:h-[44px] xl:text-[22px]">{closingSectionData.button2_text}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Static Banners */}
                <div className="w-full flex flex-col items-center mt-20 space-y-20">
                <div className="flex flex-col lg:flex-row w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] h-auto lg:h-[380px] xl:h-[425px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg bg-white border-[5px]" style={borderStyle}>
                    <div className="w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px] h-[320px] lg:h-full relative lg:border-r lg:border-black">
                        <img src={merchImg} alt="GRAB YOUR MERCH!" className="w-full h-full object-cover object-center" loading="lazy" decoding="async" />
                    </div>
                    <div className="w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px] px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12 flex flex-col gap-4 lg:gap-6 text-center lg:text-left justify-center">
                        <div className="lg:text-left">
                            <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">GRAB YOUR MERCH!</p>
                        </div>
                        <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify text-[13px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[19px]">Yuk, tunjukkan semangatmu dalam merayakan<strong> UMN FESTIVAL 2025</strong> dengan memiliki merchandise dengan desain fresh, kualitas premium, dan tentunya... edisi<strong> TERBATAS </strong>yang bakal bikin kamu beda dari yang lain!</div>
                        <div className="flex lg:justify-start mt-3">
                            <a href="/merchandise" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center hover:bg-[#892026] transition-all duration-200 w-[160px] h-[32px] text-[15px] sm:w-[160px] sm:h-[32px] sm:text-[16px] md:w-[165px] md:h-[37px] md:text-[17px] lg:w-[191px] lg:h-[37px] lg:text-[19px] xl:w-[222px] xl:h-[44px] xl:text-[22px]">Pelajari Lebih Lanjut</a>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] h-auto lg:h-[380px] xl:h-[425px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg bg-white border-[5px]" style={borderStyle}>
                    <div className="w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px] h-[320px] lg:h-full bg-[#B76A18] relative lg:border-r lg:border-black">
                        <img src={rc} alt="Reality Club" className="w-full h-full object-cover object-center" loading="lazy" decoding="async" />
                    </div>
                    <div className="w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px] px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12 flex flex-col justify-center gap-4 lg:gap-6 text-center lg:text-left">
                        <div className="text-left">
                            <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">GET YOUR TICKET!!!</p>
                        </div>
                        <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify text-[13px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[19px]">Jangan sampai ketinggalan acara terbesar<strong> UMN Festival 2025 </strong>yang akan hadir kembali dengan<strong> UNIFY 2025 </strong>, bersama dengan Guest Star pertama kita, Reality Club.<strong> Saksikan langsung UNIFY 2025 di Universitas Multimedia Nusantara pada tanggal 22 November 2025.</strong></div>
                        <div className="flex lg:justify-start mt-3">
                            <a href="/ticket" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center hover:bg-[#892026] transition-all duration-200 w-[160px] h-[32px] text-[15px] sm:w-[160px] sm:h-[32px] sm:text-[16px] md:w-[165px] md:h-[37px] md:text-[17px] lg:w-[191px] lg:h-[37px] lg:text-[19px] xl:w-[222px] xl:h-[44px] xl:text-[22px]">Pelajari Lebih Lanjut</a>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </section>
    );
}