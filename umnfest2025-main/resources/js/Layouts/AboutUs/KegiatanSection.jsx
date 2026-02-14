import PaperDesc from "../../Components/AboutUs/PaperDesc";
import PaperScrollSvg from "../../../images/Scroll_Paper.svg";
import PaperScrollPng from "../../../images/Scroll_Paper.png";
import SwordSticker from "../../../images/Stiker_Pedang.svg";
import LanternSticker from "../../../images/Stiker_Lentera.svg";

export default function KegiatanSection() {
    // Tema Kegiatan
    const titleTema = "Tema Kegiatan";
    const subheaderTema = "The Legacy of the Five Realms";
    const textTema = "Sebuah dunia yang terdapat 5 buah alam yang akan dilewati para peserta dalam misi mencari The Crown of Unity yaitu Unveiling, E-Ulympic, U-Care, Ulympic, dan Unify yang dimana masing- masing rangkaian memiliki rintangan yang sulit.";

    // Konsep Kegiatan
    const titleKonsep = "Konsep Kegiatan";
    const subheaderKonsep = "The Quest for the Crown of Unity";
    const textKonsep = "Negara fantasi yang terpecah oleh empat kerajaan yang saling bermusuhan. Legenda mengenai Crown of Unity, artefak yang bisa menyatukan dunia, para peserta diminta untuk mencari mahkota tersebut dengan menyatukan kekuatan & kerja sama mereka.";

    return (
        <>
            {/* =================== DESKTOP VIEW =================== */}
            <div className="hidden xl:block relative my-30 mx-10 overflow-hidden">
                <div
                    className="bg-no-repeat bg-cover xl:bg-contain bg-center flex-col py-20 md:p-25 2xl:p-40 rounded-md"
                    style={{ backgroundImage: `url(${PaperScrollSvg})` }}
                >
                    <PaperDesc
                        title={titleTema}
                        subheader={subheaderTema}
                        text={textTema}
                        style="w-[300px] md:w-[700px] 2xl:w-[900px]"
                    />
                    <PaperDesc
                        title={titleKonsep}
                        subheader={subheaderKonsep}
                        text={textKonsep}
                        style="w-[300px] md:w-[700px] max-w-none"
                    />
                </div>

                {/* Sticker Kanan Atas */}
                <img
                    src={LanternSticker}
                    alt="Lantern Sticker"
                    className="absolute top-1/4 md:top-1/2 lg:top-1/4 right-[-90px] lg:right-[-70px] xl:right-[-80px]
                    w-[100px] xl:w-[400px] xl:h-[430px] 2xl:w-[500px] 2xl:h-[500px]"
                />

                {/* Sticker Kiri Bawah */}
                <img
                    src={SwordSticker}
                    alt="Sword Sticker"
                    className="absolute bottom-[-140px] left-[-100px] 2xl:bottom-[-180px] 2xl:left-[-120px]
                    w-[80px] lg:w-110 lg:h-[600px] 2xl:w-[700px] 2xl:h-[800px]"
                />
            </div>

            {/* =================== MOBILE VIEW =================== */}
            <div className="block md:block xl:hidden relative my-20 md:my-30 mx-5">
                <div
                    className="relative w-full bg-no-repeat bg-contain bg-center bg-top px-4 py-12 md:px-10 lg:px-20 lg:py-30 2xl:px-20 rounded-md"
                    style={{
                        backgroundImage: `url(${PaperScrollPng})`,
                        backgroundSize: "100% 100%",
                    }}
                >
                    <div className="relative z-10">
                        <PaperDesc
                            title={titleTema}
                            subheader={subheaderTema}
                            text={textTema}
                        />
                        <div className="mt-10" />
                        <PaperDesc
                            title={titleKonsep}
                            subheader={subheaderKonsep}
                            text={textKonsep}
                        />
                    </div>

                    {/* Sticker Kanan Atas */}
                    <img
                        src={LanternSticker}
                        alt="Lantern Sticker"
                        className="absolute top-1/3 right-[-20px] w-28 md:top-1/3 md:right-[-20px] md:w-48 md:h-[300px] lg:right-[-20px] lg:w-60 lg:h-[20rem]"
                    />

                    {/* Sticker Kiri Bawah */}
                    <img
                        src={SwordSticker}
                        alt="Sword Sticker"
                        className="absolute bottom-[-100px] left-[-60px] w-[210px] md:bottom-[-160px] md:left-[-80px] md:w-81 lg:w-92"
                    />
                </div>
            </div>
        </>
    );
}
