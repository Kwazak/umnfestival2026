import TitleBanner from "./TitleBanner";

export default function PaperDesc({ title, subheader, text }) {
    return (
        <>
            {/* Dekstop */}
            <div className="hidden sm:hidden md:block lg:block text-center px-4 sm:px-6 md:px-10 py-4 text-[#2C2C2C]">
                <TitleBanner title={title} style="w-full max-w-[300px] md:max-w-[511px] mx-auto" />
                
                <h2 className="text-sm sm:text-lg md:text-2xl lg:text-4xl text-[#1F5A9F] mt-4 font-semibold">
                    “{subheader}”
                </h2>
                
                <p className="mt-6 
                    text-xs sm:text-base md:text-xl lg:text-2xl 2xl:text-3xl text-[#1F5A9F] 
                    max-w-4xl 2xl:max-w-5xl  mx-auto font-medium leading-relaxed">
                    {text}
                </p>
            </div>

            {/* Mobile */}
            <div className="block md:hidden text-center px-6 sm:px-6 md:px-10 py-2 text-[#2C2C2C]">
                <TitleBanner title={title} style="w-full max-w-[300px] md:max-w-[511px] mx-auto" />

                <h2 className="text-base md:text-xl lg:text-3xl text-[#1F5A9F] mt-4 font-semibold">
                    “{subheader}”
                </h2>

                <p className="mt-4
                    text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#1F5A9F]
                    max-w-[80%] md:max-w-3xl mx-auto font-medium leading-relaxed">
                    {text}
                </p>
            </div>
        </>
    );
}
