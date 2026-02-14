import React, { useState, useEffect, useRef } from 'react';
import SpinWheel from '../../Components/SpinWheel';

const SPIN_FEATURE_ENABLED = false;

const SpinSection = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [prizes, setPrizes] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isEligible, setIsEligible] = useState(false);
    const [targetPrizeId, setTargetPrizeId] = useState(null);
    const spinTimeoutRef = useRef(null);

    // Fetch prizes on mount
    useEffect(() => {
        if (SPIN_FEATURE_ENABLED) {
            fetchPrizes();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (spinTimeoutRef.current) {
                clearTimeout(spinTimeoutRef.current);
            }
        };
    }, []);

    const fetchPrizes = async () => {
        try {
            const response = await fetch('/api/spin/prizes');
            const data = await response.json();
            if (data.success) {
                setPrizes(data.data);
            }
        } catch (err) {
            console.error('Failed to load prizes:', err);
        }
    };

    const handleValidate = async (e) => {
        e.preventDefault();
        if (!SPIN_FEATURE_ENABLED) {
            setError('Spin the Wheel sedang dinonaktifkan sementara. Nantikan update berikutnya!');
            return;
        }
        setError('');
        setIsValidating(true);

        try {
            const response = await fetch('/api/spin/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    order_number: orderNumber.trim(),
                    email: email.trim(),
                }),
            });

            const data = await response.json();

            if (data.success && data.eligible) {
                setIsEligible(true);
                setError('');
            } else {
                setError(data.message || 'Not eligible to spin');
                setIsEligible(false);
            }
        } catch (err) {
            setError('Failed to validate. Please try again.');
            setIsEligible(false);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSpin = async () => {
        if (!SPIN_FEATURE_ENABLED) {
            setError('Spin the Wheel sedang dinonaktifkan sementara. Nantikan update berikutnya!');
            return;
        }

        if (!isEligible || isSpinning) return;

        setError('');
        setIsSpinning(true);
        setTargetPrizeId(null);
        if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
        }

        try {
            // Execute spin API
            const response = await fetch('/api/spin/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    order_number: orderNumber.trim(),
                    email: email.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                const prizeIdFromResponse = data.prize?.id;
                if (prizeIdFromResponse) {
                    setTargetPrizeId(prizeIdFromResponse);
                } else {
                    const fallbackPrize = prizes.find(p => p.name === data.prize?.name);
                    if (fallbackPrize) {
                        setTargetPrizeId(fallbackPrize.id);
                    }
                }

                // Wait for spin animation to finish (4 seconds)
                spinTimeoutRef.current = setTimeout(() => {
                    setIsSpinning(false);
                    setResult(data.prize);
                    setShowResult(true);
                    setTargetPrizeId(null);
                }, 4200);
            } else {
                setIsSpinning(false);
                setError(data.message || 'Spin failed');
                setTargetPrizeId(null);
            }
        } catch (err) {
            setIsSpinning(false);
            setError('Failed to spin. Please try again.');
            setTargetPrizeId(null);
        }
    };

    const handleCloseResult = () => {
        setShowResult(false);
        setResult(null);
        setIsEligible(false);
        setOrderNumber('');
        setEmail('');
        setTargetPrizeId(null);
    };

    const getPrizeEmoji = (type) => {
        switch (type) {
            case 'cashback': return '💰';
            case 'merchandise': return '🎁';
            case 'discount': return '🎫';
            default: return '😊';
        }
    };

    const inactiveBadge = !SPIN_FEATURE_ENABLED;

    return (
        <div id="spin-section" className="bg-gradient-to-b from-[#241a63] via-[#1b154a] to-[#120e33] py-20 px-4">
            <div className="max-w-6xl mx-auto relative">
                {inactiveBadge && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center px-6">

                    </div>
                )}
                <div className={inactiveBadge ? 'pointer-events-none select-none blur-sm opacity-60' : ''}>
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#FFC22F] drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] mb-4">
                        🎰 SPIN THE WHEEL
                    </h2>
                    <p className="text-xl text-white mb-2">
                        Already purchased? Try your luck!
                    </p>
                    <p className="text-gray-300">
                        Enter your order details to spin and win exciting prizes! 🎉
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                    {/* Left: Form */}
                    <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[#FFC22F] via-[#F08A24] to-[#AF1E2D] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                        <div className="h-full w-full rounded-[2.65rem] bg-[#2b216d]/95 px-8 py-8">
                            <h3 className="text-2xl font-bold text-[#FFC22F] mb-6 tracking-wide">Enter Your Details</h3>
                        
                            <form onSubmit={handleValidate} className="space-y-5">
                                <div>
                                    <label className="block text-sm uppercase tracking-[0.2em] text-[#FFC22F] font-semibold mb-2">
                                        Order Number
                                    </label>
                                    <input
                                        type="text"
                                        value={orderNumber}
                                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                        placeholder="e.g., ORD-20252931112"
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-400 focus:border-[#FFC22F] focus:outline-none font-mono shadow-inner"
                                        required
                                        disabled={isEligible || isSpinning}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm uppercase tracking-[0.2em] text-[#FFC22F] font-semibold mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-400 focus:border-[#FFC22F] focus:outline-none shadow-inner"
                                        required
                                        disabled={isEligible || isSpinning}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-[#F44336]/20 border border-[#F44336]/60 rounded-xl p-4 text-white text-sm flex items-center gap-2">
                                        <span role="img" aria-label="warning">⚠️</span> {error}
                                    </div>
                                )}

                                {isEligible && (
                                    <div className="bg-[#1ABC9C]/20 border border-[#1ABC9C]/60 rounded-xl p-4 text-white text-sm flex items-center gap-2">
                                        <span role="img" aria-label="check">✅</span> Eligible! Click the wheel or button below to spin!
                                    </div>
                                )}

                                {!isEligible && (
                                    <button
                                        type="submit"
                                        disabled={isValidating || isSpinning}
                                        className="w-full bg-gradient-to-r from-[#FFC22F] via-[#FFAF1A] to-[#F96D00] hover:from-[#FFD948] hover:via-[#FFB72B] hover:to-[#FF7A1A] text-[#1A1448] font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
                                    >
                                        {isValidating ? 'Validating...' : 'Validate Order'}
                                    </button>
                                )}

                                {isEligible && (
                                    <button
                                        type="button"
                                        onClick={handleSpin}
                                        disabled={isSpinning}
                                        className="w-full bg-gradient-to-r from-[#42E695] via-[#3BB3FF] to-[#845EF7] hover:from-[#5FF5A8] hover:via-[#5BC8FF] hover:to-[#9F7BFF] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_18px_35px_rgba(0,0,0,0.3)] text-xl tracking-wide"
                                    >
                                        {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN NOW!'}
                                    </button>
                                )}
                            </form>

                            {/* Prize List */}
                            <div className="mt-10 pt-6 border-t border-white/10">
                                <h4 className="text-base font-semibold text-[#FFC22F] uppercase tracking-[0.25em] mb-4">Available Prizes</h4>
                                <ul className="space-y-2 text-sm text-gray-200">
                                    {prizes.filter(p => p.type !== 'nothing').map(prize => (
                                        <li key={prize.id} className="flex items-center gap-3">
                                            <span className="text-lg">{getPrizeEmoji(prize.type)}</span>
                                            <span className="text-white/90">{prize.display_text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right: Wheel */}
                    <div className="flex flex-col items-center">
                        <div className="rounded-full p-2 bg-gradient-to-br from-[#FFC22F] via-[#F08A24] to-[#AF1E2D] shadow-[0_12px_45px_rgba(0,0,0,0.4)]">
                            <div className="rounded-full bg-[#1A1448] p-4">
                                <SpinWheel prizes={prizes} isSpinning={isSpinning} targetPrizeId={targetPrizeId} />
                            </div>
                        </div>
                        
                        {isEligible && !isSpinning && (
                            <p className="mt-6 text-[#FFC22F] font-bold text-lg uppercase tracking-[0.35em] animate-bounce">
                                👆 Click SPIN NOW to start!
                            </p>
                        )}
                    </div>
                </div>

                {/* Important Notes */}
                <div className="mt-16 px-6 py-5 rounded-2xl bg-[#1E1653]/95 border border-[#FFC22F]/60 text-center shadow-[0_10px_35px_rgba(0,0,0,0.25)]">
                    <p className="text-sm text-gray-200">
                        <span className="text-[#FFC22F] font-semibold uppercase tracking-[0.3em]">Important:</span> Each order can only spin <span className="text-white font-semibold">ONCE</span>. 
                        Make sure your order is paid before attempting to spin. Good luck! <span role="img" aria-label="clover">🍀</span>
                    </p>
                </div>
            </div>

            {/* Result Modal */}
            {SPIN_FEATURE_ENABLED && showResult && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div
                        className={`max-w-md w-full rounded-3xl p-[1px] shadow-[0_25px_55px_rgba(0,0,0,0.55)] transition-transform duration-300 ${
                            result.type === 'nothing'
                                ? 'bg-gradient-to-br from-[#3F4465] via-[#2A2D45] to-[#121327]'
                                : 'bg-gradient-to-br from-[#42E695] via-[#3BB3FF] to-[#845EF7]'
                        }`}
                    >
                        <div className={`rounded-[2.5rem] px-8 py-10 text-center ${
                            result.type === 'nothing' ? 'bg-[#1b1f3a]/95 text-white' : 'bg-white/95 text-[#1A1448]'
                        }`}>
                            <div className="text-6xl mb-4 drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                                {result.type === 'nothing' ? '😊' : '🎉'}
                            </div>

                            <h3 className={`text-3xl font-black tracking-wide mb-6 ${
                                result.type === 'nothing' ? 'text-white' : 'text-[#1A1448]'
                            }`}>
                                {result.type === 'nothing' ? 'Better Luck Next Time!' : 'CONGRATULATIONS!'}
                            </h3>

                            <div className={`rounded-2xl px-6 py-6 mb-6 border ${
                                result.type === 'nothing'
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-gradient-to-r from-[#FFEFD3] via-white to-[#EAF6FF] border-[#FFD36E]/60'
                            }`}>
                                <p className={`text-5xl mb-3`}>{getPrizeEmoji(result.type)}</p>
                                <p className={`text-2xl font-bold ${
                                    result.type === 'nothing' ? 'text-white/90' : 'text-[#1A1448]'
                                }`}>
                                    {result.display_text || result.name}
                                </p>
                            </div>

                            <p className={`text-sm leading-relaxed mb-8 ${
                                result.type === 'nothing' ? 'text-white/75' : 'text-[#2D2A5C]'
                            }`}>
                                {result.type === 'nothing'
                                    ? 'Spin result recorded. Thanks for playing and good luck on your next spin!'
                                    : 'Prize recorded successfully! Show this result at the reward booth on event day to redeem.'}
                            </p>

                            <button
                                onClick={handleCloseResult}
                                className={`inline-flex items-center justify-center px-10 py-3 rounded-xl font-semibold transition-all ${
                                    result.type === 'nothing'
                                        ? 'bg-white/90 text-[#1B1F3A] hover:bg-white'
                                        : 'bg-[#1A1448] text-white hover:bg-[#141033]'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default SpinSection;
