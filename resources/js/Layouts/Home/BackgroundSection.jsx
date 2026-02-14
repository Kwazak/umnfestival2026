import React from "react";

export default function BackgroundSection({ bgColor }) {
    const animatedStyle = {
        background: "linear-gradient(270deg, #FFC22F)",
        backgroundSize: "200% 200%",
        animation: "gradientAnimation 20s ease infinite",
    };

    const solidStyle = bgColor ? { background: bgColor } : null;

    return (
        <>
            <style>
                {`
                @keyframes gradientAnimation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .bg-animated-gradient { animation: none !important; }
                }
                `}
            </style>

            <div
                className="fixed inset-0 w-full h-full -z-20 bg-animated-gradient"
                style={bgColor ? solidStyle : animatedStyle}
            />
        </>
    );
}
