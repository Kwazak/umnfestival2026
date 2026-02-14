import MainLayout from "../Layouts/MainLayout"
import BackgroundSection from "../Layouts/AboutUs/BackgroundSection"
import HeroSection from "../Layouts/AboutUs/HeroSection"
import VisionMission from "../Layouts/AboutUs/VisionMissionSection"
import DivisionSection from "../Layouts/AboutUs/DivisionSection"
import KegiatanSection from "../Layouts/AboutUs/KegiatanSection"
import AboutUMNFest from "../Layouts/AboutUs/AboutUMNFestSection"
import HeaderDivision from "../Components/AboutUs/Header"
import ArchiveSection from "../Layouts/ArchiveSection"

export default function AboutUs(){
    return (
        <>
            <MainLayout>
                <BackgroundSection/>
                <HeroSection/>
                <AboutUMNFest/>
                <KegiatanSection/>
                {/* <HeaderDivision/> */}
                <DivisionSection/>
                <ArchiveSection/>
            </MainLayout>
        </>
    )
}