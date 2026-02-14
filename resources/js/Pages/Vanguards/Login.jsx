import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

const VanguardsLogin = () => {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/vanguards/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#281F65] via-[#1a1447] to-[#0E4280] flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#F3C019]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#42B5B5]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E34921]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo/Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <div className="bg-gradient-to-r from-[#F3C019] via-[#E34921] to-[#A42128] p-1 rounded-2xl mb-6">
                            <div className="bg-[#281F65] px-8 py-4 rounded-xl">
                                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F3C019] to-[#E34921] font-museum">
                                    VANGUARDS
                                </h1>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-2 font-museum">
                        🏆 Agent Leaderboard
                    </h2>
                    <p className="text-[#D9D9D9]/80 text-sm md:text-base">
                        Top UMN Festival 2025's Agent Rankings
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#FFFFFF]/10 backdrop-blur-xl border-2 border-[#42B5B5]/30 rounded-3xl shadow-2xl p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Input */}
                        <div className="group">
                            <label className="block text-[#FFFFFF] font-bold mb-3 text-lg">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Access Code
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full px-6 py-4 bg-[#FFFFFF]/20 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/50 focus:bg-[#FFFFFF]/30 focus:border-[#F3C019] focus:outline-none transition-all duration-300 shadow-lg ${
                                        errors.password ? 'border-[#E34921]' : 'border-[#42B5B5]/40'
                                    }`}
                                    placeholder="Enter access code..."
                                    autoFocus
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/10 to-[#E34921]/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            {errors.password && (
                                <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm animate-shake">
                                    <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing || !data.password}
                            className="w-full group bg-gradient-to-r from-[#F3C019] via-[#E34921] to-[#A42128] text-[#FFFFFF] py-4 px-8 rounded-2xl font-black text-lg hover:from-[#F3C019]/90 hover:via-[#E34921]/90 hover:to-[#A42128]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFFFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>VERIFYING...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>ACCESS LEADERBOARD</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Info Section */}
                    <div className="mt-6 p-4 bg-[#42B5B5]/10 border border-[#42B5B5]/30 rounded-xl">
                        <p className="text-[#D9D9D9]/80 text-sm text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-[#42B5B5]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            For authorized agents only
                        </p>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-[#D9D9D9]/80 hover:text-[#F3C019] transition-colors duration-300 font-semibold"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Home
                    </a>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default VanguardsLogin;
