import React from "react";
import headerImage from "../../../images/Header_Event.png";
import yellowAirLeft from "../../../images/yellow_air_left.svg";
import yellowAirRight from "../../../images/yellow_air_right.svg";

const Header_Event = () => {
    return (
        <div className="relative w-full bg-[#fbbd08] pt-24 lg:pt-15 xl:pt-15 pb-10 overflow-hidden flex justify-center items-center">

            {/* Left Yellow Air */}
            <img
                src={yellowAirLeft}
                alt="Yellow Air Left Top"
                className="absolute left-0 top-0 w-[20vw] max-w-[200px] sm:w-[25vw] md:w-[18vw] lg:w-[15vw] object-contain"
            />
            <img
                src={yellowAirLeft}
                alt="Yellow Air Left Bottom"
                className="absolute left-0 bottom-0 w-[20vw] max-w-[200px] sm:w-[25vw] md:w-[18vw] lg:w-[15vw] object-contain"
            />

            {/* Right Yellow Air */}
            <img
                src={yellowAirRight}
                alt="Yellow Air Right Top"
                className="absolute right-0 top-0 w-[20vw] max-w-[200px] sm:w-[25vw] md:w-[18vw] lg:w-[15vw] object-contain"
            />
            <img
                src={yellowAirRight}
                alt="Yellow Air Right Bottom"
                className="absolute right-0 bottom-0 w-[20vw] max-w-[200px] sm:w-[25vw] md:w-[18vw] lg:w-[15vw] object-contain"
            />

            {/* Header Image */}
            <img
                src={headerImage}
                alt="Event Header"
                className="relative z-10 w-full max-w-screen-xl mx-auto"
            />
        </div>
    );
};

export default Header_Event;
