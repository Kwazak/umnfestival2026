import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import LanguageToggle from './LanguageToggle';
import MessageInput from './MessageInput';
import { motion } from 'framer-motion';

const ChatWindow = ({ 
    isOpen, 
    onClose, 
    language, 
    onLanguageChange, 
    messages, 
    onSendMessage, 
    isLoading, 
    colors,
    sessionId 
}) => {
    const messagesEndRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load initial suggestions on language change
    useEffect(() => {
        const loadInitialSuggestions = async () => {
            try {
                const response = await fetch(`/api/chatbot/suggestions?language=${language}`);
                const data = await response.json();
                if (data.success) {
                    setSuggestions(data.data.suggestions);
                }
            } catch (error) {
                console.error('Failed to load initial suggestions:', error);
                // Hardcoded fallback
                const hardcodedSuggestions = language === 'id' ? [
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
                ];
                setSuggestions(hardcodedSuggestions);
            }
        };
        loadInitialSuggestions();
    }, [language]);

    // ✅ ALWAYS UPDATE SUGGESTIONS AFTER EACH BOT RESPONSE - NEVER HIDE FAQ!
    useEffect(() => {
        const updateSuggestions = async () => {
            if (!sessionId) return;

            // Get the last bot message to check for suggestions
            const lastBotMessage = messages.filter(msg => msg.type === 'bot').pop();
            
            if (lastBotMessage && lastBotMessage.suggestions && lastBotMessage.suggestions.length > 0) {
                // Use suggestions from bot response (contextual FAQ)
                setSuggestions(lastBotMessage.suggestions);
            } else if (messages.length > 1) {
                // Fetch contextual suggestions based on conversation
                try {
                    const response = await fetch(`/api/chatbot/suggestions?language=${language}&session_id=${sessionId}`);
                    const data = await response.json();
                    if (data.success && data.data.suggestions && data.data.suggestions.length > 0) {
                        setSuggestions(data.data.suggestions);
                    } else {
                        // Emergency fallback - load default suggestions
                        const fallbackResponse = await fetch(`/api/chatbot/suggestions?language=${language}`);
                        const fallbackData = await fallbackResponse.json();
                        if (fallbackData.success) {
                            setSuggestions(fallbackData.data.suggestions);
                        }
                    }
                } catch (error) {
                    console.error('Failed to load contextual suggestions:', error);
                    // Fallback to default suggestions - NEVER let FAQ disappear!
                    try {
                        const fallbackResponse = await fetch(`/api/chatbot/suggestions?language=${language}`);
                        const fallbackData = await fallbackResponse.json();
                        if (fallbackData.success) {
                            setSuggestions(fallbackData.data.suggestions);
                        }
                    } catch (fallbackError) {
                        console.error('Failed to load fallback suggestions:', fallbackError);
                        // Ultimate fallback - hardcoded FAQ
                        const hardcodedSuggestions = language === 'id' ? [
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
                        ];
                        setSuggestions(hardcodedSuggestions);
                    }
                }
            }
        };

        // Always update suggestions after messages change
        updateSuggestions();
    }, [messages, language, sessionId]);

    const handleSuggestionClick = (suggestion) => {
        onSendMessage(suggestion);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const toggleSuggestions = () => {
        setShowSuggestions(!showSuggestions);
    };

    // Enhanced color scheme for better contrast and harmony
    const enhancedColors = {
        ...colors,
        // Full screen specific colors for better contrast
        fullScreenBg: '#FFFFFF',
        fullScreenBorder: colors.primary,
        overlayBg: 'rgba(40, 31, 101, 0.85)', // Using primary color with opacity
        headerGradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.blue} 100%)`,
        shadowColor: 'rgba(40, 31, 101, 0.3)',
    };

    // ✅ MAXIMUM Z-INDEX FOR FULL SCREEN - COVERS EVERYTHING INCLUDING NAVBAR
    const windowClasses = isFullScreen 
        ? "fixed inset-3 w-auto h-auto max-w-6xl max-h-[96vh] mx-auto bg-white rounded-2xl border-2 flex flex-col overflow-hidden"
        : "w-96 sm:w-[420px] md:w-96 h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col overflow-hidden";

    const windowStyle = isFullScreen 
        ? { 
            borderColor: enhancedColors.fullScreenBorder,
            boxShadow: `0 25px 50px -12px ${enhancedColors.shadowColor}, 0 0 0 1px ${enhancedColors.fullScreenBorder}20`,
            zIndex: 99999 // ✅ MAXIMUM Z-INDEX
        }
        : { 
            borderColor: colors.lightGray,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        };

    return (
        <>
            {/* ✅ FULL SCREEN OVERLAY BACKGROUND - COVERS EVERYTHING */}
            {isFullScreen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0"
                    style={{ 
                        background: enhancedColors.overlayBg,
                        backdropFilter: 'blur(8px)',
                        zIndex: 99998 // Just below the chat window
                    }}
                    onClick={toggleFullScreen}
                />
            )}

            {/* ✅ CHAT WINDOW WITH MAXIMUM Z-INDEX */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={windowClasses}
                style={windowStyle}
            >
                {/* ✅ ENHANCED HEADER WITH GRADIENT AND BETTER CONTRAST */}
                <div 
                    className="p-4 border-b flex justify-between items-center flex-shrink-0"
                    style={{ 
                        background: enhancedColors.headerGradient,
                        borderBottomColor: enhancedColors.fullScreenBorder + '30'
                    }}
                >
                    <div className="flex items-center space-x-3">
                        {/* Enhanced Bot Avatar */}
                        <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-white/30"
                            style={{ backgroundColor: colors.white }}
                        >
                            <svg 
                                className="w-7 h-7" 
                                style={{ color: colors.primary }}
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H9V9H21ZM12 8C14.76 8 17 10.24 17 13S14.76 18 12 18S7 15.76 7 13S9.24 8 12 8ZM12 10C10.34 8 8.66 10.34 10 12C10.34 13.66 12 12 12 10Z"/>
                            </svg>
                        </div>
                        
                        <div>
                            <h3 className="text-white font-bold text-base drop-shadow-sm">
                                {language === 'id' ? 'Asisten AI UMN Festival (BETA)' : 'UMN Festival AI Assistant (BETA)'}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-white/90 text-sm font-medium">
                                    {language === 'id' ? 'Online sekarang' : 'Online now'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Enhanced Control Buttons */}
                        <button 
                            onClick={toggleSuggestions}
                            className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-lg backdrop-blur-sm"
                            title={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d={showSuggestions ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                            </svg>
                        </button>

                        <button 
                            onClick={toggleFullScreen}
                            className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-lg backdrop-blur-sm"
                            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d={isFullScreen 
                                        ? "M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                                        : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                    } />
                            </svg>
                        </button>

                        <LanguageToggle 
                            language={language} 
                            onChange={onLanguageChange}
                            colors={colors}
                        />
                        
                        <button 
                            onClick={onClose}
                            className="text-white/90 hover:text-white hover:bg-red-500/30 transition-all duration-200 p-2 rounded-lg backdrop-blur-sm"
                            title="Close chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Messages Area - Enhanced for full screen */}
                    <div 
                        className={`flex-1 overflow-y-auto p-4 space-y-4 ${isFullScreen ? 'p-6 space-y-6' : 'p-4 space-y-4'}`}
                        style={{ 
                            background: isFullScreen 
                                ? 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)'
                                : '#f9fafb'
                        }}
                    >
                        {messages.map((message) => (
                            <MessageBubble 
                                key={message.id} 
                                message={message} 
                                colors={enhancedColors}
                                language={language}
                                isFullScreen={isFullScreen}
                            />
                        ))}
                        
                        {/* Enhanced Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div 
                                    className="max-w-xs px-4 py-3 rounded-xl shadow-sm"
                                    style={{ 
                                        backgroundColor: colors.white,
                                        border: `1px solid ${colors.lightGray}`
                                    }}
                                >
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: colors.primary }}></div>
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '0.1s' }}></div>
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ✅ ENHANCED SUGGESTIONS SECTION */}
                    {suggestions.length > 0 && showSuggestions && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-white flex-shrink-0" 
                            style={{ 
                                borderTopColor: colors.primary + '20',
                                background: isFullScreen 
                                    ? 'linear-gradient(to right, #ffffff 0%, #f8fafc 100%)'
                                    : '#ffffff'
                            }}
                        >
                            <div className={`${isFullScreen ? 'p-6' : 'p-4'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: colors.primary }}
                                        ></div>
                                        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                                            {language === 'id' ? '💡 Pertanyaan yang mungkin membantu' : '💡 Suggested questions'}
                                        </p>
                                    </div>
                                    <span 
                                        className="text-xs px-2 py-1 rounded-full"
                                        style={{ 
                                            backgroundColor: colors.primary + '10',
                                            color: colors.primary
                                        }}
                                    >
                                        {suggestions.length} {language === 'id' ? 'saran' : 'suggestions'}
                                    </span>
                                </div>
                                
                                {/* Enhanced scrollable suggestions container */}
                                <div className={`${isFullScreen ? 'max-h-32' : 'max-h-24'} overflow-y-auto`}>
                                    <SuggestionChips 
                                        suggestions={suggestions.slice(0, isFullScreen ? 12 : 8)}
                                        onSuggestionClick={handleSuggestionClick}
                                        colors={enhancedColors}
                                        language={language}
                                        isFullScreen={isFullScreen}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Enhanced Input Area */}
                    <div 
                        className={`border-t flex-shrink-0 ${isFullScreen ? 'p-6' : 'p-4'}`} 
                        style={{ 
                            borderTopColor: colors.primary + '20',
                            background: isFullScreen 
                                ? 'linear-gradient(to right, #ffffff 0%, #f8fafc 100%)'
                                : '#ffffff'
                        }}
                    >
                        <MessageInput 
                            onSend={onSendMessage} 
                            language={language}
                            colors={enhancedColors}
                            disabled={isLoading}
                            isFullScreen={isFullScreen}
                        />
                    </div>
                </div>

                {/* Footer - Only show in normal mode */}
                {!isFullScreen && (
                    <div className="px-4 py-3 text-center flex-shrink-0 border-t" style={{ borderTopColor: colors.lightGray }}>
                        <p className="text-xs" style={{ color: colors.gray }}>
                            {language === 'id' 
                                ? '🚀 Didukung oleh UMN Festival 2025'
                                : '🚀 Powered by UMN Festival 2025'
                            }
                        </p>
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default ChatWindow;