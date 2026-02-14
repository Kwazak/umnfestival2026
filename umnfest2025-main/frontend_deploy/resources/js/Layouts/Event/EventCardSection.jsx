import React, { useState } from "react";
import { Button, MiniButton, HeadText, Text } from "../../Components";
import line from "../../../images/line.png";
import unveilingCard from "../../../images/unveilingcard.png";
import eulympicCard from "../../../images/eulympiccard.png";
import lockedCard from "../../../images/lockedcard.png";
import titleEvents from "../../../images/umnfestevents.png";

export default function EventCardSection() {
    const [flippedCards, setFlippedCards] = useState({}); // Sample card data - replace with your actual data
    const cardData = [
        {
            id: 1,
            frontImage: unveilingCard,
            title: "UNVEILING 2025",
            description:
                "Sebagai acara pembuka dari UMN Festival 2025 yang berguna untuk memperkenalkan kegiatan UMN Festival, meningkatkan kesadaran mahasiswa/i UMN mengenai kegiatan UMN Festival dan menandakan bahwa kegiatan UMN Festival 2025 telah dimulai.",
            className: "unveiling",
        },
        {
            id: 2,
            frontImage: eulympicCard,
            title: "Event Title 2",
            description:
                "E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat dari mahasiswa/i UMN maupun mahasiswa dan siswa lainnya dalam perlombaan cabang olahraga E-Sports.",
            className: "eulympic",
        },
        {
            id: 3,
            frontImage: lockedCard,
            title: "Event Title 3",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
            className: "locked",
        },
        {
            id: 4,
            frontImage: lockedCard,
            title: "Event Title 4",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
            className: "locked",
        },
        {
            id: 5,
            frontImage: lockedCard,
            title: "Event Title 5",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
            className: "locked",
        },
    ];
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
                >
                    {card.description}
                </p>

                <MiniButton onClick={(e) => e.stopPropagation()}>
                    Pelajari Lebih Lanjut
                </MiniButton>
            </div>
        );
    };

    return (
        <section className="pt-12 lg:mt-28 md:py-12 px-4 md:px-8">
            <div className="flex justify-center mt-3 md:mt-8 mb-10">
                <img
                    src={titleEvents}
                    alt="Title Events"
                    className="w-[90%] md:w-[90%] lg:w-[70%] object-contain"
                />
            </div>
            <div className="max-w-7xl mx-auto">
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

                <div className="block lg:hidden space-y-3 mx-2 md:mx-20">
                    {cardData.slice(0, 5).map((card) => (
                        <div
                            key={card.id}
                            className={`
                flex w-full rounded-2xl shadow-md overflow-hidden
                ${card.locked ? "bg-gray-200" : "bg-white"}
            `}
                            style={{ height: "100%" }}
                        >
                            <div
                                className={`w-[40%] h-full relative flex items-center justify-center ${
                                    card.className === "locked"
                                        ? "bg-[#A9A9A9]"
                                        : "bg-white"
                                }

                                }`}
                            >
                                {card.locked ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V9a4 4 0 10-8 0v2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                        />
                                    </svg>
                                ) : (
                                    <img
                                        src={card.frontImage}
                                        alt={card.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <div
                                className={`w-[60%] p-4 flex flex-col justify-center ${
                                    card.className === "locked"
                                        ? "bg-[#A9A9A9]"
                                        : ""
                                }`}
                            >
                                {card.className === "locked" ? (
                                    <>
                                        <HeadText style={{ color: "#555555" }}>
                                            SOMETHING MAGICAL IS COMING SOON ...
                                        </HeadText>
                                    </>
                                ) : (
                                    <>
                                        <HeadText className="mb-2">
                                            {card.title}
                                        </HeadText>
                                        <Text className="line-clamp-3">
                                            {card.description}
                                        </Text>
                                        <div className="mt-2">
                                            <Button href="/ticket">
                                                Pelajari Lebih Lanjut
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
