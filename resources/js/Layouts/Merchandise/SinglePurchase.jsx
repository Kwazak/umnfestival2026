import React from "react";
import Keychain1 from "../../../images/Merchandise/Keychain-top-left.webp"
import Keychain2 from "../../../images/Merchandise/Keychain-bot-left.webp"
import Keychain3 from "../../../images/Merchandise/Keychain-bot-right.webp"
import Keychain4 from "../../../images/Merchandise/Keychain-top-right.webp"
import Totebag from "../../../images/Merchandise/Totebag-bot-left.webp"
import Landyard from "../../../images/Merchandise/Lanyard-bot-left.webp"
import TShirt from "../../../images/Merchandise/T-Shirt-bot-right.webp"
import Kipas from "../../../images/Merchandise/Kipas-top-right.webp"

export default function SinglePurchase() {
    return (
        <section className="w-full px-4
                            py-4
                            sm:py-5
                            md:py-6 
                            lg:py-7 
                            xl:py-8 xl:pt-16">
            <div id="single-purchase" className="invisible h-0 scroll-mt-[120px]"></div>
            <div className="relative bg-[#BA2129] flex items-center justify-center rounded-3xl mx-auto
                            w-full h-[134px]
                            sm:w-[600px] sm:h-[145px]
                            md:w-[720px] md:h-[174px]
                            lg:w-[900px] lg:h-[218px]
                            xl:w-[1150px] xl:h-[278px]
                            group overflow-hidden transition-all duration-500">

                <p className="font-museum text-[#FFD54B] tracking-[3%]
                            text-[25px]
                            sm:text-[36px]
                            md:text-[44px]
                            lg:text-[55px]
                            xl:text-[70px]">
                    SINGLE PURCHASE
                </p>

                {/* Hidden Photos - Shown on hover */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <img
                        src={Keychain1}
                        alt="Keychain1"
                        className="absolute w-20 sm:w-28 md:w-34 lg:w-38 xl:w-41
                        top-[-40px] left-[60px] md:left-[75px] lg:left-[95px] rotate-[-15deg] 
                        transform
                        lg:translate-x-[100%]
                        lg:translate-y-[-100%]
                        group-hover:translate-x-0
                        group-hover:translate-y-0
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    <img
                        src={Totebag}
                        alt="Totebag"
                        className="absolute w-15 sm:w-18 md:w-24 lg:w-28 xl:w-31
                        top-[15px] xl:top-[25px] left-[-15px] rotate-[17deg] 
                        transform
                        lg:translate-x-[-100%]
                        lg:translate-y-[-50%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500"
                    />

                    <img
                        src={Landyard}
                        alt="Landyard"
                        className="absolute w-20 sm:w-28 md:w-34 lg:w-38 xl:w-41
                        bottom-[-80px] sm:bottom-[-100px] md:bottom-[-135px] left-[15px] sm:left-[25px] md:left-[40px] lg:left-[50px] rotate-[35deg] 
                        transform
                        lg:translate-x-[-100%]
                        lg:translate-y-[100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500"
                    />

                    <img
                        src={Keychain2}
                        alt="Keychain2"
                        className="absolute w-20 sm:w-28 md:w-34 lg:w-38 xl:w-41
                        bottom-[-30px] sm:bottom-[-50px] md:bottom-[-58px] left-[110px] sm:left-[170px] md:left-[210px] lg:left-[255px] rotate-[31.69deg] 
                        transform
                        lg:translate-x-[50%]
                        lg:translate-y-[100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    <img
                        src={Keychain3}
                        alt="Keychain3"
                        className="absolute w-8 sm:w-8 md:w-12 lg:w-16 xl:w-20
                        bottom-[-10px] md:bottom-[-25px] lg:bottom-[-43px] right-[115px] sm:right-[170px] md:right-[190px] lg:right-[210px] rotate-[-42.4deg] 
                        transform
                        lg:translate-x-[-150%]
                        lg:translate-y-[100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />

                    <img
                        src={TShirt}
                        alt="TShirt"
                        className="absolute w-30 sm:w-51 md:w-59 lg:w-63 xl:w-67
                        bottom-[-30px] sm:bottom-[-60px] lg:bottom-[-50px] xl:bottom-[-25px] right-[-30px] sm:right-[-60px] rotate-[-13.23deg] 
                        transform
                        lg:translate-x-[50%]
                        lg:translate-y-[100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500"
                    />

                    <img
                        src={Kipas}
                        alt="Kipas"
                        className="absolute w-16 sm:w-20 md:w-28 lg:w-32 xl:w-36
                        top-[-10px] sm:top-[-40px] right-[-10px] md:right-[-20px] rotate-[-67.06deg] 
                        transform
                        lg:translate-x-[100%]
                        lg:translate-y-[-100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500"
                    />

                    <img
                        src={Keychain4}
                        alt="Keychain4"
                        className="absolute w-10 sm:w-10 md:w-16 lg:w-20 xl:w-24
                        top-[-10px] md:top-[-20px] right-[70px] sm:right-[90px] md:right-[140px] rotate-[-7.8deg] 
                        transform
                        lg:translate-x-[-100%]
                        lg:translate-y-[-100%]
                        group-hover:translate-x-0 
                        group-hover:translate-y-0 
                        transition-all duration-500
                        drop-shadow-[0_0_6px_#FFF187]"
                    />
                </div>
            </div>
        </section>
    );
}