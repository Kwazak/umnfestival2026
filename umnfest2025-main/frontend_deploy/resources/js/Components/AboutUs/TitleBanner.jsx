import Banner from "../../../images/BannerHeader.svg";

export default function TitleBanner({ title }) {
    return (
        <>
            {/* Dekstop */}
            <div className="hidden md:flex relative mb-6 w-full justify-center">
                <div className="relative w-full flex justify-center">
                    <img 
                        src={Banner}
                        alt="Title Banner"
                        className="w-sm sm:w-lg md:w-md 2xl:w-[600px] h-auto"
                    />
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        text-white text-sm sm:text-md md:text-2xl lg:text-4xl 2xl:text-5xl 
                        font-bold tracking-wide text-center">
                        {title}
                    </p>
                </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden relative mb-6 w-full justify-center">
                <div className="relative w-72 flex justify-center">
                    <img 
                        src={Banner}
                        alt="Title Banner"
                        className="w-full h-auto"
                    />
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        text-white text-sm font-semibold tracking-wide text-center">
                        {title}
                    </p>
                </div>
            </div>
        </>
    );
}
