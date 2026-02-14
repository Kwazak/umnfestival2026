import React, { useState } from "react";
import trailerThumbnail from "../../../images/thumbnails/1.png";
import aftermovieThumbnail from "../../../images/thumbnails/2.png";
import PapanTitle from "../../../images/Wood_Tag_AboutUs.svg";

export default function ArchiveSection() {
    const videos = [
        {
            title: "OFFICIAL TRAILER E-ULYMPIC 2025",
            thumbnail: trailerThumbnail,
            videoId: "KFUEdLSF8yA",
        },
        {
            title: "UNVEILING 2025 AFTERMOVIE",
            thumbnail: aftermovieThumbnail,
            videoId: "H9EaIuFzMKk",
        },
    ];

    const [activeVideoIndex, setActiveVideoIndex] = useState(null);

    return (
        <section className="relative w-full bg-[#F7C546] py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
            {/* Banner Papan Kayu */}
            <div className="relative mx-auto mb-20 w-full max-w-[90%] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px]">
                <img src={PapanTitle} alt="Papan Judul" className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <p
                        className="text-white text-center font-serif font-light drop-shadow-lg
                                    text-[18px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px]
                                    leading-tight"
                        style={{ fontFamily: "Timed" }}
                    >
                        UMN FESTIVAL 2025’S ARCHIVES
                    </p>
                </div>
            </div>

            {/* Video Thumbnails / Players */}
            <div className="flex flex-col gap-16 max-w-7xl mx-auto w-full">
                {videos.map((vid, idx) => (
                    <div
                        key={idx}
                        className={`relative aspect-video overflow-hidden shadow-2xl group cursor-pointer transition-transform duration-300
                                    ${activeVideoIndex !== idx ? "lg:hover:scale-[1.02]" : ""}`}
                        onClick={() => setActiveVideoIndex(idx)}
                    >
                        {activeVideoIndex === idx ? (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${vid.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                                title={vid.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <>
                                <img
                                    src={vid.thumbnail}
                                    alt={vid.title}
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute top-4 left-0 bg-[#A42128] text-white
                                                px-4 sm:px-6 md:px-10 lg:px-12 py-2
                                                rounded-r-full text-[10px] sm:text-sm md:text-base lg:text-lg
                                                font-light tracking-wide shadow-md z-10"
                                >
                                    {vid.title}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center z-0 bg-black/30">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            className="w-6 h-6 sm:w-8 sm:h-8"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
