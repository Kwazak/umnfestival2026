import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, colors, language }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // System messages (language changes, etc.)
    if (isSystem) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
            >
                <div 
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ 
                        backgroundColor: colors.lightGray,
                        color: colors.gray 
                    }}
                >
                    {message.content}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex items-end space-x-2 max-w-xs ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isUser && (
                    <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <svg 
                            className="w-4 h-4 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H9V9H21ZM12 8C14.76 8 17 10.24 17 13S14.76 18 12 18S7 15.76 7 13S9.24 8 12 8ZM12 10C10.34 8 8.66 10.34 10 12C10.34 13.66 12 12 12 10Z"/>
                        </svg>
                    </div>
                )}

                {/* Message Content */}
                <div className="flex flex-col">
                    <div
                        className={`px-4 py-2 rounded-lg ${
                            isUser 
                                ? 'rounded-br-sm' 
                                : 'rounded-bl-sm'
                        }`}
                        style={{
                            backgroundColor: isUser ? colors.primary : colors.white,
                            color: isUser ? colors.white : colors.gray,
                            border: isUser ? 'none' : `1px solid ${colors.lightGray}`
                        }}
                    >
                        {/* Message text with line breaks preserved */}
                        <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                        </div>

                        {/* Category badge for bot messages */}
                        {!isUser && message.category && (
                            <div className="mt-2">
                                <span 
                                    className="inline-block px-2 py-1 text-xs rounded-full"
                                    style={{ 
                                        backgroundColor: colors.teal + '20',
                                        color: colors.teal 
                                    }}
                                >
                                    {getCategoryLabel(message.category, language)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        <span style={{ color: colors.gray + '80' }}>
                            {formatTime(message.timestamp)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Helper function to get category labels
const getCategoryLabel = (category, language) => {
    const labels = {
        en: {
            general: 'General',
            tickets: 'Tickets',
            events: 'Events',
            guest_stars: 'Guest Stars',
            merchandise: 'Merchandise',
            location: 'Location',
            dates: 'Schedule',
            contact: 'Contact',
            faq: 'FAQ',
            safety: 'Safety',
            fallback: 'Help',
            error: 'Error'
        },
        id: {
            general: 'Umum',
            tickets: 'Tiket',
            events: 'Acara',
            guest_stars: 'Bintang Tamu',
            merchandise: 'Merchandise',
            location: 'Lokasi',
            dates: 'Jadwal',
            contact: 'Kontak',
            faq: 'FAQ',
            safety: 'Keamanan',
            fallback: 'Bantuan',
            error: 'Error'
        }
    };

    return labels[language]?.[category] || category;
};

export default MessageBubble;