import paper from '/resources/images/MedparPaper.svg';
import { Text } from '../../Components';

export default function MedparSection(){

    const images = [
        "/imgs/unveiling/medpars/medpar1.png",
        "/imgs/unveiling/medpars/medpar2.png",
        "/imgs/unveiling/medpars/medpar3.png",
        "/imgs/unveiling/medpars/medpar4.png",
        "/imgs/unveiling/medpars/medpar5.png",
        "/imgs/unveiling/medpars/medpar6.png",
        "/imgs/unveiling/medpars/medpar7.png",
        "/imgs/unveiling/medpars/medpar8.png",
        "/imgs/unveiling/medpars/medpar9.png",
        "/imgs/unveiling/medpars/medpar10.png",
        "/imgs/unveiling/medpars/medpar11.png",
        "/imgs/unveiling/medpars/medpar12.png",
        "/imgs/unveiling/medpars/medpar13.png",
        "/imgs/unveiling/medpars/medpar14.png",
        "/imgs/unveiling/medpars/medpar15.png",
        "/imgs/unveiling/medpars/medpar16.png",
        "/imgs/unveiling/medpars/medpar17.png",        
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <img src={paper} alt="Sponsor Board" className="w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                <Text textAlign='center' color="#2E1F6E" className="font-bold">Media Partners</Text>
                <div className="flex flex-wrap justify-center gap-2 md:gap-8 mt-4">
                    {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        alt={`Medpar ${i + 1}`}
                        className="size-12 sm:size-22 object-contain"
                    />
                    ))}
                </div>
            </div>
        </div>
    );
}