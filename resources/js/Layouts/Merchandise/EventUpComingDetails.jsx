import React, { useRef, useState, useEffect } from "react";
// Use optimized raster images instead of extremely heavy SVGs
import Unveiling from "../../../images/unveilingcard.webp";
import EUlympic from "../../../images/eulympiccard.webp";
import UCare from "../../../images/ucarecard.webp";
import Locked from "../../../images/Merchandise/Locked-card.webp";

export default function EventIUpComingDetails() {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/event-upcoming-details');
            const data = await response.json();
            
            if (data.success) {
                // Map API data to component format with fallback images
                const mappedCards = data.data.map((event) => {
                    let fallbackImage = null;
                    
                    // Use fallback images for known events
                    if (event.key === '1' || event.title.includes('UNVEILING')) {
                        fallbackImage = Unveiling;
                    } else if (event.key === '2' || event.title.includes('E-ULYMPIC')) {
                        fallbackImage = EUlympic;
                    } else if (event.key === '3' || event.title.includes('U-CARE')) {
                        fallbackImage = UCare;
                    }
                    
                    return {
                        key: event.key,
                        image: event.image || fallbackImage,
                        alt: event.alt,
                        title: event.title,
                        description: event.description,
                        isLocked: event.isLocked,
                        link: event.link
                    };
                });
                
                setCards(mappedCards);
            } else {
                setError('Failed to load events');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Error loading events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollEl = scrollRef.current;
            scrollEl.addEventListener("scroll", handleScroll);
            return () => scrollEl.removeEventListener("scroll", handleScroll);
        }
    }, [cards]);

    // Loading state
    if (loading) {
        return (
            <section className="relative flex flex-col items-center justify-center gap-6 sm:gap-4 pb-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading events...</div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="relative flex flex-col items-center justify-center gap-6 sm:gap-4 pb-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-600">{error}</div>
                </div>
            </section>
        );
    }

    // No events state
    if (cards.length === 0) {
        return (
            <section className="relative flex flex-col items-center justify-center gap-6 sm:gap-4 pb-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">No events available</div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative flex flex-col items-center justify-center gap-6 sm:gap-4 pb-8">
            <button
                onClick={scrollLeft}
                className="absolute left-0 lg:left-15 z-10 w-8 h-8 mb-2 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❮
            </button>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 px-4 mx-auto overflow-hidden
                            w-full
                            sm:w-[600px]
                            md:w-[720px]
                            lg:w-[900px]
                            xl:w-[1150px]"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {cards.map((card) => {
                    const actualImage = card.isLocked ? Locked : card.image;
                    const actualAlt = card.isLocked ? "Locked card" : card.alt;

                    return (
                        <div
                            key={card.key}
                            className={`flex flex-col flex-shrink-0 rounded-3xl overflow-hidden ${card.isLocked ? "bg-[#A9A9A9]" : "bg-white"} snap-center
                            w-[284px] ${card.isLocked ? "max-h-[450px]" : "h-[400px]"}
                            sm:w-[500px] sm:h-[420px]
                            md:w-[700px] md:h-[244px] md:flex-row
                            lg:w-[814px] lg:h-[304px]
                            xl:w-[856px] xl:h-[320px]`}
                        >
                            <div className="relative shrink-0 overflow-hidden 
                                w-full h-[150px]
                                sm:w-[500px] sm:h-[200px]
                                md:w-auto md:h-auto">
                                <img
                                    src={actualImage}
                                    alt={actualAlt}
                                    className="w-full h-full object-cover object-[center_45%] scale-102"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className={`${card.isLocked ? "flex flex-col justify-center" : ""} w-auto px-9 h-full
                                sm:px-12 ${card.isLocked ? "py-10 md:py-8 sm:tracking-wider" : "py-6 sm:py-8 tracking-wide relative sm:pr-20 md:py-10 lg:py-12"}`}
                            >
                                <div className={`${card.isLocked
                                    ? "text-[#555555] mb-1 font-bold w-full sm:leading-8 sm:pr-20 lg:pr-25 text-[18px] sm:text-[21px] md:text-[28px] lg:text-[30px] xl:text-[35px]"
                                    : "text-[#1F5A9F] mb-1 md:mb-2 lg:mb-3 font-bold w-full text-[15px] sm:text-[18px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12"}`}>
                                    <p>{card.title}</p>
                                </div>

                                {!card.isLocked && (
                                    <>
                                        <div className="text-[#1F5A9F] leading-tight font-medium
                                            text-[13px]
                                            sm:text-[14px]
                                            md:text-[15px]
                                            lg:text-[17px]
                                            xl:text-[19px]">
                                            <p dangerouslySetInnerHTML={{ __html: card.description }} />
                                        </div>

                                        <button 
                                            onClick={() => window.location.href = card.link}
                                            className="text-white bg-[#881E11] rounded-full cursor-pointer
                                                        hover:bg-[#620E04] transition-all duration-200 font-light
                                                        w-[100px] h-[23px] text-[12px]
                                                        sm:w-[116px] sm:h-[26px] sm:text-[13.5px]
                                                        md:w-[128px] md:h-[28px] md:text-[14.3px]
                                                        lg:w-[147px] lg:h-[33px] lg:text-[17.1px]
                                                        xl:w-[155px] xl:h-[35px] xl:text-[18px]
                                                        absolute bottom-8 left-9
                                                        sm:bottom-9 sm:left-12 
                                                        lg:bottom-12">
                                            PELAJARI →
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={scrollRight}
                className="absolute right-0 lg:right-15 z-10 w-8 h-8 mb-2 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❯
            </button>

            <div className="flex gap-2 mt-2">
                {cards.map((_, i) => (
                    <span
                        key={i}
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                        style={{ backgroundColor: activeIndex === i ? "#F3C019" : "#FFE89B" }}
                    />
                ))}
            </div>
        </section>
    );
}
