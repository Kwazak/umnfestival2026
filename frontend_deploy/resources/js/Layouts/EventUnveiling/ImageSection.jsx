import React, { useRef, useState, useEffect } from "react";

// Allow parent to pass custom images array and background via props
export default function ImageDetails({ images: externalImages, background }) {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const images = externalImages && externalImages.length > 0 ? externalImages : [
        "/imgs/unveiling/unveiling1.jpg",
        "/imgs/unveiling/unveiling2.jpg",
        "/imgs/unveiling/unveiling3.jpg",
        "/imgs/unveiling/unveiling4.jpg",
        "/imgs/unveiling/unveiling5.jpg",
        "/imgs/unveiling/unveiling6.jpg",
        "/imgs/unveiling/unveiling7.jpg",
        "/imgs/unveiling/unveiling8.jpg"
    ];

    // show 2 images per viewport (frame)
    const IMAGES_PER_VIEW = 2;

    // Scroll by one page (viewport) where a page contains IMAGES_PER_VIEW images
    const scrollToGroup = (groupIndex) => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;
        const pageWidth = scrollEl.clientWidth; // width of one "frame"
        const scrollX = groupIndex * pageWidth;
        scrollEl.scrollTo({ left: scrollX, behavior: "smooth" });
        setActiveIndex(groupIndex);
    };

    const scrollLeft = () => {
        const newIndex = Math.max(activeIndex - 1, 0);
        scrollToGroup(newIndex);
    };

    const scrollRight = () => {
        const pages = Math.ceil(images.length / IMAGES_PER_VIEW);
        const maxGroup = Math.max(pages - 1, 0);
        const newIndex = Math.min(activeIndex + 1, maxGroup);
        scrollToGroup(newIndex);
    };

    const handleScroll = () => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;
        const pageWidth = scrollEl.clientWidth;
        const index = Math.round(scrollEl.scrollLeft / pageWidth);
        setActiveIndex(index);
    };

    useEffect(() => {
        const scrollEl = scrollRef.current;
        scrollEl.addEventListener("scroll", handleScroll);
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, []);

    // Determine background style
    const getBackgroundStyle = () => {
        if (!background) {
            return { backgroundColor: '#49bfc0' }; // default color
        }
        
        // Check if it's a color (starts with # or is a named color)
        if (background.startsWith('#') || background.match(/^(rgb|rgba|hsl|hsla)\(/)) {
            return { backgroundColor: background };
        }
        
        // Check if it's a URL or path (assume it's an image)
        if (background.includes('/') || background.includes('.')) {
            return { 
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        }
        
        // Otherwise treat as CSS background value
        return { background: background };
    };

    return (
        <div 
            className="relative flex flex-col items-center justify-center gap-6 py-10 pt-20 my-5"
            style={getBackgroundStyle()}
        >
            {/* Left Arrow */}
            <button
                onClick={scrollLeft}
                className="absolute left-2 z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❮
            </button>

            {/* Scrollable Image Container */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 px-4 mx-auto overflow-hidden w-full max-w-[1200px]"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="snap-start flex-shrink-0 h-[400px] bg-gray-300 rounded-lg overflow-hidden"
                        // force each item to occupy 50% of the scroll container so exactly 2 items are visible per frame
                        style={{ minWidth: '50%', maxWidth: '50%' }}
                    >
                        <img
                            src={img}
                            alt={`Image ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            <button
                onClick={scrollRight}
                className="absolute right-2 z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 text-[20px] hover:scale-110 transition-transform duration-200"
            >
                ❯
            </button>

            {/* Pagination Dots */}
            <div className="flex gap-2 mt-2">
                {Array.from({ length: Math.ceil(images.length / IMAGES_PER_VIEW) }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollToGroup(i)}
                        className="w-3 h-3 md:w-5 md:h-5 rounded-full focus:outline-none"
                        style={{
                            backgroundColor: activeIndex === i ? "#012550" : "#1253a0"
                        }}
                        aria-label={`go to page ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
