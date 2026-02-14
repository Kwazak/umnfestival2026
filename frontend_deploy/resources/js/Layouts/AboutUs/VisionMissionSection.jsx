import PaperCard from "../../Components/AboutUs/PaperCard";

export default function VisionMission() {
    const visionText = (
        <>
            Menjadikan UMN Festival sebagai <strong>wadah yang mempererat relasi antar mahasiswa/i</strong> serta menciptakan pengalaman yang berkesan dalam perayaan ulang tahun UMN
        </>
    );

    const missionList = [
        "Meningkatkan keterlibatan aktif mahasiswa/i dalam setiap rangkaian kegiatan UMN Festival",
        "Membangun kebersamaan dan semangat kolaboratif antar mahasiswa/i melalui kegiatan yang inklusif dan menyenangkan",
        "Menyelenggarakan rangkaian acara yang memorable dan berdampak positif bagi seluruh civitas akademika UMN."
    ];

    return (
        <>
            {/* Desktop View (md ke atas) */}
            <div className="hidden lg:flex justify-center px-4">
                {/* Wrapper untuk mengatur max-width dan gap */}
                <div className="flex flex-row items-stretch w-[90%] justify-center
                            md:gap-8 
                            lg:gap-4 
                            xl:gap-8
                            2xl:gap-8">
                    <PaperCard title="Vision" content={visionText} />
                    <PaperCard title="Mission" content={missionList} isList />
                </div>
            </div>

            {/* Mobile View (di bawah md) */}
            <div className="flex flex-col lg:hidden items-center flex items-stretch justify-center gap-4 mx-6">
                <PaperCard title="Vision" content={visionText} />
                <PaperCard title="Mission" content={missionList} isList />
            </div>
        </>
    );
}