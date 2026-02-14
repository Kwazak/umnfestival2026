import React, { useState, useEffect } from "react";
import EulympicPromo from "../../../images/eulympicpromotional.webp";

export default function ClosingSection() {
    const [closingData, setClosingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClosingData = async () => {
            try {
                const response = await fetch('/api/closing-section');
                const data = await response.json();
                
                if (data.success) {
                    setClosingData(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch closing section data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClosingData();
    }, []);

    // Helper function to process text with line breaks and bold formatting
    const processText = (text) => {
        if (!text) return '';
        
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    // Use default data if API data is not available
    const defaultData = {
        image_url: EulympicPromo,
        head_text: 'E-ULYMPIC 2025',
        content_text: `E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat mahasiswa/i UMN maupun di luar UMN dalam perlombaan cabang olahraga E-Sport.

Open Registration : 6 – 16 May 2025
Terbuka untuk 64 Teams Mahasiswa, SMA / Sederajat

Event Day : 19 – 23 May 2025
Venue : Lobby B, Universitas Multimedia Nusantara`,
        button1_text: 'Daftar Sekarang',
        button1_link: '#',
        button2_text: 'Pelajari Lebih Lanjut',
        button2_link: '#',
        is_active: true
    };

    const data = closingData || defaultData;

    if (loading) {
        return (
            <section className="w-full px-4 py-12 mt-0">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </section>
        );
    }

    // Don't render if data is not active
    if (closingData && !closingData.is_active) {
        return null;
    }
    return (
        <section className="w-full px-4 py-12 mt-0">

            <div className="flex flex-col lg:flex-row
                            w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                            h-auto
                            lg:h-[400px] xl:h-[500px]
                            rounded-2xl lg:rounded-3xl
                            overflow-hidden shadow-lg
                            bg-white
                            mb-8 lg:mb-24 lg:mt-24 border-[#B42129] border-4">

                {/* Left Image */}
                <div className="
                    w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                    h-[320px] lg:h-full
                    relative
                    lg:border-r
                ">
                    <img
                        src={data.image_url}
                        alt={data.head_text}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.target.src = EulympicPromo;
                        }}
                    />
                </div>
                
                {/* Right */}
                <div
                    className="
                    w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                    px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 lg:py-12
                    flex flex-col justify-center
                    gap-4 lg:gap-6
                    text-center lg:text-left
                "
                >
                    {/* Title */}
                    <div className="text-left">
                        <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">
                            {data.head_text}
                        </p>
                    </div>

                    {/* Description */}
                    <div
                        className="
                        text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify
                                        text-[13px]
                                        sm:text-[15px]
                                        md:text-[16px]
                                        lg:text-[17px]
                                        xl:text-[19px]
                    "
                    >
                        {processText(data.content_text)}
                    </div>

                    <div className="flex  sm:flex-row lg:justify-start gap-3 sm:gap-4 mt-3">
                        <button 
                            onClick={() => {
                                if (data.button1_link && data.button1_link !== '#') {
                                    if (data.button1_link.startsWith('http')) {
                                        window.open(data.button1_link, '_blank');
                                    } else {
                                        window.location.href = data.button1_link;
                                    }
                                }
                            }}
                            className="text-white bg-[#B42129] rounded-full cursor-pointer
                                            hover:bg-[#892026] transition-all duration-200
                                            w-[160px] h-[32px] text-[15px]
                                            sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                            md:w-[165px] md:h-[37px] md:text-[17px]
                                            lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                            xl:w-[222px] xl:h-[44px] xl:text-[22px]"
                        >
                            {data.button1_text}
                        </button>

                        <button
                            onClick={() => {
                                if (data.button2_link && data.button2_link !== '#') {
                                    if (data.button2_link.startsWith('http')) {
                                        window.open(data.button2_link, '_blank');
                                    } else {
                                        window.location.href = data.button2_link;
                                    }
                                }
                            }}
                            className="text-white bg-[#B42129] rounded-full cursor-pointer
                                        hover:bg-[#892026] transition-all duration-200
                                        w-[160px] h-[32px] text-[15px]
                                        sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                        md:w-[165px] md:h-[37px] md:text-[17px]
                                        lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                        xl:w-[222px] xl:h-[44px] xl:text-[22px]"
                        >
                            {data.button2_text}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}