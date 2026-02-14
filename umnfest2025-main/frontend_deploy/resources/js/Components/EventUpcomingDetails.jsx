import React, { useRef, useState, useEffect } from "react";
import Unveiling from "/resources/images/unveilingcard.png";
import EUlympic from "/resources/images/eulympiccard.png";
import Locked from "/resources/images/lockedcard.png";

export default function EventUpComingDetails() {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollLeft = () => {
        scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    };

    const scrollRight = () => {
        scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    };

    const handleScroll = () => {
        const scroll = scrollRef.current;
        const childrenCount = scroll.children.length;
        const scrollPosition = scroll.scrollLeft;
        const totalWidth = scroll.scrollWidth - scroll.clientWidth;
        const ratio = scrollPosition / totalWidth;
        const index = Math.round(ratio * (childrenCount - 1));
        setActiveIndex(index);
    };

    useEffect(() => {
        const scrollEl = scrollRef.current;
        scrollEl.addEventListener("scroll", handleScroll);
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center gap-6 sm:gap-4 my-5 bg-ufes-red py-10">

            <button
                onClick={scrollLeft}
                className="absolute left-0 lg:left-15 z-10 m-2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❮
            </button>

            {/* Scrollable Section */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 sm:gap-4 px-4 mx-auto overflow-hidden
                            w-full
                            sm:w-[600px]
                            md:w-[720px]
                            lg:w-[900px]
                            xl:w-[1150px]"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                }}
            >
                {/* Unveiling */}
                <div className="flex flex-col flex-shrink-0 rounded-3xl overflow-hidden bg-white snap-center
                                w-[284px] max-h-[450px]   
                                sm:w-[500px] sm:h-[420px]
                                md:w-[700px] md:h-[244px] md:flex-row
                                lg:w-[814px] lg:h-[304px]
                                xl:w-[856px] xl:h-[320px]">
                    {/* Image */}
                    <div className="relative shrink-0 overflow-hidden 
                                    w-full h-[150px]
                                    sm:w-[500px] sm:h-[200px]
                                    md:w-auto md:h-auto
                    ">
                        <img
                            src={Unveiling}
                            alt="Unveiling"
                            className="w-full h-full object-cover object-[center_41%]"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center w-auto px-9
                                    sm:px-12 py-8 sm:py-8 tracking-wide">

                        {/* Head Text */}
                        <div className="text-[#1F5A9F] mb-1 font-bold w-full
                                        text-[15px]
                                        sm:text-[18px]
                                        md:text-[25px] md:leading-7
                                        lg:text-[27px] lg:leading-9
                                        xl:text-[32px] xl:leading-12">
                            <p>UNVEILING 2025</p>
                        </div>

                        {/* Description */}
                        <div className="text-[#1F5A9F] pb-4 lg:pb-6 leading-tight font-medium
                                        text-[13px]
                                        sm:text-[14px]
                                        md:text-[15px]
                                        lg:text-[17px]
                                        xl:text-[19px]">
                            <p>Sebagai acara pembuka dari UMN Festival 2025 yang berguna untuk memperkenalkan kegiatan UMN Festival, meningkatkan kesadaran mahasiswa/i UMN mengenai kegiatan UMN Festival dan menandakan bahwa kegiatan UMN Festival 2025 telah dimulai.</p>
                        </div>
                        {/* Button */}
                        <button className="text-white bg-[#881E11] rounded-full cursor-pointer
                                        hover:bg-[#620E04] transition-all duration-200 font-light
                                        w-[100px] h-[23px] text-[12px]
                                        sm:w-[116px] sm:h-[26px] sm:text-[13.5px]
                                        md:w-[132px] md:h-[30px] md:text-[15.3px]
                                        lg:w-[147px] lg:h-[33px] lg:text-[17.1px]
                                        xl:w-[155px] xl:h-[35px] xl:text-[18px]">
                            Pelajari →
                        </button>
                    </div>
                </div>

                {/* E-Ulympic */}
                <div className="flex flex-col flex-shrink-0 rounded-3xl overflow-hidden bg-white snap-center
                                w-[284px] max-h-[450px]   
                                sm:w-[500px] sm:h-[420px]
                                md:w-[700px] md:h-[244px] md:flex-row
                                lg:w-[814px] lg:h-[304px]
                                xl:w-[856px] xl:h-[320px]">
                    {/* Image */}
                    <div className="relative shrink-0 overflow-hidden 
                                    w-full h-[150px]
                                    sm:w-[500px] sm:h-[200px]
                                    md:w-auto md:h-auto
                    ">
                        <img
                            src={EUlympic}
                            alt="Eulympic"
                            className="w-full h-full object-cover object-[center_41%]"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center w-auto px-9
                                    sm:px-12 py-8 sm:py-8 tracking-wide">

                        {/* Head Text */}
                        <div className="text-[#1F5A9F] mb-1 font-bold w-full
                                        text-[15px]
                                        sm:text-[18px]
                                        md:text-[25px] md:leading-7
                                        lg:text-[27px] lg:leading-9
                                        xl:text-[32px] xl:leading-12">
                            <p>UNVEILING 2025</p>
                        </div>

                        {/* Description */}
                        <div className="text-[#1F5A9F] pb-7 lg:pb-9 leading-tight font-medium
                                        text-[13px]
                                        sm:text-[14px]
                                        md:text-[15px]
                                        lg:text-[17px]
                                        xl:text-[19px]">
                            <p>E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat dari mahasiswa/i UMN maupun mahasiswa dan siswa lainnya dalam perlombaan cabang olahraga E-Sports.</p>
                        </div>
                        {/* Button */}
                        <button className="text-white bg-[#881E11] rounded-full cursor-pointer
                                        hover:bg-[#620E04] transition-all duration-200 font-light
                                        w-[100px] h-[23px] text-[12px]
                                        sm:w-[116px] sm:h-[26px] sm:text-[13.5px]
                                        md:w-[132px] md:h-[30px] md:text-[15.3px]
                                        lg:w-[147px] lg:h-[33px] lg:text-[17.1px]
                                        xl:w-[155px] xl:h-[35px] xl:text-[18px]">
                            Pelajari →
                        </button>
                    </div>
                </div>

                {/* Coming soon */}
                <div className="flex flex-col flex-shrink-0 rounded-3xl overflow-hidden bg-[#A9A9A9] snap-center
                                w-[284px] max-h-[450px]   
                                sm:w-[500px] sm:h-[420px]
                                md:w-[700px] md:h-[244px] md:flex-row
                                lg:w-[814px] lg:h-[304px]
                                xl:w-[856px] xl:h-[320px]">
                    {/* Image */}
                    <div className="relative shrink-0 overflow-hidden 
                                    w-full h-[150px]
                                    sm:w-[500px] sm:h-[200px]
                                    md:w-auto md:h-auto
                    ">
                        <img
                            src={Locked}
                            alt="Locked card"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center w-auto px-9 h-full
                                    sm:px-12 py-10 md:py-8 sm:tracking-wider">

                        {/* Head Text */}
                        <div className="text-[#555555] mb-1 font-bold w-full sm:leading-8 sm:pr-20 lg:pr-25
                                        text-[18px]
                                        sm:text-[21px]
                                        md:text-[28px]
                                        lg:text-[30px]
                                        xl:text-[35px]">
                            <p>SOMETHING MAGICAL IS COMING SOON ...</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Navigasi */}
            <button
                onClick={scrollRight}
                className="absolute right-0 lg:right-15 z-10 m-2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❯
            </button>

            {/* Pagination Dots */}
            <div className="flex gap-2 mt-2">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-3 h-3 md:w-5 md:h-5 rounded-full"
                        style={{
                            backgroundColor: activeIndex === i ? "#F3C019" : "#FFE89B"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
