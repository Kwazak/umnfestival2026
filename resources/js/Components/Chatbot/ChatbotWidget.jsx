import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState('en');
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    
    // ✅ TOOLTIP SYSTEM - SHOW ONLY ONCE PER SESSION
    const [showTooltip, setShowTooltip] = useState(false);

    // Enhanced color theme with better contrast
    const colors = {
        primary: '#281F65',
        white: '#FFFFFF',
        blue: '#0E4280',
        yellow: '#F3C019',
        teal: '#42B5B5',
        red: '#A42128',
        orange: '#E34921',
        gray: '#545454',
        lightGray: '#D9D9D9',
        // Enhanced colors for better visibility
        primaryLight: '#3B2F7A',
        primaryDark: '#1A1347',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6'
    };

    // Generate session ID on mount
    useEffect(() => {
        const generateSessionId = () => {
            return 'chatbot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        };
        setSessionId(generateSessionId());
    }, []);

    // ✅ TOOLTIP LOGIC - SHOW ONLY ONCE PER SESSION
    useEffect(() => {
        // Check if tooltip has been shown before in this session
        const tooltipShown = sessionStorage.getItem('chatbot_tooltip_shown');
        
        if (!tooltipShown) {
            // Show tooltip after 2 seconds when page loads (first time only)
            const showTimer = setTimeout(() => {
                if (!isOpen) {
                    setShowTooltip(true);
                    // Mark tooltip as shown in session storage
                    sessionStorage.setItem('chatbot_tooltip_shown', 'true');
                }
            }, 2000);

            // Auto-hide tooltip after 6 seconds total (4 seconds visible)
            const hideTimer = setTimeout(() => {
                setShowTooltip(false);
            }, 8000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []); // Empty dependency array - only runs once on mount

    // Initialize with welcome message
    useEffect(() => {
        if (sessionId && messages.length === 0) {
            const welcomeMessage = {
                id: Date.now(),
                type: 'bot',
                content: language === 'id' 
                    ? 'Halo! 👋 Saya asisten AI UMN Festival 2025. Ada yang bisa saya bantu tentang festival ini? Klik tombol full screen untuk pengalaman yang lebih baik!'
                    : 'Hello! 👋 I\'m the UMN Festival 2025 AI assistant. How can I help you with the festival? Click the full screen button for a better experience!',
                timestamp: new Date(),
                suggestions: language === 'id' ? [
                    "Apa itu UMN Festival 2025?",
                    "Siapa saja bintang tamu yang tampil?",
                    "Berapa harga tiket dan dimana belinya?",
                    "Acara dan kegiatan apa saja yang ada?",
                    "Dimana bisa beli merchandise resmi?"
                ] : [
                    "What is UMN Festival 2025?",
                    "Who are the guest stars performing?",
                    "How much are the tickets and where to buy?",
                    "What events and activities are happening?",
                    "Where can I buy official merchandise?"
                ]
            };
            setMessages([welcomeMessage]);
        }
    }, [sessionId, language]);

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    language: language,
                    session_id: sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: data.data.response,
                    category: data.data.category,
                    suggestions: data.data.suggestions, // ✅ ALWAYS INCLUDE SUGGESTIONS FROM BACKEND
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMessage]);
                
                // Show notification if chat is closed
                if (!isOpen) {
                    setHasNewMessage(true);
                }
            } else {
                throw new Error(data.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: language === 'id' 
                    ? 'Maaf, terjadi kesalahan. Silakan coba lagi.'
                    : 'Sorry, an error occurred. Please try again.',
                timestamp: new Date(),
                suggestions: language === 'id' ? [
                    "Apa itu UMN Festival 2025?",
                    "Siapa saja bintang tamu yang tampil?",
                    "Berapa harga tiket dan dimana belinya?",
                    "Bantuan teknis"
                ] : [
                    "What is UMN Festival 2025?",
                    "Who are the guest stars performing?",
                    "How much are the tickets and where to buy?",
                    "Technical support"
                ]
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setHasNewMessage(false);
        setShowTooltip(false); // Hide tooltip when chat opens
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        // Add language change message
        const changeMessage = {
            id: Date.now(),
            type: 'system',
            content: newLanguage === 'id' 
                ? '🌐 Bahasa diubah ke Bahasa Indonesia'
                : '🌐 Language changed to English',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, changeMessage]);
    };

    // ✅ HANDLE TOOLTIP DISMISS (OPTIONAL - USER CAN STILL CLOSE IT)
    const handleTooltipDismiss = () => {
        setShowTooltip(false);
    };

    return (
        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-[99997]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        {/* ✅ RESPONSIVE FLOATING BUTTON */}
                        <motion.button
                            onClick={handleOpen}
                            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full shadow-2xl flex items-center justify-center text-white relative overflow-hidden group ring-2 sm:ring-4 ring-white/20"
                            style={{ 
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                                boxShadow: `0 8px 20px -5px ${colors.primary}40, 0 0 0 1px ${colors.primary}20`
                            }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* ✅ RESPONSIVE CHAT ICON */}
                            <svg 
                                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-all duration-300 group-hover:scale-110 drop-shadow-sm" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2.5} 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                />
                            </svg>

                            {/* ✅ RESPONSIVE NEW MESSAGE INDICATOR */}
                            {hasNewMessage && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-1 sm:ring-2 ring-white"
                                    style={{ backgroundColor: colors.orange }}
                                >
                                    <div className="w-full h-full rounded-full animate-ping" style={{ backgroundColor: colors.orange }}></div>
                                </motion.div>
                            )}

                            {/* Enhanced Pulse Effect */}
                            <div 
                                className="absolute inset-0 rounded-full animate-pulse opacity-30"
                                style={{ backgroundColor: colors.primaryLight }}
                            ></div>

                            {/* Glow Effect */}
                            <div 
                                className="absolute inset-0 rounded-full opacity-20 blur-sm"
                                style={{ backgroundColor: colors.primary }}
                            ></div>
                        </motion.button>

                        {/* ✅ TOOLTIP - SHOWS ONLY ONCE PER SESSION */}
                        <AnimatePresence>
                            {showTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute right-16 sm:right-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-2xl border border-gray-700 hidden sm:block"
                                    style={{ zIndex: 99996 }}
                                >
                                    {/* Optional close button */}
                                    <button
                                        onClick={handleTooltipDismiss}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <div className="font-semibold text-white">
                                        {language === 'id' ? '🤖 Butuh bantuan?' : '🤖 Need help?'}
                                    </div>
                                    <div className="text-xs text-gray-300 mt-1 hidden lg:block">
                                        {language === 'id' ? 'Chat dengan AI assistant kami' : 'Chat with our AI assistant'}
                                    </div>
                                    
                                    {/* Arrow */}
                                    <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-3 sm:border-l-4 border-l-gray-900 border-t-3 sm:border-t-4 border-t-transparent border-b-3 sm:border-b-4 border-b-transparent"></div>
                                    
                                    {/* Progress bar showing remaining time */}
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 rounded-b-lg" 
                                         style={{ 
                                             width: '100%',
                                             animation: 'shrink 4s linear forwards'
                                         }}>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ✅ RESPONSIVE CHAT WINDOW */}
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mb-2 sm:mb-4"
                    >
                        <ChatWindow
                            isOpen={isOpen}
                            onClose={handleClose}
                            language={language}
                            onLanguageChange={handleLanguageChange}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            colors={colors}
                            sessionId={sessionId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ CUSTOM STYLES FOR TOOLTIP ANIMATION */}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default ChatbotWidget;