import React, { useEffect, useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import BackgroundSection from "../Layouts/Home/BackgroundSection";
import Hero from "../Layouts/EventUnveiling/Hero";
import PaperDescription from '../Layouts/EventUnveiling/PaperDescription';
import ImageSection from '../Layouts/EventUnveiling/ImageSection';
import EventUpComingDetails from "../Layouts/Merchandise/EventUpComingDetails";
import IntroductionSection from "../Layouts/Event/IntroductionSection";
import SponsorMedparSection from '../Layouts/EventUnveiling/SponsorMedparSection';
import UnderConstruction from '../Components/UnderConstruction';

export default function EventUcare() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await fetch('/api/event-pages/ucare');
                const data = await response.json();
                if (data.success) {
                    setPageData(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFC22F]"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!pageData || !pageData.is_active) {
        return <UnderConstruction />;
    }

    return (
        <MainLayout>
            <BackgroundSection bgColor={pageData.bg_color || "#FFC22F"} />
            <Hero heroSrc={pageData.hero_src} />
            <PaperDescription paperSrc={pageData.paper_src} />
            <ImageSection 
                images={pageData.unveiling_images || []} 
                background={pageData.image_section_bg}
            />
            <SponsorMedparSection
                boardSrc="/resources/images/SponsorMedparWood.svg"
                textSrc="/resources/images/SponsorMedparText.png"
                sponsorSrc={pageData.sponsor_src}
                medparSrc={pageData.medpar_src}
            />
            <div className="bg-[#B42129] pb-8 pt-20 mt-15">
                <EventUpComingDetails />
            </div>
            <IntroductionSection bgColor={pageData.bg_color || "#FFC22F"} borderColor="#B42129" />
        </MainLayout>
    );
}
