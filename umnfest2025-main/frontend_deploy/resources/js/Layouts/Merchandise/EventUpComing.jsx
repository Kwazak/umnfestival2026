import React from "react";
import PaperTag from "../../../images/Merchandise/Paper-tag-2.webp"
import PaperText from "../../../images/Merchandise/UpComing-text.webp"

export default function EventIUpComing() {
    return (
        <section className="flex justify-center items-center pt-15 pb-10 lg:pt-20 lg:pb-15">
            <div className="h-auto w-full
                            sm:w-[600px]
                            md:w-[720px]
                            lg:w-[900px]
                            xl:w-[1150px]">
                <img
                    src={PaperTag}
                    alt="Paper Tag"
                    className="w-full"
                />
            </div>
            <div className="z-10 absolute w-70
                            sm:w-100
                            md:w-130
                            lg:w-170
                            xl:w-210   
                            2xl:">
                <img
                    src={PaperText}
                    alt="Paper Text"
                    className="w-full"
                />
            </div>
        </section>
    );
}