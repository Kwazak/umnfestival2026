import React from 'react';
import WoodBackground from '../../../images/WoodBackground.webp';
import TicketHero from '../../../images/TicketHeroSection.webp';
import TextHero from '../../../images/TextHeroSection.webp';
import SwordTopRight from '../../../images/SwordTopRight.svg';
import SwordBottomLeft from '../../../images/SwordBottomLeft.svg';

const HeroSection = () => {
    return (
        <div 
            className="min-h-[60vh] sm:min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative pt-20 pb-20"
            style={{
                backgroundImage: `url(${WoodBackground})`,
            }}
        >
            {/* SVG Image - Top Right Corner */}
            <img
                src={SwordTopRight}
                alt="Decorative SVG Top Right"
                className="absolute top-10 right-0 w-[25%] z-index-20"
            />
            
            {/* Content Container */}
            <div className="flex flex-col items-center justify-center gap-8 md:gap-12 lg:gap-16 px-4">
                {/* First Placeholder Image */}
                <img
                                        src={TicketHero}
                                        alt="Ticket"
                                        className="w-full mt-15 sm:mt-12"
                                    />

                {/* Second Placeholder Image */}
                <img
                                        src={TextHero}
                                        alt="UNIFY 2025 Festival"
                                        className="w-[70%] mt-[-7vw] md:-[-8vw] lg:mt-[-7vw] xl:mt-[-6vw] "
                                    />
            </div>

            {/* SVG Image - Bottom Left Corner */}
            <img
                src={SwordBottomLeft}
                alt="Decorative SVG Bottom Left"
                className="absolute bottom-[-10.5vw] left-0 w-[25%] z-index-20"
            />

            {/* Optional Overlay for better readability */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        </div>
    );
};

export default HeroSection;