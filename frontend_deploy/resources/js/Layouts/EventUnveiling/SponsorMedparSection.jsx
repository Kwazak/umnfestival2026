import defaultBoard from "/resources/images/SponsorMedparWood.svg";
import defaultText from "/resources/images/SponsorMedparText.png";
import defaultSponsor from "/public/imgs/unveiling/Sponsor.png";
import defaultMedpar from "/public/imgs/unveiling/Medpar.png";

export default function SponsorMedparSection({ boardSrc, textSrc, sponsorSrc, medparSrc }) {
    const board = boardSrc || defaultBoard;
    const text = textSrc || defaultText;
    const sponsor = sponsorSrc || defaultSponsor;
    const medpar = medparSrc || defaultMedpar;
    return (
        <div>
            {/* Top board section */}
            <div className="relative w-full pt-28 md:pt-32 lg:pt-40 pb-8 md:pb-12 lg:pb-20 px-4 md:px-6 mb-16 mt-[10vw] flex justify-center items-center">
                <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[98%] max-w-[1200px]">
                    <img
                        src={board}
                        alt="Wooden Plank Background"
                        id="wood"
                        className="w-full h-auto max-w-[1200px] mx-auto drop-shadow-lg"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultBoard; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8" >
                        <img
                            src={text}
                            alt="The Map of Quest Text"
                            className="w-3/5 sm:w-3/5 md:w-3/5 lg:w-1/2 xl:w-[45%] max-w-[650px]"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultText; }}
                        />
                    </div>
                </div>
            </div>

            {/* Unified image stack */}
            <div className="w-full max-w-[1300px] mx-auto flex flex-col items-center gap-12 md:gap-16 pb-12 md:pb-16 px-4 mt-[15vw] md:mt-[10vw]">
                <div className="w-[98%] max-w-[1200px] mx-auto">
                    <img src={sponsor} id="gambar" alt="Sponsor" className="w-full h-auto max-w-[1200px] mx-auto drop-shadow-md" />
                </div>
                <div className="w-[98%] max-w-[1200px] mx-auto">
                    <img src={medpar} id="gambar" alt="Medpar" className="w-full h-auto max-w-[1200px] mx-auto drop-shadow-md" />
                </div>
            </div>
        </div>
    )
}
