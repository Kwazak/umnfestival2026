import React, { useState, useEffect } from "react";
import { Button, MiniButton, HeadText, Text } from "../../Components";
import line from "../../../images/line.png";
import unveilingCard from "../../../images/unveilingcard.png";
import eulympicCard from "../../../images/eulympiccard.png";
import ucareCard from "../../../images/ucarecard.png";
import lockedCard from "../../../images/lockedcard.png";
import titleEvents from "../../../images/umnfestevents.png";
import pohonEvents from "../../../images/pohonEventCard.png";

export default function EventCardSection() {
    const [flippedCards, setFlippedCards] = useState({});
    const [cardData, setCardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/event-upcoming-details');
            const data = await response.json();
            
            if (data.success) {
                // Map API data to component format with fallback images
                const mappedCards = data.data.map((event, index) => {
                    let fallbackImage = lockedCard;
                    let className = "locked";
                    
                    // Use fallback images for known events
                    if (!event.isLocked) {
                        if (event.key === '1' || event.title.includes('UNVEILING')) {
                            fallbackImage = unveilingCard;
                            className = "unveiling";
                        } else if (event.key === '2' || event.title.includes('E-ULYMPIC')) {
                            fallbackImage = eulympicCard;
                            className = "eulympic";
                        } else if (event.key === '3' || event.title.includes('U-CARE')) {
                            fallbackImage = ucareCard;
                            className = "ucare";
                        } else {
                            className = "default";
                        }
                    }
                    
                    return {
                        id: index + 1,
                        frontImage: event.image || fallbackImage,
                        title: event.title,
                        description: event.description,
                        className: event.isLocked ? "locked" : className,
                        locked: event.isLocked,
                        link: event.link
                    };
                });
                
                setCardData(mappedCards);
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

    const handleCardClick = (cardId, className) => {
        setFlippedCards((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }));
    };

    const renderCardFront = (card) => (
        <div className="w-full h-full relative overflow-hidden rounded-lg">
            <img
                src={card.frontImage}
                alt={card.title}
                className="w-full h-full object-cover"
            />
        </div>
    );

    const renderCardBack = (card) => {
        if (card.className === "locked") {
            return (
                <div
                    className="w-full h-full rounded-lg flex flex-col justify-center items-center p-6"
                    style={{ backgroundColor: "#A9A9A9" }}
                >
                    <h3
                        className="text-center font-bold leading-tight"
                        style={{ color: "#555555", fontSize: "18px" }}
                    >
                        SOMETHING MAGICAL IS COMING SOON...
                    </h3>
                </div>
            );
        }

        return (
            <div className="w-full h-full bg-white rounded-lg flex flex-col justify-center items-center p-6">
                <h3 className="text-center text-xl font-bold text-gray-800 mb-4">
                    {card.title}
                </h3>

                <div className="flex items-center justify-center mb-4 w-full">
                    <img src={line} alt="line" className="flex-shrink-0" />
                </div>

                <p
                    className="text-center text-gray-700 mb-6 leading-relaxed"
                    style={{ fontSize: "13px", lineHeight: "1.5" }}
                    dangerouslySetInnerHTML={{ __html: card.description }}
                />

                <MiniButton 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (card.link && card.link !== '/') {
                            window.location.href = card.link;
                        }
                    }}
                >
                    Pelajari Lebih Lanjut
                </MiniButton>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <section className="pt-12 md:pt-16">
                <div className="flex justify-center sm:mb-16 md:mb-20 lg:mb-24">
                    <img
                        src={titleEvents}
                        alt="Title Events"
                        className="w-[100%] object-contain mb-10"
                    />
                </div>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading events...</div>
                    </div>
                </div>
                <div>
                    <img
                        src={pohonEvents}
                        alt="Pohon Events"
                        className="w-[100%] object-contain mt-1"
                    />
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="pt-12 md:pt-16">
                <div className="flex justify-center sm:mb-16 md:mb-20 lg:mb-24">
                    <img
                        src={titleEvents}
                        alt="Title Events"
                        className="w-[100%] object-contain mb-10"
                    />
                </div>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-red-600">{error}</div>
                    </div>
                </div>
                <div>
                    <img
                        src={pohonEvents}
                        alt="Pohon Events"
                        className="w-[100%] object-contain mt-1"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="pt-12 md:pt-16">
            {/* Banner */}
            <div className="flex justify-center sm:mb-16 md:mb-20 lg:mb-24" id="judul">
                <img
                    src={titleEvents}
                    alt="Title Events"
                    className="w-[100%] object-contain mb-10"
                />
            </div>

            {/* Card */}
            <div className="max-w-7xl mx-auto">
                {/* Display */}
                <div className="hidden lg:flex lg:justify-center lg:gap-[65px] pb-10 mt-40 lg:mt-0">
                    {cardData.slice(0, 3).map((card) => (
                        <div
                            key={card.id}
                            className="relative cursor-pointer transition-all duration-300 ease-in-out"
                            onClick={() =>
                                handleCardClick(card.id, card.className)
                            }
                            style={{
                                aspectRatio: "3/4",
                                width: "calc((100% - 130px) / 3)",
                                maxWidth: "300px",
                            }}
                        >
                            <div
                                className={`w-full h-full absolute transition-all duration-500 ease-in-out ${
                                    flippedCards[card.id]
                                        ? "opacity-0 scale-95"
                                        : "opacity-100 scale-100"
                                }`}
                                style={{
                                    pointerEvents: flippedCards[card.id]
                                        ? "none"
                                        : "auto",
                                }}
                            >
                                {renderCardFront(card)}
                            </div>
                            <div
                                className={`w-full h-full absolute transition-all duration-500 ease-in-out ${
                                    flippedCards[card.id]
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-95"
                                }`}
                                style={{
                                    pointerEvents: flippedCards[card.id]
                                        ? "auto"
                                        : "none",
                                }}
                            >
                                {renderCardBack(card)}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Hidden */}
                <div className="hidden lg:flex lg:justify-center lg:gap-[65px]">
                    {cardData.slice(3, 5).map((card) => (
                        <div
                            key={card.id}
                            className="relative cursor-pointer transition-all duration-300 ease-in-out"
                            onClick={() =>
                                handleCardClick(card.id, card.className)
                            }
                            style={{
                                aspectRatio: "3/4",
                                width: "calc((100% - 65px) / 2)",
                                maxWidth: "300px",
                            }}
                        >
                            <div
                                className={`w-full h-full absolute transition-all duration-500 ease-in-out ${
                                    flippedCards[card.id]
                                        ? "opacity-0 scale-95"
                                        : "opacity-100 scale-100"
                                }`}
                                style={{
                                    pointerEvents: flippedCards[card.id]
                                        ? "none"
                                        : "auto",
                                }}
                            >
                                {renderCardFront(card)}
                            </div>
                            <div
                                className={`w-full h-full absolute transition-all duration-500 ease-in-out ${
                                    flippedCards[card.id]
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-95"
                                }`}
                                style={{
                                    pointerEvents: flippedCards[card.id]
                                        ? "auto"
                                        : "none",
                                }}
                            >
                                {renderCardBack(card)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Responsive */}
                <div className="block lg:hidden space-y-3 mx-2 md:mx-20">
                    {cardData.slice(0, 5).map((card) => (
                        <div
                            key={card.id}
                            className={`
                                flex w-full rounded-2xl drop-shadow-md overflow-hidden
                                ${card.locked ? "bg-gray-200" : "bg-white"}`}
                            style={{ height: "100%" }}
                        >
                            {/* Image */}
                            <div
                                className={`w-[40%] h-full relative flex items-center justify-center 
                                ${card.className === "locked" ? "bg-[#A9A9A9]": "bg-white"}}`}
                            >
                                {card.locked ? (
                                    // Locked
                                    <img
                                        src={card.frontImage}
                                        alt={card.title}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    // Unlocked
                                    <img
                                        src={card.frontImage}
                                        alt={card.title}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                )}
                            </div>
                            
                            {/* Description */}
                            <div
                                className={`w-[60%] px-4 md:px-6 flex flex-col justify-center gap-1 sm:gap-2 md:gap-3 ${
                                    card.className === "locked"
                                        ? "bg-[#A9A9A9]"
                                        : ""
                                }`}
                            >
                                {card.className === "locked" ? (
                                    // Locked
                                    <>
                                        <p style={{ color: "#555555" }} className="font-bold w-full 
                                                            text-[15px] 
                                                            sm:text-[20px] 
                                                            md:text-[25px]">
                                            SOMETHING MAGICAL IS COMING SOON ...
                                        </p>
                                    </>
                                ) : (
                                    // Unlocked
                                    <>
                                        {/* Title */}
                                        <div className="">
                                            <p className="text-[#1F5A9F] font-bold w-full 
                                                            text-[15px] 
                                                            sm:text-[20px] 
                                                            md:text-[25px]">
                                                {card.title}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div 
                                            className="line-clamp-3 text-sm text-gray-600 font-medium
                                            text-[13px]
                                            sm:text-[15px]
                                            md:text-[16px]"
                                            dangerouslySetInnerHTML={{ __html: card.description }}
                                        />

                                        {/* Button */}
                                        <div className="mt-2">
                                            <a href={(card.link && card.link !== '/') ? card.link : "/about"}
                                               className="text-white bg-[#B42129] rounded-full cursor-pointer inline-flex items-center justify-center
                                                          hover:bg-[#892026] transition-all duration-200
                                                          w-[130px] h-[26px] text-[13px]
                                                          sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                                          md:w-[165px] md:h-[37px] md:text-[17px]">
                                                Pelajari Lebih Lanjut
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pohon Image */}
            <div>
                <img
                    src={pohonEvents}
                    alt="Pohon Events"
                    className="w-[100%] object-contain mt-1"
                />
            </div>

        </section>
    );
}
