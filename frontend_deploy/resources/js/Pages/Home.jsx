import React from "react";
import MainLayout from "../Layouts/MainLayout";
import BackgroundSection from "../Layouts/Home/BackgroundSection";
import HeroSection from "../Layouts/Home/HeroSection";
import IntroductionSection from "../Layouts/Home/IntroductionSection";
import EventCardSection from "../Layouts/Home/EventCardSection";
import CountdownSection from "../Layouts/Home/CountdownSection";
import ClosingSection from "../Layouts/Home/ClosingSection";
import ClosingSection2 from "../Layouts/Home/ClosingSection2";
import textumnfest from "../../images/textumnfest.webp";
import Footer from "../Components";
import DeferRender from "../Components/DeferRender";
// Lazily load the heavy ArchiveSection to reduce initial render cost
const ArchiveSection = React.lazy(() => import("../Layouts/ArchiveSection"));

export default function Home() {
    return (
        <MainLayout>
            <BackgroundSection />
            <HeroSection />
            <IntroductionSection />
            <EventCardSection />
            <CountdownSection />
            <ClosingSection />
            <ClosingSection2 />
            <DeferRender>
                <React.Suspense fallback={null}>
                    <ArchiveSection />
                </React.Suspense>
            </DeferRender>
            <section className="bg-[#42B5B5] px-4 py-12 sm:py-14">
                <div className="max-w-6xl mx-auto flex justify-center">
                    <img
                        src="/imgs/sponsormedpar.webp"
                        alt="Sponsors and Media Partners"
                        className="w-full max-w-5xl h-auto drop-shadow-md"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            </section>
        </MainLayout>
    );
}
