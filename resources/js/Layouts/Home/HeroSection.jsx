import React, { useEffect, useState, useRef } from "react";
import heroSection from "../../../images/hero-section.svg";
import gsap from "gsap";

export default function HeroSection() {
    const [hero, setHero] = useState(null);
    const [error, setError] = useState('');
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);

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

    // GSAP animations
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Initial animation timeline
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Animate hero image with scale and fade
            tl.fromTo(
                imageRef.current,
                { opacity: 0, scale: 0.9, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2 }
            );

            // Animate text with stagger
            tl.fromTo(
                textRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8 },
                '-=0.6'
            );

            // Subtle floating animation for the image
            gsap.to(imageRef.current, {
                y: -10,
                duration: 3,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: -1
            });
        }, containerRef);

        return () => ctx.revert();
    }, [hero]);

    const title = hero?.title_text || 'UPCOMING EVENT U-CARE';
    const l1 = hero?.event_text_line1 || 'Event at 27 September 2025 Lobby B,';
    const l2 = hero?.event_text_line2 || 'Universitas Multimedia Nusantara';
    const active = hero?.is_active ?? true;

    return (
        <div ref={containerRef} className="flex-shrink-0 w-full h-screen flex flex-col items-center justify-center">
            <img
                ref={imageRef}
                src={heroSection}
                alt="Hero Section"
                className="w-full mt-5"
                style={{ backgroundSize: "100% auto", opacity: 0 }}
                loading="lazy"
                decoding="async"
            />
            <h1 
                ref={textRef}
                className="text-center text-[#0E0070] font-medium text-md md:text-2xl lg:text-4xl font-bold mt-4 px-4"
                style={{ opacity: 0 }}
            >
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
