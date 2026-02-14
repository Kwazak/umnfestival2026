import { useEffect, useState } from "react";
import PhotoFrame from "../../../images/PaperCard.svg";
import Photo1 from "../../../images/PhotoAboutUs/Slide1.png";
import Photo2 from "../../../images/PhotoAboutUs/Slide2.png";
import Photo3 from "../../../images/PhotoAboutUs/Slide3.png";
import Photo4 from "../../../images/PhotoAboutUs/Slide4.png";
import Photo5 from "../../../images/PhotoAboutUs/Slide5.png";
import Photo6 from "../../../images/PhotoAboutUs/Slide6.png";
import Photo7 from "../../../images/PhotoAboutUs/Slide7.png";
import GrowthSticker from "../../../images/Stiker_1.svg";
import MapSticker from "../../../images/Stiker_maps.svg";
import PlotTwistSticker from "../../../images/Stiker_2.svg";
import VisionMission from "./VisionMissionSection";

const photos = [Photo1, Photo2, Photo3, Photo4, Photo5, Photo6, Photo7];

export default function AboutUMNFest() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % photos.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="">
                {/* 2Xl, Dekstop */}
                <section className="hidden 2xl:block relative pt-30 px-6 text-white overflow-hidden mx-50">
                    <div className="max-w-full mx-auto flex flex-col items-center justify-center gap-12 min-h-screen mx-auto">
                        {/* Frame + Gambar */}
                        <div className="self-start relative w-full max-w-[709px]">
                            <div className="relative w-[567px] h-[383px] top-[60px] left-[140px] rounded-[20px] overflow-hidden z-10 rotate-[-6.57deg]">
                                <div
                                    className="flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${current * 567}px)` }}
                                >
                                    {photos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="w-[567px] max-h-[383px] flex-shrink-0 relative"
                                        >
                                            <img
                                                src={photo}
                                                alt={`Slide ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frame kertas */}
                            <img
                                src={PhotoFrame}
                                alt="Photo frame"
                                className="absolute z-0 top-[10px] left-[70px] w-[900px] h-[500px] rotate-[-6.57deg] pointer-events-none"
                            />
                        </div>

                        {/* Box Deskripsi */}
                        <div className="relative w-fit max-w-[520px] xl:max-w-[600px] self-end z-20
                            lg:left-[-100px] lg:top-[-140px]
                            xl:left-[-80px] xl:top-[-160px]
                            2xl:left-[-140px] 2xl:top-[-140px]
                            drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">

                            {/* Gradient Border Layer */}
                            <div className="bg-gradient-to-br from-[#FFE47A] via-[#998949] via-[#B19320] to-[#FFE47A] p-[3px] rounded-[30px]">
                                <div className="bg-[#A2311F] rounded-[27px] px-10 py-10">
                                    <h2 className="text-white text-4xl text-center font-bold mb-4">
                                        UMN FESTIVAL 2025
                                    </h2>
                                    <p className="text-white leading-relaxed text-2xl font-light">
                                        <strong>UMN FESTIVAL</strong> merupakan kegiatan festival tahunan terbesar Universitas Multimedia Nusantara yang berada dibawah naungan <strong>BEM UMN</strong>.
                                        <br /><br />
                                        Kegiatan ini dilaksanakan dalam rangka memperingati <strong>hari ulang tahun UMN</strong> yang telah berdiri sejak tahun <strong>2005</strong> dan akan merayakan ulang tahun ke-19 pada tahun 2025.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dekorasi stiker */}
                    <img
                        src={GrowthSticker}
                        alt="Growth sticker"
                        className="absolute top-[-40px] lg:top-[0px] right-40 lg:right-[100px] w-[30vw] z-[-1]"
                    />
                    <img
                        src={MapSticker}
                        alt="Map sticker"
                        className="absolute 
                            lg:bottom-[18%] 
                            xl:bottom-[29%] 
                            lg:left-[40%]
                            xl:left-[33%]
                            max-w-[26vw] max-h-[30vw] z-0"
                    />
                    <img
                        src={PlotTwistSticker}
                        alt="Plot Twist sticker"
                        className="absolute bottom-[0px] w-[40vw]"
                    />
                </section>

                {/* Large, Dekstop */}
                <section className="hidden sm:hidden md:hidden lg:block 2xl:hidden relative pt-30 px-6 text-white overflow-hidden">
                    <div className="max-w-full mx-auto flex flex-col items-center justify-center gap-12 min-h-screen">
                        {/* Frame + Gambar */}
                        <div className="self-start relative w-full max-w-[709px]">
                            <div className="relative w-[567px] h-[383px] top-[60px] left-[140px] rounded-[20px] overflow-hidden z-10 rotate-[-6.57deg]">
                                <div
                                    className="flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${current * 567}px)` }}
                                >
                                    {photos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="w-[567px] max-h-[383px] flex-shrink-0 relative"
                                        >
                                            <img
                                                src={photo}
                                                alt={`Slide ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frame kertas */}
                            <img
                                src={PhotoFrame}
                                alt="Photo frame"
                                className="absolute z-0 top-[10px] left-[70px] w-[709px] rotate-[-6.57deg] pointer-events-none"
                            />
                        </div>

                        {/* Box Deskripsi */}
                        <div className="relative w-fit max-w-[520px] xl:max-w-[540px] self-end z-20
                            lg:left-[-100px] lg:top-[-140px]
                            xl:left-[-80px] xl:top-[-160px]
                            2xl:left-[-140px] 2xl:top-[-140px]
                            drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">

                            {/* Gradient Border Layer */}
                            <div className="bg-gradient-to-br from-[#FFE47A] via-[#998949] via-[#B19320] to-[#FFE47A] p-[3px] rounded-[30px]">
                                <div className="bg-[#A2311F] rounded-[27px] px-10 py-10">
                                    <h2 className="text-white text-4xl text-center font-bold mb-4">
                                        UMN FESTIVAL 2025
                                    </h2>
                                    <p className="text-white leading-relaxed text-xl font-light">
                                        <strong>UMN FESTIVAL</strong> merupakan kegiatan festival tahunan terbesar Universitas Multimedia Nusantara yang berada dibawah naungan <strong>BEM UMN</strong>.
                                        <br /><br />
                                        Kegiatan ini dilaksanakan dalam rangka memperingati <strong>hari ulang tahun UMN</strong> yang telah berdiri sejak tahun <strong>2005</strong> dan akan merayakan ulang tahun ke-19 pada tahun 2025.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dekorasi stiker */}
                    <img
                        src={GrowthSticker}
                        alt="Growth sticker"
                        className="absolute top-[-40px] lg:top-[-30px] right-40 lg:right-[100px] z-[-1]"
                    />
                    <img
                        src={MapSticker}
                        alt="Map sticker"
                        className="absolute 
                            lg:bottom-[18%] 
                            xl:bottom-[20%] 
                            lg:left-[50%]
                            xl:left-[50%] translate-x-[-50%] 
                            max-w-[260px] z-10"
                    />
                    <img
                        src={PlotTwistSticker}
                        alt="Plot Twist sticker"
                        className="absolute bottom-[0px]"
                    />
                </section>

                
                {/* Mobile View */}
                <section className="block sm:block md:block lg:hidden relative py-15 text-white overflow-hidden">
                    <div className="flex flex-col items-center justify-center gap-6">
                        {/* Frame dan Carousel */}
                        <div className="relative w-[336px] h-[230px] md:w-[480px] md:h-[360px] mx-auto left-[-80px] z-20">
                            {/* Frame kertas (background) */}
                            <img
                                src={PhotoFrame}
                                alt="Photo frame"
                                className="absolute inset-0 w-full h-full z-0 rotate-[-6.57deg] pointer-events-none"
                            />

                            {/* Carousel di dalam frame */}
                            <div className="absolute inset-0 z-10 p-8 md:p-10 rotate-[-6.67deg] flex items-center justify-center">
                                <img
                                src={photos[current]} // hanya tampilkan satu foto aktif
                                alt={`Slide ${current + 1}`}
                                className="w-[95%] h-[95%] object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Deskripsi Card */}
                        <div className="relative w-full max-w-xs md:max-w-sm z-20 drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] top-[-90px] md:right-[-50px] ">
                            <div className="bg-gradient-to-br from-[#FFE47A] via-[#998949] via-[#B19320] to-[#FFE47A] p-[3px] rounded-[30px]">
                                <div className="bg-[#A2311F] rounded-[27px] px-6 py-8">
                                    <h2 className="text-white text-lg text-center font-bold mb-3">
                                        UMN FESTIVAL 2025
                                    </h2>
                                    <p className="text-white text-sm text-center leading-relaxed font-light">
                                        <strong>UMN FESTIVAL</strong> merupakan kegiatan festival tahunan
                                        terbesar Universitas Multimedia Nusantara yang berada di bawah naungan <strong>BEM UMN</strong>.
                                        <br /><br />
                                        Kegiatan ini dilaksanakan dalam rangka memperingati <strong>hari ulang tahun UMN</strong> yang telah
                                        berdiri sejak tahun <strong>2005</strong> dan akan merayakan ulang tahun ke-19 pada tahun 2025.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dekorasi stiker */}
                    <img
                        src={GrowthSticker}
                        alt="Growth sticker"
                        className="absolute 
                        rotate-[30deg]
                        top-[40px] left-52
                        md:top-0 md:left-130
                        w-72
                        z-[-1]"
                    />
                    <img
                        src={MapSticker}
                        alt="Map sticker"
                        className="absolute 
                        rotate-[-20deg]
                        bottom-[0%] right-[-10%] 
                        md:bottom-[-5%] md:right-[10%] 
                        w-50 md:w-60
                        z-0"
                    />
                    <img
                        src={PlotTwistSticker}
                        alt="Plot Twist sticker"
                        className="absolute 
                        bottom-[8%] left-[-15%] w-84 
                        md:bottom-[0%] md:left-[0%] md:w-100
                        z-20"
                    />
                </section>

                <VisionMission/>
            </div>

            
        </>
    );
}