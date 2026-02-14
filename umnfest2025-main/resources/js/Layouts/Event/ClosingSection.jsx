import React from "react";
import EulympicPromo from "../../../images/eulympicpromotional.png";
import { Button, MiniButton, HeadText, Text } from "../../Components";

export default function ClosingSection() {
    return (
        <section className="w-full px-4 py-12 mt-0">
            <div
                className="
                flex flex-col lg:flex-row
                w-full max-w-2xl lg:max-w-6xl mx-auto
                h-auto
                lg:h-[500px]
                rounded-2xl lg:rounded-3xl
                overflow-hidden shadow-lg
                bg-white lg:bg-transparent
                mb-8 lg:mb-10 lg:mt-24 border border-[#F8CB4C] border-3
            "
            >
                <div
                    className="
                    w-full lg:w-5/12
                    bg-[#90C3D4]
                    h-[300px] md:h-[500px] lg:h-full
                    rounded-none lg:rounded-l-3xl
                    relative
                "
                >
                    <div
                        className="
                        relative w-full h-full
                        bg-gray-300
                        rounded-none lg:rounded-lg
                        flex items-center justify-center
                    "
                    >
                        <img
                            src={EulympicPromo}
                            alt="Eulympic Promotional"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div
                        className="
                        absolute bottom-4 w-full lg:bottom-6 lg:left-6 lg:w-auto
                    "
                    ></div>
                </div>

                <div
                    className="
                    w-full lg:w-7/12
                    bg-white
                    rounded-b-2xl lg:rounded-b-none lg:rounded-r-3xl
                    px-10 lg:px-8 py-8
                    text-center lg:text-left
                    shadow-md lg:shadow-none
                "
                >
                    {/* Judul */}
                    <HeadText
                        className="
                        font-museum font-bold mb-3 md:mb-2 lg:mb-4 lg:mt-10
                        text-xl text-[#1947BA] lg:text-3xl lg:text-gray-900
                    "
                    >
                        E-ULYMPIC 2025
                    </HeadText>

                    <Text
                        className="
                        font-museum text-gray-700 text-justify mb-4 md:mb-3 lg:mb-6
                        text-sm lg:text-base
                    "
                    >
                        E-Ulympic merupakan kegiatan yang bertujuan untuk
                        memperluas dan mencari bakat mahasiswa/i UMN maupun di
                        luar UMN dalam perlombaan cabang olahraga E-Sport.
                    </Text>

                    <div className="mb-6 space-y-1 lg:space-y-0">
                        <Text
                            className="
                            font-museum text-sm mb-1
                            text-[#1947BA] lg:text-gray-600
                        "
                        >
                            Open Registration : 6 – 16 May 2025
                        </Text>
                        <Text
                            className="font-museum
                            text-sm mb-1
                            text-[#1947BA] lg:text-gray-600
                        "
                        >
                            Terbuka untuk 64 Teams Mahasiswa, SMA / Sederajat
                        </Text>
                        <Text
                            className="font-museum
                            text-sm mb-1 mt-4 md:mt-3 lg:mt-6
                            text-[#1947BA] lg:text-gray-600
                        "
                        >
                            Event Day : 19 – 23 May 2025
                        </Text>
                        <Text
                            className="font-museum
                            text-sm mb-1
                            text-[#1947BA] lg:text-gray-600
                        "
                        >
                            Venue : Lobby B, Universitas Multimedia Nusantara
                        </Text>
                    </div>

                    <div className="flex justify-center lg:justify-start gap-4">
                        <Button>Daftar Sekarang</Button>
                        <Button>Pelajari Lebih Lanjut</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
