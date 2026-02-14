import defaultEventPaper from '/resources/images/EventPaper.svg';

export default function PaperDescription({ paperSrc }) {
    const src = paperSrc || defaultEventPaper;
    return (
        <div className="w-full p-5 pb-10 mt-0 text-center">
            <img
                src={src}
                alt="Event Paper"
                className="w-[98%] sm:w-[80%] lg:w-[70%] max-w-screen-xl mx-auto"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultEventPaper; }}
            />
        </div>
    );
}
