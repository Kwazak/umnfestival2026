import React, { useEffect, useState } from "react";
import oldPaper from "../../../images/oldpaper.webp";
import map1 from "../../../images/map1Countdown.webp";
import sign1 from "../../../images/signCountdown.webp";
import sign2 from "../../../images/sign2Countdown.webp";
import lantern from "../../../images/lanternCountdown.webp";
import blade from "../../../images/bladeCountdown.webp";

export default function CountdownSection() {
    const [events, setEvents] = useState([]);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/countdown-events', { cache: 'no-store' });
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                setEvents(data.data);
                setCurrentEventIndex(0);
            } else {
                setError('No countdown events available');
            }
        } catch (error) {
            console.error('Error fetching countdown events:', error);
            setError('Error loading countdown events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Get current event
    const event = events[currentEventIndex] || null;

    const calculateTimeLeft = () => {
        if (!event) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        const difference = +new Date(event.targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Use a stable interval that updates once per second
    useEffect(() => {
        if (!event) return;
        setTimeLeft(calculateTimeLeft());
        const id = setInterval(() => {
            setTimeLeft(prev => {
                const next = calculateTimeLeft();
                const allZero = Object.values(next).every(val => val === 0);
                if (allZero && currentEventIndex < events.length - 1) {
                    // Move to next event
                    setCurrentEventIndex(idx => Math.min(idx + 1, events.length - 1));
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
        // Only re-create when event changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    const formatTime = (time) => (time < 10 ? `0${time}` : time);

    // Loading state
    if (loading) {
        return (
            <div className="relative flex justify-center px-4 lg:pt-36 lg:pb-24 h-screen items-center bg-[#164D8E]">
                <div className="text-center">
                    <div className="text-lg text-white">Loading countdown...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="relative flex justify-center px-4 lg:pt-36 lg:pb-24 h-screen items-center bg-[#164D8E]">
                <div className="text-center">
                    <div className="text-lg text-red-300">{error}</div>
                </div>
            </div>
        );
    }

    // No event state
    if (!event) {
        return (
            <div className="relative flex justify-center px-4 lg:pt-36 lg:pb-24 h-screen items-center bg-[#164D8E]">
                <div className="text-center">
                    <div className="text-lg text-white">No countdown events available</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative flex justify-center px-4 lg:pt-36 lg:pb-24 h-screen items-center bg-[#164D8E]"
        >
            <img
                src={map1}
                className="
        absolute
        w-56 md:w-60 lg:w-64
        top-32 -left-10
        md:top-20 md:left-4
        lg:top-12 lg:left-5
"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
            />
            <img
                src={sign2}
                className="
        absolute
        w-90 md:w-96 lg:w-102
        bottom-48 -left-28
        md:bottom-20 md:left-0
        lg:bottom-8 lg:left-1
"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
            />
            <img
                src={sign1}
                className="
        absolute overflow-hidden
        w-58 md:w-61 lg:w-64
        top-3/5 right-0
        md:top-2/4 md:right-0
        lg:top-2/5 lg:right-1
"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
            />
            <img
                src={lantern}
                className="
        absolute
        w-40 md:w-50 lg:w-60
        top-12 right-0
        md:top-24 md:right-17
        lg:top-5 lg:right-56
"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
            />
            <img
                src={blade}
                className="
        absolute
        w-56 md:w-64 lg:w-72
        transform -translate-x-1/2
        bottom-[20px] right-20
        md:bottom-[180px] md:right-32
        lg:bottom-[60px] lg:left-2/3
"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
            />

            {/* judul */}
            <div className="absolute mb-56 md:mb-0 sm:top-[150px] md:top-[90px] xl:top-[120px] 2xl:top-[130px] z-50" style={{ willChange: 'transform' }}>
                <div className="flex items items-center justify-center">
                    <img
                        src={oldPaper}
                        alt="Old Paper"
                        className="w-2/3 md:w-full max-w-[600px]"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div className="CountdownNumber absolute inset-0 flex items-center justify-center text-center text-[#093F7E] font-medium text-[25px] md:text-4xl lg:text-5xl xl:text-6xl">
                    Countdown to <br /> {event.name}
                </div>
            </div>
            {/* end judul */}

            <div className="bg-gradient-to-r w-9/10 max-w-[1200px] from-[#FFE47A] via-[#998949] to-[#FFE47A] p-1 rounded-[44.5px] shadow-lg z-10">
                <div className="bg-[#B61600] rounded-[44.5px] pt-10 pb-10 sm:pt-20 sm:pb-20">
                    <div className="flex flex-wrap justify-center items-start text-white font-bold gap-x-1 md:gap-x-8 gap-y-8 uppercase text-center my-10">
                        {["days", "hours", "minutes", "seconds"].map(
                            (unit, index) => (
                                <React.Fragment key={unit}>
                                    {index > 0 && (
                                        <span className="text-3xl sm:text-4xl md:text-5xl">
                                            :
                                        </span>
                                    )}
                                    <div className="flex flex-col items-center min-w-[50px]">
                                        <span className="CountdownNumber text-4xl lg:text-16xl md:text-7xl">
                                            {formatTime(timeLeft[unit])}
                                        </span>
                                        <span className="text-sm lg:text-3xl md:text-2xl">
                                            {unit}
                                        </span>
                                    </div>
                                </React.Fragment>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}