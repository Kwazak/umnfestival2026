import React from "react";
import { HeadText, Text, Button } from "../Components";
import introImg from "../../images/intro-img.png";

export default function IntroductionSection() {
    return (
        <section className="w-full px-4 py-12 mt-16 lg:mt-24">
            {/* Container responsif yang menggabungkan kedua layout */}
            <div className="
                flex flex-col lg:flex-row
                w-[342px] sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                h-auto
                lg:h-[400px] xl:h-[500px] 2xl:h-[500px]
                rounded-2xl lg:rounded-3xl
                overflow-hidden shadow-lg
                bg-white
                border-[5px] border-[#F8CB4C]
                lg:gap-8
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
                        alt="UMN Festival Introduction"
                        className="w-full h-full object-cover object-left-top"
                    />
                </div>

                {/* Bagian kanan/bawah - Konten */}
                <div className="
                    w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12
                    flex flex-col justify-center
                    gap-6 lg:gap-8
                    text-center lg:text-left
                ">
                    {/* Head Text */}
                    <div className="text-center lg:text-left">
                        <HeadText>
                            UMN FESTIVAL 2025
                        </HeadText>
                    </div>

                    {/* Description Text */}
                    <Text textAlign="justify">
                        <strong>UMN FESTIVAL</strong> merupakan
                        kegiatan festival tahunan terbesar
                        Universitas Multimedia Nusantara yang berada
                        dibawah naungan <strong>BEM UMN</strong>.
                        Kegiatan ini dilaksanakan dalam rangka
                        memperingati hari ulang tahun UMN yang telah
                        berdiri sejak tahun 2005 dan akan merayakan
                        ulang tahun ke 19 pada tahun 2025.
                    </Text>

                    {/* Button */}
                    <div className="flex justify-center lg:justify-start">
                        <Button href="/about">
                            Pelajari Lebih Lanjut
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
