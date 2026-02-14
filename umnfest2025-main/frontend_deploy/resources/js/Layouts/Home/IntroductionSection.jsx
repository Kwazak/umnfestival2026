import React from "react";
import introImg from "../../../images/intro-img.webp";
import introImg480 from "../../../images/intro-img-w480.webp";
import introImg768 from "../../../images/intro-img-w768.webp";
import introImg1024 from "../../../images/intro-img-w1024.webp";
import introImg1440 from "../../../images/intro-img-w1440.webp";

export default function IntroductionSection() {
    const animatedBackgroundStyle = {
        background:
            "linear-gradient(270deg, #A42128, #822021, #620f11ff, #A42128)",
        backgroundSize: "400% 400%",
        animation: "animatedGradient 15s ease infinite",
    };

    return (
        <section
            style={animatedBackgroundStyle}
            className="w-full min-h-screen lg:h-screen px-4 flex items-center justify-center relative overflow-hidden py-10 lg:py-0"
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

            <div className="
                flex flex-col lg:flex-row gap-6 lg:gap-0
                w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                h-auto
                lg:h-[380px] xl:h-[425px]
                rounded-2xl lg:rounded-3xl
                overflow-hidden shadow-lg
                bg-white
                border-[5px] border-[#F8CB4C]">

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
                        <a href="/about" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[160px] h-[32px] text-[15px]
                                        sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                        md:w-[165px] md:h-[37px] md:text-[17px]
                                        lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                        xl:w-[222px] xl:h-[44px] xl:text-[22px]">
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}