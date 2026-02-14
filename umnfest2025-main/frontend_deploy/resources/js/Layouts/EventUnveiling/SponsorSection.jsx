import paper from '/resources/images/SponsorPaper.svg';
import { Text } from '../../Components';

export default function SponsorSection(){

    const images = [
        "/imgs/unveiling/sponsors/sponsor1.svg",
        "/imgs/unveiling/sponsors/sponsor2.webp",
        "/imgs/unveiling/sponsors/sponsor3.webp",
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <img src={paper} alt="Sponsor Board" className="w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Text textAlign='center' color="#2E1F6E" className="font-bold">Sponsored By</Text>
                <div className="flex items-center justify-center gap-8">
                    {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        alt={`Sponsor ${i + 1}`}
                        className="size-20 sm:size-30 md:size-40 object-contain"
                    />
                    ))}
                </div>
            </div>
        </div>

    );
}