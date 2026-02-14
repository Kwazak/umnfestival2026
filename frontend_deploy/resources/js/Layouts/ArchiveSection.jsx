import React, { useState, useEffect } from "react";
import PapanTitle from "/resources/images/WoodTagArchive.svg";

export default function ArchiveSection() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideoIndex, setActiveVideoIndex] = useState(null);

    // Fetch videos from API
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/archive-videos');
            const data = await response.json();
            
            if (data.success) {
                // Filter out any video whose title is "upcoming events" (case-insensitive, ignore surrounding whitespace)
                const filtered = (data.data || []).filter(v => {
                    const t = (v?.title || '').trim().toLowerCase();
                    return t !== 'upcoming events';
                });
                setVideos(filtered);
            } else {
                setError('Failed to load archive videos');
            }
        } catch (error) {
            setError('Error loading archive videos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // Handle video click
    const handleVideoClick = (idx) => {
        setActiveVideoIndex(idx);
    };

    // Loading state
    if (loading) {
        return (
            <section className="relative w-full py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
                <div className="relative mx-auto mb-20 w-full max-w-[90%] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px]">
                    <img src={PapanTitle} alt="Papan Judul" className="w-full h-auto" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p
                            className="text-white text-center font-serif font-light drop-shadow-lg
                                       text-[18px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px]
                                       leading-tight"
                            style={{ fontFamily: "Timed" }}
                        >
                            UMN FESTIVAL 2025 ARCHIVES
                        </p>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-700">Loading archive videos...</div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="relative w-full py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
                <div className="relative mx-auto mb-20 w-full max-w-[90%] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px]">
                    <img src={PapanTitle} alt="Papan Judul" className="w-full h-auto" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p
                            className="text-white text-center font-serif font-light drop-shadow-lg
                                       text-[18px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px]
                                       leading-tight"
                            style={{ fontFamily: "Timed" }}
                        >
                            UMN FESTIVAL 2025 ARCHIVES
                        </p>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-700">{error}</div>
                </div>
            </section>
        );
    }

    // No videos state
    if (videos.length === 0) {
        return (
            <section className="relative w-full py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
                <div className="relative mx-auto mb-20 w-full max-w-[90%] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px]">
                    <img src={PapanTitle} alt="Papan Judul" className="w-full h-auto" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p
                            className="text-white text-center font-serif font-light drop-shadow-lg
                                       text-[18px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px]
                                       leading-tight"
                            style={{ fontFamily: "Timed" }}
                        >
                            UMN FESTIVAL 2025 ARCHIVES
                        </p>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-700">No archive videos available</div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative w-full py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
            {/* Banner Papan Kayu */}
            <div className="relative mx-auto mb-10 w-full max-w-[90%] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px]">
                <img src={PapanTitle} alt="Papan Judul" className="w-full h-auto" loading="lazy" decoding="async" />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <p
                        className="text-white text-center font-serif font-light drop-shadow-lg
                                   text-[16.5px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px]
                                   leading-tight"
                        style={{ fontFamily: "Timed" }}
                    >
                        UMN FESTIVAL 2025 ARCHIVES
                    </p>
                </div>
            </div>

            {/* Video Thumbnails / Players */}
            <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full">
                {videos.map((vid, idx) => (
                    <div
                        key={vid.id || idx}
                        className={`relative aspect-video overflow-hidden shadow-2xl group cursor-pointer transition-transform duration-300
                                    ${activeVideoIndex !== idx ? "lg:hover:scale-[1.02]" : ""}`}
                        onClick={() => handleVideoClick(idx, vid)}
                    >
                        {activeVideoIndex === idx ? (
                            <div className="w-full h-full relative bg-black">
                                {/* SIMPLE IFRAME - Most basic approach */}
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${vid.videoId}`}
                                    title={vid.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                />
                            
                                
                                {/* Close button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveVideoIndex(null);
                                    }}
                                    className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full z-10"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                
                                {/* YouTube link */}
                                <a
                                    href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm z-10"
                                >
                                    Open in YouTube
                                </a>
                            </div>
                        ) : (
                            <>
                                <img
                                    src={vid.thumbnail}
                                    alt={vid.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                        e.target.src = `https://img.youtube.com/vi/${vid.videoId}/maxresdefault.jpg`;
                                    }}
                                />
                                <div
                                    className="absolute top-4 left-0 bg-[#A42128] text-white
                                               px-4 sm:px-6 md:px-10 lg:px-12 py-2
                                               rounded-r-full text-[10px] sm:text-sm md:text-base lg:text-lg
                                               font-light tracking-wide shadow-md z-10"
                                >
                                    {vid.title}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center z-0 bg-black/30">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            className="w-6 h-6 sm:w-8 sm:h-8"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}