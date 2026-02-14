import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const VanguardsLeaderboard = ({ leaderboard, totalUses, totalActiveCodes }) => {
    const [animatedData, setAnimatedData] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Animate data entry
        const timeout = setTimeout(() => {
            setAnimatedData(leaderboard);
            setShowConfetti(true);
        }, 300);

        return () => clearTimeout(timeout);
    }, [leaderboard]);

    const handleLogout = () => {
        router.post('/vanguards/logout');
    };

    const getMedalIcon = (index) => {
        switch(index) {
            case 0:
                return '🥇';
            case 1:
                return '🥈';
            case 2:
                return '🥉';
            default:
                return '🏅';
        }
    };

    const getBarColor = (index) => {
        switch(index) {
            case 0:
                return 'from-yellow-400 to-yellow-600';
            case 1:
                return 'from-gray-300 to-gray-500';
            case 2:
                return 'from-orange-400 to-orange-600';
            default:
                return 'from-[#42B5B5] to-[#0E4280]';
        }
    };

    const getBarWidth = (uses) => {
        if (leaderboard.length === 0) return '0%';
        const maxUses = leaderboard[0]?.total_uses || 1;
        return `${(uses / maxUses) * 100}%`;
    };

    // Get top 5 for highlight
    const top5 = animatedData.slice(0, 5);
    const top5TotalUses = top5.reduce((sum, agent) => sum + agent.total_uses, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#281F65] via-[#1a1447] to-[#0E4280] p-4 md:p-8 relative overflow-hidden">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            {['🎉', '⭐', '🏆', '✨', '🎊'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#F3C019]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#42B5B5]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E34921]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-6">
                        <div className="bg-gradient-to-r from-[#F3C019] via-[#E34921] to-[#A42128] p-1 rounded-3xl animate-pulse">
                            <div className="bg-[#281F65] px-8 py-6 rounded-2xl">
                                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F3C019] to-[#E34921] font-museum">
                                    🏆 VANGUARDS 🏆
                                </h1>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-3 font-museum">
                        Top UMN Festival 2025's Agent
                    </h2>
                    <p className="text-[#D9D9D9]/80 text-lg">
                        Leaderboard Kode Referral & Penggunaan
                    </p>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 border border-[#42B5B5]/30 rounded-xl text-[#FFFFFF] font-semibold transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#FFFFFF]/10 backdrop-blur-xl border-2 border-[#F3C019]/30 rounded-3xl p-6 hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#F3C019] to-[#E34921] rounded-2xl flex items-center justify-center text-3xl">
                                🎫
                            </div>
                            <div>
                                <p className="text-[#D9D9D9]/80 text-sm font-semibold">Total Top 5 Uses</p>
                                <p className="text-[#FFFFFF] text-3xl font-black">{top5TotalUses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FFFFFF]/10 backdrop-blur-xl border-2 border-[#42B5B5]/30 rounded-3xl p-6 hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#42B5B5] to-[#0E4280] rounded-2xl flex items-center justify-center text-3xl">
                                📊
                            </div>
                            <div>
                                <p className="text-[#D9D9D9]/80 text-sm font-semibold">All Codes Total</p>
                                <p className="text-[#FFFFFF] text-3xl font-black">{totalUses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FFFFFF]/10 backdrop-blur-xl border-2 border-[#E34921]/30 rounded-3xl p-6 hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#E34921] to-[#A42128] rounded-2xl flex items-center justify-center text-3xl">
                                🎖️
                            </div>
                            <div>
                                <p className="text-[#D9D9D9]/80 text-sm font-semibold">Active Codes</p>
                                <p className="text-[#FFFFFF] text-3xl font-black">{totalActiveCodes}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#FFFFFF]/10 backdrop-blur-xl border-2 border-[#42B5B5]/30 rounded-3xl p-6 md:p-10 shadow-2xl">
                    {/* Table Header - Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 mb-6 pb-4 border-b-2 border-[#42B5B5]/30">
                        <div className="col-span-1 text-[#F3C019] font-black text-lg">Rank</div>
                        <div className="col-span-5 text-[#F3C019] font-black text-lg">Agent</div>
                        <div className="col-span-2 text-[#F3C019] font-black text-lg">Code</div>
                        <div className="col-span-2 text-[#F3C019] font-black text-lg text-center">Uses</div>
                        <div className="col-span-2 text-[#F3C019] font-black text-lg">Performance</div>
                    </div>

                    {/* Leaderboard Items */}
                    <div className="space-y-4">
                        {animatedData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#D9D9D9]/60 text-xl">No data available yet</p>
                            </div>
                        ) : (
                            animatedData.map((agent, index) => (
                                <div
                                    key={agent.code}
                                    className={`group bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 border-2 ${
                                        index < 3 ? 'border-[#F3C019]/40' : 'border-[#42B5B5]/20'
                                    } rounded-2xl p-4 md:p-6 transition-all duration-300 hover:scale-102 hover:shadow-xl animate-slideIn`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Mobile Layout */}
                                    <div className="md:hidden space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl">{getMedalIcon(index)}</span>
                                                <div>
                                                    <p className="text-[#FFFFFF] font-black text-xl">{agent.panitia_name}</p>
                                                    <p className="text-[#42B5B5] font-bold text-sm">{agent.code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#F3C019] text-3xl font-black">{agent.total_uses}</p>
                                                <p className="text-[#D9D9D9]/60 text-xs">uses</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#FFFFFF]/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${getBarColor(index)} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: getBarWidth(agent.total_uses) }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-1 flex items-center justify-center">
                                            <span className="text-5xl">{getMedalIcon(index)}</span>
                                        </div>
                                        <div className="col-span-5">
                                            <p className="text-[#FFFFFF] font-black text-xl group-hover:text-[#F3C019] transition-colors">
                                                {agent.panitia_name}
                                            </p>
                                            <p className="text-[#D9D9D9]/60 text-sm mt-1">
                                                Successful: {agent.successful_uses} tickets
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#42B5B5]/20 border border-[#42B5B5]/40 rounded-xl text-[#42B5B5] font-bold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                {agent.code}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <p className="text-[#F3C019] text-4xl font-black">{agent.total_uses}</p>
                                            <p className="text-[#D9D9D9]/60 text-sm">uses</p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="w-full bg-[#FFFFFF]/10 rounded-full h-4 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getBarColor(index)} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                                    style={{ width: getBarWidth(agent.total_uses) }}
                                                ></div>
                                            </div>
                                            <p className="text-[#D9D9D9]/60 text-xs mt-1 text-right">
                                                {Math.round((agent.total_uses / (leaderboard[0]?.total_uses || 1)) * 100)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="inline-block bg-[#FFFFFF]/5 backdrop-blur-xl border border-[#42B5B5]/30 rounded-2xl px-8 py-4">
                        <p className="text-[#D9D9D9]/80 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#F3C019]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            Data updated in real-time • UMN Festival 2025
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.6s ease-out forwards;
                    opacity: 0;
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                    font-size: 24px;
                }
                .delay-700 {
                    animation-delay: 0.7s;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

export default VanguardsLeaderboard;
