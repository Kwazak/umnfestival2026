import React from "react";
import Heraklid from "../../../images/Merchandise/Heraklid-Bundling-Merch.webp";
import Herakles from "../../../images/Merchandise/Herakles-Bundling-Merch.webp";
import Cadmus from "../../../images/Merchandise/Cadmus-Bundling-Merch.webp";

export default function BundlingPackage() {
    return (
        <section className="w-full px-4 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
            <div id="bundling-package" className="invisible h-0 scroll-mt-[120px]"></div>
            <div className="relative bg-[#BA2129] flex items-center justify-center rounded-3xl mx-auto
                        w-full h-[134px]
                        sm:w-[600px] sm:h-[145px]
                        md:w-[720px] md:h-[174px]
                        lg:w-[900px] lg:h-[218px]
                        xl:w-[1150px] xl:h-[278px]
                        group overflow-hidden transition-all duration-500">
                {/* Text */}
                <p className="font-museum text-[#FFD54B] tracking-[3%]
                            text-[25px]
                            sm:text-[36px]
                            md:text-[44px]
                            lg:text-[55px]
                            xl:text-[70px]">
                    BUNDLING PACKAGE
                </p>

                {/* Hidden Photos - Shown on hover */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Top Left - Heraklid */}
                    <img
                        src={Heraklid}
                        alt="Heraklid"
                        className="absolute w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60
                        top-[-40px] left-[-20px] rotate-[30deg] 
                        transform
                        lg:translate-x-[-100%]
                        lg:translate-y-[-100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    {/* Bottom Left - Herakles */}
                    <img
                        src={Herakles}
                        alt="Herakles"
                        className="absolute w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60
                        bottom-[-40px] md:bottom-[-60px] left-[-25px] rotate-[10deg] 
                        transform 
                        lg:translate-x-[-100%]
                        lg:translate-y-[100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    {/* Top Right - Herakles */}
                    <img
                        src={Herakles}
                        alt="Herakles"
                        className="absolute w-22 sm:w-32 md:w-40 lg:w-48 xl:w-56
                        top-[-12px] right-[-20px] md:right-[-30px]
                        transform 
                        lg:translate-x-[100%]
                        lg:translate-y-[-100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    {/* Bottom Right - Cadmus */}
                    <img
                        src={Cadmus}
                        alt="Cadmus"
                        className="absolute w-40 sm:w-48 md:w-56 lg:w-[270px] xl:w-80
                        bottom-[-40px] md:bottom-[-50px] right-[-20px] rotate-[-15deg] 
                        transform 
                        lg:translate-y-[100%]
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />
                </div>
            </div>
        </section>
    );
}