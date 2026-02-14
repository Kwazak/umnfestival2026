import React from "react";
import merchImg from "../../../images/merchandiseClosing.webp";
import rc from "../../../images/Merchandise/reality-club.webp";

export default function ClosingSection2() {
    return (
        <section className="relative w-full px-4 lg:py-36 py-20 mt-0 lg:mt-0 top-0">
            <div className="w-full"> 
                {/* Banner 1 */}
                <div className="
                    flex flex-col lg:flex-row
                    w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                    h-auto
                    lg:h-[380px] xl:h-[425px]
                    rounded-2xl lg:rounded-3xl
                    overflow-hidden shadow-lg
                    bg-white
                    border-[5px] border-[#B42129]
                ">

                    {/* Bagian kiri/atas - Gambar */}
                    <div className="
                        w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                        h-[320px] lg:h-full
                        relative
                        lg:border-r lg:border-black
                    ">
                        <img
                            src={merchImg}
                            alt="GRAB YOUR MERCH!"
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    {/* Bagian kanan/bawah - Konten */}
                    <div className="
                        w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                        px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12
                        flex flex-col 
                        gap-4 lg:gap-6
                        text-center text-left justify-center
                    ">
                        {/* Head Text */}
                        <div className="lg:text-left">
                            <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">
                                GRAB YOUR MERCH!
                            </p>
                        </div>

                        {/* Description Text */}
                        <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify
                                        text-[13px]
                                        sm:text-[15px]
                                        md:text-[16px]
                                        lg:text-[17px]
                                        xl:text-[19px]">
                            Yuk, tunjukkan semangatmu dalam merayakan
                            <strong> UMN FESTIVAL 2025</strong> dengan memiliki
                            merchandise dengan desain fresh, kualitas premium, dan
                            tentunya... edisi<strong> TERBATAS </strong>yang bakal
                            bikin kamu beda dari yang lain!
                        </div>

                        {/* Button */}
                        <div className="flex lg:justify-start mt-3">
                                <a href="/merchandise" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                                hover:bg-[#892026] transition-all duration-200
                                                w-[160px] h-[32px] text-[15px]
                                                sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                                md:w-[165px] md:h-[37px] md:text-[17px]
                                                lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                                xl:w-[222px] xl:h-[44px] xl:text-[22px]">
                                    Pelajari Lebih Lanjut
                                </a>
                        </div>
                    </div>
                </div>

                {/* Banner 2 */}
                <div className="
                    flex flex-col lg:flex-row
                    w-full sm:w-[576px] md:w-[691px] lg:w-[922px] xl:w-[1152px] 2xl:w-[1382px] mx-auto
                    h-auto
                    lg:h-[380px] xl:h-[425px]
                    rounded-2xl lg:rounded-3xl
                    overflow-hidden shadow-lg
                    bg-white
                    border-[5px] border-[#B42129] mt-10
                ">

                    {/* Bagian kiri/atas - Gambar */}
                    <div className="
                        w-full lg:w-[369px] xl:w-[461px] 2xl:w-[553px]
                        h-[320px] lg:h-full bg-[#B76A18]
                        relative
                        lg:border-r lg:border-black
                    ">
                        <img
                            src={rc}
                            alt="Reality Club"
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    {/* Bagian kanan/bawah - Konten */}
                    <div className="
                        w-full lg:w-[553px] xl:w-[691px] 2xl:w-[829px]
                        px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-12
                        flex flex-col justify-center
                        gap-4 lg:gap-6
                        text-center lg:text-left
                    ">
                        {/* Head Text */}
                        <div className="text-left">
                            <p className="text-[#1F5A9F] font-bold w-full text-[20px] sm:text-[22px] md:text-[25px] md:leading-7 lg:text-[27px] lg:leading-9 xl:text-[32px] xl:leading-12">
                                GET YOUR TICKET!!!
                            </p>
                        </div>

                        {/* Description Text */}
                        <div className="text-[#1F5A9F] leading-tight font-medium tracking-wide text-justify
                                        text-[13px]
                                        sm:text-[15px]
                                        md:text-[16px]
                                        lg:text-[17px]
                                        xl:text-[19px]">
                            Jangan sampai ketinggalan acara terbesar
                            <strong> UMN Festival 2025 </strong>yang akan hadir
                            kembali dengan<strong> UNIFY 2025 </strong>, bersama
                            dengan Guest Star pertama kita, Reality Club.
                            <strong>
                            {" "}
                                Saksikan langsung UNIFY 2025 di Universitas
                                Multimedia Nusantara pada tanggal 22 November 2025.{" "}
                            </strong>
                        </div>

                        {/* Button */}
                        <div className="flex lg:justify-start mt-3">
                                <a href="/ticket" role="button" className="text-white bg-[#B42129] rounded-full inline-flex items-center justify-center
                                                hover:bg-[#892026] transition-all duration-200
                                                w-[160px] h-[32px] text-[15px]
                                                sm:w-[160px] sm:h-[32px] sm:text-[16px]
                                                md:w-[165px] md:h-[37px] md:text-[17px]
                                                lg:w-[191px] lg:h-[37px] lg:text-[19px]
                                                xl:w-[222px] xl:h-[44px] xl:text-[22px]">
                                    Pelajari Lebih Lanjut
                                </a>
                        </div>
                    </div>
                </div>
            </div>
    </section>
    );
}