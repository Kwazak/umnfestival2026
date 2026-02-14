import React from "react";
import HERAKLID from "../../../images/Merchandise/HERAKLID.webp";
import HERAKLES from "../../../images/Merchandise/HERAKLES.webp";
import CADMUS from "../../../images/Merchandise/CADMUS.webp";

export default function BundlingPackageDetails() {
    return (
        <section className="w-full px-4 py-4">
            <div className="grid grid-cols-1 gap-6 place-items-center
                            md:grid-cols-2 md:grid-rows-2 md:gap-4
                            lg:grid-cols-1 lg:grid-rows-1 lg:gap-7">                
                {/* Heraklid */}
                <div className="flex flex-col h-full mx-auto rounded-2xl overflow-hidden bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.25)]
                                w-full
                                sm:w-[500px]
                                md:w-[364px]
                                lg:w-[900px] lg:h-[311px] lg:rounded-3xl lg:flex-row
                                xl:w-[1058px] xl:h-[365px] xl:gap-8">

                    {/* Gambar */}
                    <div className="relative shrink-0
                                    lg:w-[311px] lg:h-[311px]
                                    xl:w-[365px] xl:h-[365px]
                    ">
                        <img
                            src={HERAKLID}
                            alt="Bundling Heraklid"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Konten */}
                    <div className="flex flex-col justify-center w-auto px-9 py-10
                                    sm:px-12 sm:py-10 lg:pr-30">
                        {/* Head Text */}
                        <div className="text-[#281F65] mb-2 font-semibold w-full
                                        text-[15px]
                                        sm:text-[18px] sm:font-medium
                                        md:text-[22px] md:leading-7
                                        lg:text-[27px] lg:leading-9
                                        xl:text-[32px] xl:leading-12">
                            <p>HERAKLID BUNDLING PACKAGES</p>
                            <p>IDR 60,000 - IDR 65,000,-</p>
                        </div>

                        {/* Description */}
                        <div className="text-[#281F65] mb-6 leading-tight font-medium
                                        xl:text-[20px]">
                            <p>Bundling Packages includes :</p>
                            <p>“Legends Don’t Need To Roar” Totebag + Nagoo Hand Fan + Single / Double Keychains</p>
                        </div>
                        {/* Button */}
                        <button onClick={() => window.open("https://bit.ly/3GGNLqs", "_blank")} 
                                className="text-white bg-[#B42129] rounded-full cursor-pointer
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[130px] h-[28px] text-[13px]
                                        sm:w-[130px] sm:h-[28px] sm:text-[13px]
                                        md:w-[144px] md:h-[30px] md:text-[13px]
                                        lg:w-[180px] lg:h-[37px] lg:text-[17px]
                                        xl:w-[211px] xl:h-[44px] xl:text-[20px]
                                        2xl:">
                            PRE-ORDER NOW
                        </button>
                    </div>
                </div>

                {/* Herakles */}
                <div className="flex flex-col h-full mx-auto rounded-2xl overflow-hidden bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.25)]
                                w-full
                                sm:w-[500px]
                                md:w-[364px]
                                lg:w-[900px] lg:h-[311px] lg:rounded-3xl lg:flex-row
                                xl:w-[1058px] xl:h-[365px] xl:gap-8
                                2xl:">

                    {/* Gambar */}
                    <div className="relative shrink-0
                                    lg:w-[311px] lg:h-[311px]
                                    xl:w-[365px] xl:h-[365px]
                    ">
                        <img
                            src={HERAKLES}
                            alt="Bundling Herakles"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Konten */}
                    <div className="flex flex-col justify-center w-auto px-9 py-10
                                    sm:px-12 sm:py-10 lg:pr-30">
                        {/* Head Text */}
                        <div className="text-[#281F65] mb-2 font-semibold w-full
                                        text-[15px]
                                        sm:text-[18px] sm:font-medium
                                        md:text-[22px] md:leading-7
                                        lg:text-[27px] lg:leading-9
                                        xl:text-[32px] xl:leading-12">
                            <p>HERAKLES BUNDLING PACKAGES</p>
                            <p>IDR 90,000,-</p>
                        </div>

                        {/* Description */}
                        <div className="text-[#281F65] mb-11 leading-tight font-medium
                                        xl:text-[20px]">
                            <p>Bundling Packages includes :</p>
                            <p>“Strength in Struggle” Cream T-Shirt + Lanyard</p>
                        </div>

                        {/* Button */}
                        <button onClick={() => window.open("https://bit.ly/3GGNLqs", "_blank")}
                                className="text-white bg-[#B42129] rounded-full cursor-pointer
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[130px] h-[28px] text-[13px]
                                        sm:w-[120px] sm:h-[25px] sm:text-[12px]
                                        md:w-[144px] md:h-[30px] md:text-[13px]
                                        lg:w-[180px] lg:h-[37px] lg:text-[17px]
                                        xl:w-[211px] xl:h-[44px] xl:text-[20px]
                                        2xl:">
                            PRE-ORDER NOW
                        </button>
                    </div>
                </div>

                {/* Cadmus */}
                <div className="flex flex-col h-full mx-auto rounded-2xl overflow-hidden bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.25)]
                                w-full
                                sm:w-[500px]
                                md:w-[364px]
                                lg:w-[900px] lg:h-[311px] lg:rounded-3xl lg:flex-row
                                xl:w-[1058px] xl:h-[365px] xl:gap-8
                                2xl:">

                    {/* Gambar */}
                    <div className="relative shrink-0
                                    lg:w-[311px] lg:h-[311px]
                                    xl:w-[365px] xl:h-[365px]
                                    2xl:
                    ">
                        <img
                            src={CADMUS}
                            alt="Bundling Cadmus"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Konten */}
                    <div className="flex flex-col justify-center w-auto px-9 py-10
                                    sm:px-12 sm:py-10 lg:pr-30">
                        {/* Head Text */}
                        <div className="text-[#281F65] mb-2 font-semibold w-full
                                        text-[15px]
                                        sm:text-[18px] sm:font-medium
                                        md:text-[22px] md:leading-7
                                        lg:text-[27px] lg:leading-9
                                        xl:text-[32px] xl:leading-12
                                        2xl:">
                            <p>CADMUS BUNDLING PACKAGES</p>
                            <p>IDR 155,000 - IDR 160,000,-</p>
                        </div>

                        {/* Description */}
                        <div className="text-[#281F65] mb-3 leading-tight font-medium
                                        xl:text-[20px]">
                            <p>Bundling Packages includes :</p>
                            <p>“Strength in Struggle” Cream T-Shirt + Lanyard + “Legends Don’t Need To Roar” Totebag + Nagoo Hand Fan + Single / Double Keychains</p>
                        </div>

                        {/* Button */}
                        <button onClick={() => window.open("https://bit.ly/3GGNLqs", "_blank")}
                                className="text-white bg-[#B42129] rounded-full cursor-pointer
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[130px] h-[28px] text-[13px]
                                        sm:w-[120px] sm:h-[25px] sm:text-[12px]
                                        md:w-[144px] md:h-[30px] md:text-[13px]
                                        lg:w-[180px] lg:h-[37px] lg:text-[17px]
                                        xl:w-[211px] xl:h-[44px] xl:text-[20px]
                                        2xl:">
                            PRE-ORDER NOW
                        </button>
                    </div>
                </div>
            </div>

        </section>
    );
}
