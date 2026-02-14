import TitleBanner from "./TitleBanner";
import PaperCardBg from "../../../images/Paper.png";

export default function PaperCard({ title, content, isList = false }) {
    return (
        <div
            style={{ backgroundImage: `url(${PaperCardBg})` }}
            className="relative bg-no-repeat bg-center bg-cover
                        w-full 
                        flex flex-col items-center
                        py-16 px-6 sm:px-10 md:px-10 lg:px-12 2xl:px-26"
        >
            {/* Banner title */}
            <TitleBanner title={title} />

            {/* Content */}
            {isList ? (
                <ul className="list-disc pl-5 mt-2 md:mt-2 space-y-2 text-base sm:text-lg lg:text-xl 2xl:text-2xl text-[#1F5A9F]">
                    {content.map((item, index) => (
                        <li key={index} className="text-left">{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 md:mt-2 text-base sm:text-lg lg:text-xl 2xl:text-2xl leading-relaxed text-center text-[#1F5A9F]">
                    {content}
                </p>
            )}
        </div>
    );
}