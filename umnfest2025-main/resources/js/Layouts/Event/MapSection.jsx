import React from "react";
import mapImage from "../../../images/MAPS_1.svg";
import woodenPlank from "../../../images/Wood_Tag_1.svg";
import mapText from "../../../images/TheMapOfQuestText.png"; // assuming it's PNG
export default function MapSection() {
    return (
        <div
            className="relative w-full bg-[#FDBF2D] px-4 flex flex-col items-center
                       pt-16 pb-16 sm:pt-16 sm:pb-16 md:pt-32 md:pb-20"
        >
            {/* Wooden Plank Title */}
            <div
                className="w-full flex flex-col items-center relative
                           md:absolute md:top-24 md:left-1/2 md:-translate-x-1/2 md:z-10
                           md:w-[90%] md:max-w-[700px]"
            >
                <div className="relative w-full max-w-[500px] md:max-w-none">
                    <img
                        src={woodenPlank}
                        alt="Wooden Plank Background"
                        className="w-full h-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <img
                            src={mapText}
                            alt="The Map of Quest Text"
                            className="w-3/4 xs:w-2/3 sm:w-1/2 md:w-2/3 max-w-[500px]"
                        />
                    </div>
                </div>
            </div>

            {/* The Map */}
            <div
                className="w-full max-w-5xl relative z-0
                           mt-10 md:mt-52"
            >
                <img
                    src={mapImage}
                    alt="Map of Quest"
                    className="w-full h-auto drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
                />
            </div>
        </div>
    );
}
