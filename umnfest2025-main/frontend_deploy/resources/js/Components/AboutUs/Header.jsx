import fotoDivisi1 from "../../../images/FotoDivisi1.jpg";
import fotoDivisi2 from "../../../images/fotoDivisi2.jpg";
import fotoDivisi3 from "../../../images/fotoDivisi3.jpg";
import fotoDivisi4 from "../../../images/fotoDivisi4.jpg";

export default function HeaderDivision() {
    return (
        <div className="w-[90%] flex justify-center items-start">
            <div className="w-full max-w-full ">
                {/* Desktop */}
                <div className="hidden lg:block relative bg-[#FAD65A] text-center rounded-[40px] px-8 md:py-16 lg:py-24 2xl:py-32 overflow-hidden group">
                    <h1 className="text-5xl md:text-6xl lg:text-8xl xl:text-[90px] 2xl:text-[120px] font-bold text-[#1253A0] leading-none">
                        MEET THE TEAM
                    </h1>
                    <p className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-semibold text-[#1253A0] mt-4">
                        Behind UMN Festival 2025
                    </p>

                    {/* Hover Images */}
                    <div className="absolute inset-0 pointer-events-none">
                        <img
                            src={fotoDivisi1}
                            alt="team"
                            className="absolute top-[-30px] top-[-40px] 2xl:top-[-50px] left-[-30px] w-40 lg:w-50 xl:w-60 2xl:w-72 rotate-[-15deg] border-[10px] xl:border-[14px] 2xl:border-[20px] border-[#8B2500]
                            transform translate-y-[-100%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300"
                        />
                        <img
                            src={fotoDivisi4}
                            alt="team"
                            className="absolute bottom-[-60px] lg:bottom-[-90px] 2xl:bottom-[-100px] 
                            left-[20px] lg:left-[20px] xl:left-[-1%] 2xl:left-[40px] 
                            w-48 lg:w-64 xl:w-72 2xl:w-90 rotate-[10deg] border-[10px] xl:border-[14px] 2xl:border-[20px] border-[#8B2500]
                            transform translate-y-[100%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300"
                        />
                        <img
                            src={fotoDivisi2}
                            alt="team"
                            className="absolute top-[-80px] right-[70px] w-36 lg:w-48 xl:w-56 2xl:w-64 rotate-[20deg] border-[10px] xl:border-[14px] 2xl:border-[20px] border-[#8B2500]
                            transform translate-x-[100%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-300"
                        />
                        <img
                            src={fotoDivisi3}
                            alt="team"
                            className="absolute bottom-[-60px] right-[-70px] w-52 lg:w-60 xl:w-72 2xl:w-81 rotate-[-20deg] border-[10px] xl:border-[14px] 2xl:border-[20px] border-[#8B2500]
                            transform translate-y-[100%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300"
                        />
                    </div>
                </div>

                {/* Mobile & Tablet */}
                <div className="block lg:hidden relative bg-[#FAD65A] text-center rounded-[24px] px-4 py-12 sm:px-6 sm:py-14 overflow-hidden">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1253A0] leading-tight">
                        MEET THE TEAM
                    </h1>
                    <p className="text-base sm:text-lg md:text-2xl font-semibold text-[#1253A0] mt-2">
                        Behind UMN Festival 2025
                    </p>

                    <div className="absolute inset-0 pointer-events-none">
                        <img
                            src={fotoDivisi1}
                            alt="team"
                            className="absolute top-[-20px] left-[-20px] w-24 
                            sm:w-32 md:w-36 md:border-4 rotate-[-15deg] border-[6px] border-[#8B2500]"
                        />
                        <img
                            src={fotoDivisi4}
                            alt="team"
                            className="absolute bottom-[-40px] left-[0px] w-28 
                            sm:w-36 rotate-[10deg] border-[6px] 
                            md:w-42 md:bottom-[-50px] md:left-[0px] md:border-[8px] 
                            border-[#8B2500]"
                        />
                        <img
                            src={fotoDivisi2}
                            alt="team"
                            className="absolute top-[-40px] right-[20px] w-24 s
                            m:w-32 rotate-[20deg] border-[6px] border-[#8B2500]"
                        />
                        <img
                            src={fotoDivisi3}
                            alt="team"
                            className="absolute bottom-[-40px] right-[-30px] w-32 sm:w-40 rotate-[-20deg] border-[6px] border-[#8B2500]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
