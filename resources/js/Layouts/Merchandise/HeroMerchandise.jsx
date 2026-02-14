import React from "react";
import Banner from "../../../images/Merchandise/banner-merchandise.webp";
import MerchandiseTeks2 from "../../../images/Merchandise/merchandise-teks2.webp";
import LeftWing from "../../../images/Merchandise/yellow-air-4.webp";
import RightWing from "../../../images/Merchandise/yellow-air-5.webp";

export default function HeroMerchandise() {
    return (
        <section className="mb-10
                            sm:mb-14
                            md:mb-16
                            lg:mb-20
                            xl:mb-28
                            2xl:">
            {/* Wing */}
            <div className="relative -z-10">                
                {/* Wing Background 1 */}
                <div className="flex absolute inset-0 justify-between">
                    <img
                        src={LeftWing}
                        alt="Left Wing"
                        className="-z-10
                                w-[160px] h-[400px] translate-y-[-20px]
                                sm:w-[300px] sm:h-[600px] sm:translate-y-[-80px]
                                md:w-[350px] md:h-[800px] md:translate-y-[-120px]
                                lg:w-[500px] lg:h-[1000px] lg:translate-y-[-160px]
                                xl:w-[630px] xl:h-[1237px] xl:translate-y-[-210px]
                                2xl:w-[800px] 2xl:h-[1300px] 2xl:translate-y-[-220px]"
                    />
                    <img
                        src={RightWing}
                        alt="Right Wing"
                        className="-z-10
                                w-[160px] h-[400px] translate-y-[-20px]
                                sm:w-[300px] sm:h-[600px] sm:translate-y-[-80px]
                                md:w-[350px] md:h-[800px] md:translate-y-[-120px]
                                lg:w-[500px] lg:h-[1000px] lg:translate-y-[-160px]
                                xl:w-[630px] xl:h-[1237px] xl:translate-y-[-210px]
                                2xl:w-[800px] 2xl:h-[1300px] 2xl:translate-y-[-220px]"
                    />
                </div>

                
                {/* Wing Background 2*/}
                <div className="flex absolute inset-0 justify-between
                                translate-y-[50px]
                                sm:translate-y-[80px]
                                md:translate-y-[100px]
                                lg:translate-y-[120px]
                                xl:translate-y-[180px]
                                2xl:translate-y-[180px]">
                    <img
                        src={LeftWing}
                        alt="Left Wing"
                        className="-z-10
                                w-[160px] h-[400px] translate-y-[-20px]
                                sm:w-[300px] sm:h-[600px] sm:translate-y-[-80px]
                                md:w-[350px] md:h-[800px] md:translate-y-[-120px]
                                lg:w-[500px] lg:h-[1000px] lg:translate-y-[-160px]
                                xl:w-[630px] xl:h-[1237px] xl:translate-y-[-210px]
                                2xl:w-[700px] 2xl:h-[1300px] 2xl:translate-y-[-220px]"
                    />
                    <img
                        src={RightWing}
                        alt="Right Wing"
                        className="-z-10
                                w-[160px] h-[400px] translate-y-[-20px]
                                sm:w-[300px] sm:h-[600px] sm:translate-y-[-80px]
                                md:w-[350px] md:h-[800px] md:translate-y-[-120px]
                                lg:w-[500px] lg:h-[1000px] lg:translate-y-[-160px]
                                xl:w-[630px] xl:h-[1237px] xl:translate-y-[-210px]
                                2xl:w-[700px] 2xl:h-[1300px] 2xl:translate-y-[-220px]"
                    />
                </div>
            </div>

            {/* Banner & Teks */}
            <div className="relative w-full pt-32 z-30
                            sm:pt-36
                            md:pt-40
                            lg:pt-46
                            xl:pt-46
                            2xl:pt-46">
                <img
                    src={Banner}
                    alt="Hero Section"
                    className="w-full "
                />
                <div className="absolute inset-10 flex items-center justify-center translate-x-4 translate-y-15">
                    <img
                        src={MerchandiseTeks2}
                        alt="Merchandise Teks"
                        className="w-[75%] -translate-x-2 -translate-y-1
                                sm:w-[80%] sm:translate-y-0
                                md:w-[80%] md:translate-y-1
                                lg:w-[75%] lg:translate-y-4
                                xl:w-auto xl:translate-y-0
                                2xl:w-[60%] 2xl:-translate-y-4"/>
                </div>
            </div>

            {/* Teks */}
            <div className="text-center text-[#281F65] leading-[1.2] 
                        text-[16px]
                        sm:text-[22px]
                        md:text-[25px]
                        lg:text-[30px]
                        xl:text-[35px]
                        2xl:text-[43px]">
                <p>UMN FESTIVAL 2025</p>
                <p>OFFICIAL MERCHANDISE LINE</p>
            </div>
        </section>
    );
}
