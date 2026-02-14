import React from 'react';
import MainLayout from '../Layouts/MainLayout';
import BackgroundSection from "../Layouts/Home/BackgroundSection";
import CountdownSection from "../Layouts/Event/CountdownSection";
import IntroductionSection from "../Layouts/Event/IntroductionSection";
import CardManager from "../Layouts/Event/Cardmanager";
import MapSection from"../Layouts/Event/MapSection";
import Eventhero from"../Layouts/Event/Eventhero";
import Upcoming_Events from "../Layouts/Event/Upcoming_events";
import topLeftDragon from "../../images/Vector.svg";
import bottomRightDragon from "../../images/Vector_1.svg";

export default function Event() {
    return (
        <MainLayout>
            {/* prevent horizontal overflow caused by absolute positioned elements */}
            <div className="overflow-x-hidden">
                <BackgroundSection />
                <Eventhero />
                <Upcoming_Events />
                <MapSection />

                {/* naga atas kiri */}
                <div className="relative w-full">
                    <img
                        src={topLeftDragon}
                        alt="Top Left Dragon"
                        className="absolute -top-[90px] left-[-40px] w-[180px] md:w-[200px] lg:w-[300px] h-auto z-20"
                    />
                </div>

                <CountdownSection />

                {/* naga bawah kanan*/}
                <div className="relative w-full">
                    <img
                        src={bottomRightDragon}
                        alt="Bottom Right Dragon"
                        className="absolute -bottom-[90px] right-[-40px] w-[180px] md:w-[200px] lg:w-[300px] h-auto z-20"
                    />
                </div>

                <CardManager />
                <IntroductionSection borderColor="#FFC22F" />
            </div>
        </MainLayout>
    );
}

