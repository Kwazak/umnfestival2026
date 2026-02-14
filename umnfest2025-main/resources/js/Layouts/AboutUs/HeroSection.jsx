import PapanTitle from "../../../images/Wood_Tag_AboutUs.svg";
import Pohon from "../../../images/pohon.svg";

export default function HeroSection() {
    return (
        <div className="relative w-full bg-[#FFC22F] overflow-hidden lg:min-h-screen">
            {/* Background pohon */}
            <div className="pt-50 lg:pt-0">
                <img 
                    src={Pohon}
                    alt="Background Hutan" 
                    className="w-full h-auto lg:h-screen object-cover" 
                />
            </div>

            {/* Papan kayu + tulisan */}
            <div className="absolute top-[60%] lg:top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-4">
                <div className="relative w-full max-w-[85%] mx-auto">
                    <img 
                        src={PapanTitle}
                        alt="Papan Kayu"
                        className="w-full h-auto"
                    />
                    
                    {/* Teks yang tetap besar tapi responsive */}
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p 
                            className="
                                text-[40px]
                                sm:text-[80px]
                                md:text-7xl
                                lg:text-[120px]
                                xl:text-[140px]
                                2xl:text-[160px]
                                text-white font-serif text-center leading-tight break-words max-w-[100%] sm:max-w-[80%]
                            "
                            style={{ fontFamily: "Timed" }}
                        >
                            ABOUT US
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
