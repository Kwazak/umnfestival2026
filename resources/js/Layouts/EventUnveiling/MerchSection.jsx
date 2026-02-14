import React from "react";
import { HeadText, Text, Button } from "../../Components";
import merchPromotional from "../../../images/MerchPromotional.svg";

export default function MerchSection() {
    return (
        <section className="w-full px-4 mt-16 lg:mt-42 lg:mb-1">
            <div
                className="
                    flex flex-col lg:flex-row
                    w-full max-w-2xl lg:max-w-6xl mx-auto
                    h-auto
                    lg:h-[500px]
                    rounded-2xl lg:rounded-3xl
                    overflow-hidden shadow-lg
                    bg-white lg:bg-white
                    border border-[#F8CB4C] border-3
                "
            >
                <div
                    className="
                        w-full lg:w-5/12
                        bg-[#90C3D4]
                        h-[300px] md:h-[500px] lg:h-full
                        rounded-none lg:rounded-l-3xl
                        relative
                "
                >
                    <div
                        className="
                        relative w-full h-full
                        bg-gray-300
                        rounded-none lg:rounded-lg
                        flex items-center justify-center
                    "
                    >
                        <img
                            src={merchPromotional}
                            alt="UMN Festival Introduction"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div
                    className="
                    w-full lg:w-1/2
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20
                    py-8 lg:py-12
                    flex flex-col justify-center gap-6 lg:gap-8
                    text-center lg:text-left
                "
                >
                    <div className="text-center lg:text-left">
                        <HeadText>GRAB YOUR MERCH !</HeadText>
                    </div>

                    <Text textAlign="justify">
                        Yuk, tunjukkan semangatmu dalam merayakan <strong>
                        UMN FESTIVAL 2025</strong> dengan memiliki merchandise 
                        dengan desain fresh, kualitas premium, dan tentunya... 
                        edisi <strong>FRESH</strong> yang bakal bikin kamu beda 
                        dari yang lain!
                    </Text>

                    <div className="flex justify-center lg:justify-start">
                        <Button href="/merchandise">Pelajari Lebih Lanjut</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
