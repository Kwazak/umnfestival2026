import React, { useState, useEffect } from 'react';

const SpinWheel = ({ prizes, isSpinning, targetPrizeId }) => {
    const [rotation, setRotation] = useState(0);

    // Colors for each prize segment (kontras tinggi, ga ada putih)
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#FFD93D', // Yellow
        '#6BCB77', // Green
        '#FF8C42', // Orange
        '#9B59B6', // Purple
        '#3498DB', // Blue
        '#E74C3C', // Dark Red
    ];

    const getTextColor = (hexColor) => {
        const lightColors = ['#FFD93D', '#FF8C42', '#4ECDC4'];
        return lightColors.includes(hexColor) ? '#1A1448' : '#FFFFFF';
    };

    useEffect(() => {
        if (!isSpinning || !targetPrizeId || prizes.length === 0) {
            return;
        }

        const targetIndex = prizes.findIndex((prize) => prize.id === targetPrizeId);
        if (targetIndex === -1) {
            console.warn('SpinWheel: target prize not found in current prize list', targetPrizeId);
            // fallback: spin full rotations without offset
            setRotation((prev) => prev + 5 * 360);
            return;
        }

        setRotation((prev) => {
            const segmentAngle = 360 / prizes.length;
            const currentNormalized = ((prev % 360) + 360) % 360;
            const desiredNormalized = (360 - (targetIndex * segmentAngle + segmentAngle / 2) + 360) % 360;
            const spins = 5 * 360; // number of full rotations
            const extraRotation = (desiredNormalized - currentNormalized + 360) % 360;
            return prev + spins + extraRotation;
        });
    }, [isSpinning, targetPrizeId, prizes]);

    const segmentAngle = prizes.length > 0 ? 360 / prizes.length : 0;

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Wheel Container */}
            <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Pointer/Arrow at top */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg" />
                </div>

                {/* Wheel */}
                <div
                    className="w-full h-full rounded-full relative shadow-2xl border-8 border-yellow-400"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    }}
                >
                    {/* SVG for perfect segments */}
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                        {prizes.map((prize, index) => {
                            const angle = (index * segmentAngle) - 90; // Start from top
                            const nextAngle = angle + segmentAngle;
                            const color = colors[index % colors.length];
                            
                            // Calculate path for segment
                            const startAngleRad = (angle * Math.PI) / 180;
                            const endAngleRad = (nextAngle * Math.PI) / 180;
                            
                            const x1 = 100 + 100 * Math.cos(startAngleRad);
                            const y1 = 100 + 100 * Math.sin(startAngleRad);
                            const x2 = 100 + 100 * Math.cos(endAngleRad);
                            const y2 = 100 + 100 * Math.sin(endAngleRad);
                            
                            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                            
                            const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                            
                            // Calculate text position (middle of segment)
                            const midAngle = (angle + segmentAngle / 2) * Math.PI / 180;
                            const textRadius = 60; // Distance from center
                            const textX = 100 + textRadius * Math.cos(midAngle);
                            const textY = 100 + textRadius * Math.sin(midAngle);
                            const textRotation = angle + segmentAngle / 2 + 90; // Rotate text to follow segment
                            
                            return (
                                <g key={prize.id}>
                                    {/* Segment */}
                                    <path
                                        d={pathData}
                                        fill={color}
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Prize text */}
                                    <text
                                        x={textX}
                                        y={textY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                        fill={getTextColor(color)}
                                        fontSize="10"
                                        fontWeight="bold"
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.45)' }}
                                    >
                                        {prize.name.length > 12 ? prize.name.substring(0, 10) + '..' : prize.name}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">SPIN</span>
                    </div>
                </div>
            </div>

            {/* Status text below wheel */}
            <div className="mt-8 text-center">
                {isSpinning ? (
                    <p className="text-2xl font-bold text-yellow-400 animate-pulse">🎰 Spinning...</p>
                ) : (
                    <p className="text-xl text-gray-300">Ready to spin!</p>
                )}
            </div>
        </div>
    );
};

export default SpinWheel;
