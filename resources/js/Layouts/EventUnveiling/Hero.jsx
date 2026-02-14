import React from "react";
import defaultHero from "../../../images/UnveilingHero.svg";

// Accept custom heroSrc via props so parent page can override image
export default function Hero({ heroSrc }) {
    const src = heroSrc || defaultHero;
    return (
        <div className="w-full p-3 pb-10 mt-35 text-center">
            <img
                src={src}
                alt="Event Header"
                className="w-full max-w-screen-xl mx-auto"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultHero; }}
            />
        </div>
    );
}