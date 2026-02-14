import React, { useState, useEffect } from 'react';
import '../../../css/ticket-pricing.css';
import ticketBanner from '../../../images/TicketBanner.svg';

const TicketCard = ({ type, header, price, buttonText, buttonAction, isDisabled, className, backgroundColor }) => {
    const getCardStyles = (type, customBgColor) => {
        // Use custom background color if provided, otherwise fallback to defaults
        const defaultStyleMap = {
            'early-bird': '#0E4280',
            'pre-sales-1': '#F3C019',
            'pre-sales-2': '#A42128',
            'regular': '#42B5B5',
            'coming-soon': '#E34921'
        };
        
        return {
            backgroundColor: customBgColor || defaultStyleMap[type] || defaultStyleMap['early-bird'],
            glowColor: 'shadow-lg',
            borderColor: 'border-white/20'
        };
    };

    const styles = getCardStyles(type, backgroundColor);

    return (
        <div className="group relative w-full max-w-sm">
            {/* Floating Card Container */}
            <div 
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col h-full will-change-transform"
                style={{ backgroundColor: styles.backgroundColor }}
            >
                {/* Header Badge */}
                <div className="relative z-10 p-2 sm:p-3 md:p-4 pb-0 flex-shrink-0">
                    <div className="bg-white/95 rounded-xl p-2 sm:p-2.5 md:p-3 text-center shadow-lg">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-black uppercase tracking-wider text-[#281F65] drop-shadow-sm font-museum">
                            {header}
                        </div>
                        <div className="w-6 sm:w-7 md:w-8 h-0.5 bg-gradient-to-r from-transparent via-[#281F65] to-transparent mx-auto mt-1"></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 flex-1 p-2 sm:p-3 md:p-4 pt-1.5 sm:pt-2 md:pt-2.5 pb-2.5 sm:pb-3 md:pb-3.5 flex flex-col">
                    {/* Glass Card */}
                    <div className="bg-white/95 rounded-xl p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between shadow-xl">
                        {/* Event Info */}
                        <div className="text-center flex-shrink-0">
                            {/* Date with Icon */}
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-[#281F65] rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-sm sm:text-base md:text-lg font-bold text-[#281F65] font-museum">22.11.2025</div>
                            </div>
                            
                            {/* Event Title */}
                            <div className="mb-1 sm:mb-1.5 md:mb-2">
                                <div className="text-lg sm:text-xl md:text-2xl font-black text-[#281F65] leading-none mb-1 font-museum">
                                    UNIFY 2025
                                </div>
                                <div className="text-xs sm:text-xs md:text-sm font-semibold text-[#281F65]/70 uppercase tracking-widest font-museum">
                                    UMN Festival 2025
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 my-2 sm:my-3 md:my-4">
                                <div className="w-4 sm:w-5 md:w-6 h-0.5 bg-gradient-to-r from-transparent to-[#281F65]/50"></div>
                                <div className="w-1 sm:w-1.5 md:w-1.5 h-1 sm:h-1.5 md:h-1.5 bg-[#281F65] rounded-full flex-shrink-0"></div>
                                <div className="w-4 sm:w-5 md:w-6 h-0.5 bg-gradient-to-l from-transparent to-[#281F65]/50"></div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-center flex-shrink-0">
                            <div className="bg-gradient-to-r from-[#281F65]/5 to-[#281F65]/10 rounded-lg p-2 sm:p-2.5 md:p-3 mb-2 sm:mb-3 md:mb-4">
                                <div className="text-xs font-semibold text-[#281F65]/70 uppercase tracking-wider mb-1 font-museum">
                                    Starting From
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl font-black text-[#281F65] font-museum">
                                    {price}
                                </div>
                            </div>
                            
                            {/* Action Button */}
                            <button 
                                className={`
                                    w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-bold uppercase text-xs tracking-wider font-museum
                                    transition-colors duration-200 ease-in-out cursor-pointer
                                    ${isDisabled 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : `bg-[#281F65] text-white hover:bg-[#1e1850] shadow-lg`
                                    }
                                `}
                                onClick={isDisabled ? undefined : buttonAction}
                                disabled={isDisabled}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isDisabled ? (
                                        buttonText === 'COMING SOON' ? (
                                            <>
                                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                COMING SOON
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                SOLD OUT
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                            BUY TICKET
                                        </>
                                    )}
                                </span>
                            </button>
                            
                        </div>
                    </div>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
        </div>
    );
};

export default function TicketPricingSection({ onBuyTicket }) {
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fallback data in case API fails
    const fallbackTicketTypes = [
        {
            type: 'early-bird',
            header: 'Early Bird',
            price: 'IDR 59,000',
            buttonText: 'SOLD OUT',
            isDisabled: true,
            className: 'early-bird'
        },
        {
            type: 'pre-sales-1',
            header: 'Pre-Sales 1',
            price: 'IDR 65,000',
            buttonText: 'SOLD OUT',
            isDisabled: true,
            className: 'pre-sales-1'
        },
        {
            type: 'pre-sales-2',
            header: 'Pre-Sales 2',
            price: 'IDR 77,000',
            buttonText: 'BUY TICKET',
            isDisabled: false,
            className: 'pre-sales-2',
            buttonAction: () => onBuyTicket('pre-sales-2')
        },
        {
            type: 'regular',
            header: 'Regular',
            price: '-',
            buttonText: 'COMING SOON',
            isDisabled: true,
            className: 'regular'
        },
        {
            type: 'coming-soon',
            header: 'Coming Soon',
            price: '-',
            buttonText: 'COMING SOON',
            isDisabled: true,
            className: 'coming-soon'
        }
    ];

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const response = await fetch('/api/ticket-types');
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Map API data to include button actions
                    const mappedData = data.data.map(ticket => ({
                        ...ticket,
                        buttonAction: ticket.buttonAction && !ticket.isDisabled 
                            ? () => onBuyTicket(ticket.buttonAction) 
                            : undefined
                    }));
                    setTicketTypes(mappedData);
                } else {
                    throw new Error('Failed to fetch ticket types');
                }
            } catch (err) {
                console.error('Error fetching ticket types:', err);
                setError(err.message);
                // Use fallback data
                setTicketTypes(fallbackTicketTypes);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketTypes();
    }, [onBuyTicket]);

    // Show loading state
    if (loading) {
        return (
            <div id="tickets-section" className="bg-[#281F65] pb-10 font-museum">
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <div className="w-full max-w-7xl flex flex-col items-center">
                        <img
                            src={ticketBanner}
                            alt="UNIFY 2025 Festival"
                            className="w-full mb-8 sm:mb-10 md:mb-12 mt-4 sm:mt-6 md:mt-8"
                        />
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 w-full max-w-6xl">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] md:w-72 lg:w-80">
                                    <div className="bg-gray-300 animate-pulse rounded-2xl h-96" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="tickets-section" className="bg-[#281F65] pb-10 font-museum">
            {/* Content Container */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-7xl flex flex-col items-center">
                    {/* Hero Banner */}
                    <img
                        src={ticketBanner}
                        alt="UNIFY 2025 Festival"
                        className="w-full mb-8 sm:mb-10 md:mb-12 mt-4 sm:mt-6 md:mt-8"
                    />

                    {/* Tickets Grid - Centered Layout */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 w-full max-w-6xl">
                        {ticketTypes.map((ticket) => (
                            <div key={ticket.type} className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] md:w-72 lg:w-80">
                                <TicketCard
                                    type={ticket.type}
                                    header={ticket.header}
                                    price={ticket.price}
                                    buttonText={ticket.buttonText}
                                    buttonAction={ticket.buttonAction}
                                    isDisabled={ticket.isDisabled}
                                    className={ticket.className}
                                    backgroundColor={ticket.backgroundColor}
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}