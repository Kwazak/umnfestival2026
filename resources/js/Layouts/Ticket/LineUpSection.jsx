import React, { useState, useEffect } from "react";
import realityClub from "../../../images/reality-club.webp";
import GuestStarBanner from "../../../images/GuestStarBanner.svg";
import ComingSoonText from "../../../images/ComingSoon.svg";
import realityClubText from "../../../images/RealityClubText.svg";

const LineUpSection = () => {
    const [guestStars, setGuestStars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fallback data in case API fails
    const fallbackGuestStars = [
        {
            id: 1,
            name: "Reality Club",
            image: realityClub,
            is_revealed: true,
            below_image: realityClubText,
        },
        {
            id: 2,
            name: "Coming Soon",
            image: null,
            is_revealed: false,
            below_image: ComingSoonText,
        },
        {
            id: 3,
            name: "Coming Soon",
            image: null,
            is_revealed: false,
            below_image: ComingSoonText,
        },
    ];

    useEffect(() => {
        const fetchGuestStars = async () => {
            try {
                const response = await fetch('/api/guest-stars');
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Map API data to include fallback images for local assets
                    const mappedData = data.data.map(star => ({
                        ...star,
                        // Use local images as fallback for below_image if URL is not accessible
                        below_image: star.below_image || (star.is_revealed ? realityClubText : ComingSoonText),
                        // Use local image as fallback for main image if needed
                        image: star.image || (star.is_revealed && star.name === "Reality Club" ? realityClub : null)
                    }));
                    setGuestStars(mappedData);
                } else {
                    throw new Error('Failed to fetch guest stars');
                }
            } catch (err) {
                console.error('Error fetching guest stars:', err);
                setError(err.message);
                // Use fallback data
                setGuestStars(fallbackGuestStars);
            } finally {
                setLoading(false);
            }
        };

        fetchGuestStars();
    }, []);

    // Show loading state
    if (loading) {
        return (
            <div id="lineup-section" className="bg-[#281F65] pt-8 pb-25 px-4">
                <div className="max-w-7xl mx-auto">
                    <img
                        src={GuestStarBanner}
                        alt="Line Up Guest Stars"
                        className="w-full mt-12 sm:mt-16 md:mt-20"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full border-12 bg-gray-300 animate-pulse" />
                                <div className="mt-4 w-32 h-8 bg-gray-300 animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="lineup-section" className="bg-[#281F65] pt-8 pb-25 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <img
                    src={GuestStarBanner}
                    alt="Line Up Guest Stars"
                    className="w-full mt-12 sm:mt-16 md:mt-20"
                />

                {/* Guest Stars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
                    {guestStars.map((star) => (
                        <div
                            key={star.id}
                            className="flex flex-col items-center group"
                        >
                            {/* 2. Elemen Lingkaran (Bagian Atas) - PRESISI SESUAI SPESIFIKASI */}
                            <div className="relative transition-all duration-300 ease-in-out group-hover:drop-shadow-2xl" style={{"--tw-drop-shadow": "drop-shadow(0 0 20px rgb(251 228 119 / 0.4))"}}>
                                {/* Lingkaran sempurna dengan isi emas/kuning solid dan datar + border F3C019 */}
                                <div
                                    className="w-48 h-48 sm:w-70 sm:h-70 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full border-12 overflow-hidden"
                                    style={{
                                        backgroundColor: "#D3BD55", // Isi emas/kuning solid dan datar
                                        borderColor: "#F3C019", // Border warna F3C019
                                    }}
                                >
                                    {star.is_revealed && star.image ? (
                                        // Item Pertama: Reality Club dengan file gambar (jika ada)
                                        <img
                                            src={star.image}
                                            alt={star.name}
                                            className="w-full h-full object-cover pointer-events-none"
                                            onError={(e) => {
                                                // Fallback jika gambar tidak ada - tetap emas solid
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    ) : null}
                                    {/* Untuk Coming Soon atau fallback Reality Club: sudah diisi warna emas dari background */}
                                </div>
                            </div>

                            {/* 3. Elemen Label Nama (Bagian Bawah) - PRESISI SESUAI SPESIFIKASI */}
                            <img 
                                src={star.below_image} 
                                alt="" 
                                className="-mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] max-w-full z-10 transition-all duration-300 ease-in-out group-hover:drop-shadow-2xl" 
                                style={{"--tw-drop-shadow": "drop-shadow(-10px 0 15px rgb(251 228 119 / 0.4)) drop-shadow(10px 0 15px rgb(251 228 119 / 0.4))"}}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LineUpSection;
