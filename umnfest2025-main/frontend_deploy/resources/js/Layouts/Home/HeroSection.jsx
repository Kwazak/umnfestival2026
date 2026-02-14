import React, { useEffect, useState } from "react";
import heroSection from "../../../images/hero-section.svg";

export default function HeroSection() {
    const [hero, setHero] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/hero-section', { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || 'Failed');
                if (mounted) setHero(data.data);
            } catch (e) {
                setError(e.message);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const title = hero?.title_text || 'UPCOMING EVENT U-CARE';
    const l1 = hero?.event_text_line1 || 'Event at 27 September 2025 Lobby B,';
    const l2 = hero?.event_text_line2 || 'Universitas Multimedia Nusantara';
    const active = hero?.is_active ?? true;

    return (
        <div className="flex-shrink-0 w-full h-screen flex flex-col items-center justify-center">
            <img
                src={heroSection}
                alt="Hero Section"
                className="w-full mt-5"
                style={{ backgroundSize: "100% auto" }}
                loading="lazy"
                decoding="async"
            />
            <h1 className="text-center text-[#0E0070] font-medium text-md md:text-2xl lg:text-4xl font-bold mt-4 px-4">
                {active ? (<>
                    {title} <br />
                    {l1} <br />
                    {l2}
                </>) : null}
            </h1>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
    );
}
