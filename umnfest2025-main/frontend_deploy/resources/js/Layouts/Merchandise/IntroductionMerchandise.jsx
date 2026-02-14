import React from "react";
import { HeadText, Text, Button } from "../../Components";
import introImg from "../../../images/intro-img.webp";
import introImg480 from "../../../images/intro-img-w480.webp";
import introImg768 from "../../../images/intro-img-w768.webp";
import introImg1024 from "../../../images/intro-img-w1024.webp";
import introImg1440 from "../../../images/intro-img-w1440.webp";
import realityClub from "../../../images/Merchandise/reality-club.webp";
import dragon from "../../../images/Merchandise/dragon.webp";

export default function IntroductionMerchandise() {
    return (
        <section className="relative w-full px-4 lg:py-36 py-20 mt-0 lg:mt-0 top-0">
            <div className="w-full">
            <img src={dragon} className="absolute z-10 -top-[45px] left-0 w-[180px] md:w-[200px] lg:w-[300px]"/>
            {/* Container responsif yang menggabungkan kedua layout */}
            <div className="
                flex flex-col lg:flex-row
                w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                h-auto
                lg:h-[380px] xl:h-[425px]
                rounded-2xl lg:rounded-3xl
                overflow-hidden shadow-lg
                bg-white
                border-[5px] border-[#F8CB4C]
            ">

                {/* Bagian kiri/atas - Gambar */}
                <div className="
                    w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                    h-[320px] lg:h-full
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
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12
                    flex flex-col justify-center
                    gap-4 lg:gap-6
                    text-center lg:text-left
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
                                    sm:text-[14px]
                                    md:text-[15px]
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
                    <div className="flex mt-3">
                            <a href="/about" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                            hover:bg-[#892026] transition-all duration-200
                                            w-[160px] h-[32px] text-[15px]
                                            sm:w-[131px] sm:h-[25px] sm:text-[14px]
                                            md:w-[155px] md:h-[30px] md:text-[15px]
                                            lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                            xl:w-[222px] xl:h-[44px] xl:text-[22px]">
                                Pelajari Lebih Lanjut
                            </a>
                    </div>
                </div>
            </div>

            <div className="
                flex flex-col lg:flex-row
                w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                h-auto
                lg:h-[380px] xl:h-[425px]
                rounded-2xl lg:rounded-3xl
                overflow-hidden shadow-lg
                bg-white
                border-[5px] border-[#F8CB4C] mt-10
            ">

                {/* Bagian kiri/atas - Gambar */}
                <div className="
                    w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                    h-[320px] lg:h-full bg-[#B76A18]
                    relative
                    lg:border-r lg:border-black
                ">
                    <img
                        src={realityClub}
                        alt="UMN Festival Introduction"
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Bagian kanan/bawah - Konten */}
                <div className="
                    w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12
                    flex flex-col justify-center
                    gap-4 lg:gap-6
                    text-center lg:text-left
                ">
                    {/* Head Text */}
                    <div className="text-left">
                        <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">
                            GET YOUR TICKET !!! 
                        </p>
                    </div>

                    {/* Description Text */}
                    <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify
                                    text-[13px]
                                    sm:text-[14px]
                                    md:text-[15px]
                                    lg:text-[17px]
                                    xl:text-[19px]">
                        Jangan sampai ketinggalan acara terbesar <strong>UMN Festival 2025 </strong> 
                        yang akan hadir kembali dengan <strong>UNIFY 2025, bersama </strong>
                        dengan Guest Star pertama kita, <strong>Reality Club. Saksikan langsung UNIFY 
                        2025 di Universitas Multimedia Nusantara pada tanggal 22 November 2025.</strong>
                    </div>

                    {/* Button */}
                    <div className="flex mt-3">
                            <a href="/ticket" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                            hover:bg-[#892026] transition-all duration-200
                                            w-[160px] h-[32px] text-[15px]
                                            sm:w-[131px] sm:h-[25px] sm:text-[14px]
                                            md:w-[155px] md:h-[30px] md:text-[15px]
                                            lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                            xl:w-[222px] xl:h-[44px] xl:text-[22px]">
                                Pelajari Lebih Lanjut
                            </a>
                    </div>
                </div>
            </div>
            </div>
            <img src={dragon} className="absolute z-10 scale-x-[-1] -bottom-[40px] right-0 w-[180px] md:w-[200px] lg:w-[300px]"/>
        </section>
    );
}
