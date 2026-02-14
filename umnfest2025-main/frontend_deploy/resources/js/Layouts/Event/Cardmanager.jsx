import React, { useState, useEffect } from "react";
import { Button, MiniButton } from "../../Components";
import line from "../../../images/line.png";
import unveilingCard from "../../../images/unveilingcard.png";
import eulympicCard from "../../../images/eulympiccard.png";
import ucareCard from "../../../images/ucarecard.png";
import lockedCard from "../../../images/lockedcard.png";
import pohonEvents from "../../../images/pohonEventCard.png";
import woodTag from "../../../images/WoodTagArchive.svg";
import umnFestivalTitle from "../../../images/UMN_FESTIVAL_2025.svg";
import eventsActivities from "../../../images/EVENTS AND ACTIVITIES.svg";

// NOTE: This file was synchronized with Home/EventCardSection.jsx except the banner section with id="judul" was intentionally omitted per request.
export default function EventCardSection() {
    const [flippedCards, setFlippedCards] = useState({});
    const [cardData, setCardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/event-upcoming-details');
            const data = await response.json();
            if (data.success) {
                const mappedCards = data.data.map((event, index) => {
                    let fallbackImage = lockedCard;
                    let className = "locked";
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
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Error loading events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleCardClick = (cardId) => {
        setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    const renderCardFront = (card) => (
        <div className="w-full h-full relative overflow-hidden rounded-lg">
            <img src={card.frontImage} alt={card.title} className="w-full h-full object-cover" />
        </div>
    );

    const renderCardBack = (card) => {
        if (card.className === "locked") {
            return (
                <div className="w-full h-full rounded-lg flex flex-col justify-center items-center p-6" style={{ backgroundColor: "#A9A9A9" }}>
                    <h3 className="text-center font-bold leading-tight" style={{ color: "#555555", fontSize: "18px" }}>
                        SOMETHING MAGICAL IS COMING SOON...
                    </h3>
                </div>
            );
        }
        return (
            <div className="w-full h-full bg-white rounded-lg flex flex-col justify-center items-center p-6">
                <h3 className="text-center text-xl font-bold text-gray-800 mb-4">{card.title}</h3>
                <div className="flex items-center justify-center mb-4 w-full">
                    <img src={line} alt="line" className="flex-shrink-0" />
                </div>
                <p className="text-center text-gray-700 mb-6 leading-relaxed" style={{ fontSize: "13px", lineHeight: "1.5" }} dangerouslySetInnerHTML={{ __html: card.description }} />
                <MiniButton onClick={(e) => { e.stopPropagation(); if (card.link && card.link !== '/') { window.location.href = card.link; } }}>Pelajari Lebih Lanjut</MiniButton>
            </div>
        );
    };

    if (loading) {
        return (
            <section className="pt-12 md:pt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading events...</div>
                    </div>
                </div>
                <div>
                    <img src={pohonEvents} alt="Pohon Events" className="w-[100%] object-contain mt-1" />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="pt-12 md:pt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-red-600">{error}</div>
                    </div>
                </div>
                <div>
                    <img src={pohonEvents} alt="Pohon Events" className="w-[100%] object-contain mt-1" />
                </div>
            </section>
        );
    }

    return (
        <section className="pt-12 md:pt-16">
            <div className="relative mx-auto w-full max-w-3xl sm:mb-16 md:mb-20 lg:mb-24">
            {/* Wood background */}
            <img
                src={woodTag}
                alt="Wood Tag"
                className="w-full h-auto object-contain select-none pointer-events-none mb-10 sm:mb-0"
            />

            {/* Overlay texts (now sized relative to the wood width) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                <img
                src={umnFestivalTitle}
                alt="UMN Festival 2025"
                className="w-[80%] md:w-[72%] mb-2"
                />
                <img
                src={eventsActivities}
                alt="Events and Activities"
                className="w-[70%] md:w-[60%]"
                />
            </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="hidden lg:flex lg:justify-center lg:gap-[65px] pb-10 mt-40 lg:mt-0">
                    {cardData.slice(0, 3).map(card => (
                        <div key={card.id} className="relative cursor-pointer transition-all duration-300 ease-in-out" onClick={() => handleCardClick(card.id)} style={{ aspectRatio: "3/4", width: "calc((100% - 130px) / 3)", maxWidth: "300px" }}>
                            <div className={`w-full h-full absolute transition-all duration-500 ease-in-out ${flippedCards[card.id] ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ pointerEvents: flippedCards[card.id] ? "none" : "auto" }}>
                                {renderCardFront(card)}
                            </div>
                            <div className={`w-full h-full absolute transition-all duration-500 ease-in-out ${flippedCards[card.id] ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ pointerEvents: flippedCards[card.id] ? "auto" : "none" }}>
                                {renderCardBack(card)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="hidden lg:flex lg:justify-center lg:gap-[65px]">
                    {cardData.slice(3, 5).map(card => (
                        <div key={card.id} className="relative cursor-pointer transition-all duration-300 ease-in-out" onClick={() => handleCardClick(card.id)} style={{ aspectRatio: "3/4", width: "calc((100% - 65px) / 2)", maxWidth: "300px" }}>
                            <div className={`w-full h-full absolute transition-all duration-500 ease-in-out ${flippedCards[card.id] ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ pointerEvents: flippedCards[card.id] ? "none" : "auto" }}>
                                {renderCardFront(card)}
                            </div>
                            <div className={`w-full h-full absolute transition-all duration-500 ease-in-out ${flippedCards[card.id] ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ pointerEvents: flippedCards[card.id] ? "auto" : "none" }}>
                                {renderCardBack(card)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="block lg:hidden space-y-3 mx-2 md:mx-20">
                    {cardData.slice(0, 5).map(card => (
                        <div key={card.id} className={`flex w-full rounded-2xl drop-shadow-md overflow-hidden ${card.locked ? "bg-gray-200" : "bg-white"}`} style={{ height: "100%" }}>
                            <div className={`w-[40%] h-full relative flex items-center justify-center ${card.className === "locked" ? "bg-[#A9A9A9]" : "bg-white"}}`}>
                                {card.locked ? (
                                    <img src={card.frontImage} alt={card.title} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <img src={card.frontImage} alt={card.title} className="w-full h-full object-cover rounded-2xl" />
                                )}
                            </div>
                            <div className={`w-[60%] px-4 md:px-6 flex flex-col justify-center gap-1 sm:gap-2 md:gap-3 ${card.className === "locked" ? "bg-[#A9A9A9]" : ""}`}>                                
                                {card.className === "locked" ? (
                                    <p style={{ color: "#555555" }} className="font-bold w-full text-[15px] sm:text-[20px] md:text-[25px]">SOMETHING MAGICAL IS COMING SOON ...</p>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-[#1F5A9F] font-bold w-full text-[15px] sm:text-[20px] md:text-[25px]">{card.title}</p>
                                        </div>
                                        <div className="line-clamp-3 text-sm text-gray-600 font-medium text-[13px] sm:text-[15px] md:text-[16px]" dangerouslySetInnerHTML={{ __html: card.description }} />
                                        <div className="mt-2">
                                            <button href={card.link && card.link !== '/' ? card.link : "/about"} className="text-white bg-[#B42129] rounded-full cursor-pointer hover:bg-[#892026] transition-all duration-200 w-[130px] h-[26px] text-[13px] sm:w-[160px] sm:h-[32px] sm:text-[16px] md:w-[165px] md:h-[37px] md:text-[17px]">Pelajari Lebih Lanjut</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <img src={pohonEvents} alt="Pohon Events" className="w-[100%] object-contain mt-1" />
            </div>
        </section>
    );
}