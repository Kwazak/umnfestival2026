import React from "react";
import MainLayout from "../Layouts/MainLayout";
import BackgroundMerchandise from "../Layouts/Merchandise/BackgroundMerchandise";
import HeroMerchandise from "../Layouts/Merchandise/HeroMerchandise";
import PackageNavbar from "../Layouts/Merchandise/PackageNavbar";
import SinglePurchase from "../Layouts/Merchandise/SinglePurchase";
import BundlingPackage from "../Layouts/Merchandise/BundlingPackage";
import BundlingPackageDetails from "../Layouts/Merchandise/BundlingPackageDetails";
import IntroductionMerchandise from "../Layouts/Merchandise/IntroductionMerchandise";
import EventIUpComing from "../Layouts/Merchandise/EventUpComing";
import EventIUpComingDetails from "../Layouts/Merchandise/EventUpComingDetails";
import SinglePurchaseDetails from "../Layouts/Merchandise/SinglePurchaseDetails";

export default function Merchandise() {
    return (
        <MainLayout>
                <BackgroundMerchandise />

                <HeroMerchandise />
                <PackageNavbar />
                
                <div className="bg-[#42B5B5]">                    
                    <SinglePurchase />
                    <SinglePurchaseDetails/>
                    <BundlingPackage />
                    <BundlingPackageDetails />
                </div>

                <div className="bg-[#281F65]">
                    <IntroductionMerchandise />
                </div>

                <EventIUpComing />
                <EventIUpComingDetails />
        </MainLayout>
    );
}
