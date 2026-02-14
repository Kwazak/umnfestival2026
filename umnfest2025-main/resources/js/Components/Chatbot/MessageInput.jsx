import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MessageInput = ({ onSend, language, colors, disabled }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const placeholder = language === 'id' 
        ? 'Ketik pesan Anda...'
        : 'Type your message...';

    return (
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1 relative">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{
                        borderColor: colors.lightGray,
                        focusRingColor: colors.primary,
                        maxHeight: '100px'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = colors.lightGray;
                        e.target.style.boxShadow = 'none';
                    }}
                    onInput={(e) => {
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                />
                
                {/* Character counter */}
                {message.length > 400 && (
                    <div 
                        className="absolute -top-5 right-0 text-xs"
                        style={{ 
                            color: message.length > 500 ? colors.red : colors.gray 
                        }}
                    >
                        {message.length}/500
                    </div>
                )}
            </div>

            {/* Send Button */}
            <motion.button
                type="submit"
                disabled={!message.trim() || disabled || message.length > 500}
                className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: (!message.trim() || disabled || message.length > 500) 
                        ? colors.lightGray 
                        : colors.primary
                }}
                whileHover={(!message.trim() || disabled || message.length > 500) ? {} : { scale: 1.05 }}
                whileTap={(!message.trim() || disabled || message.length > 500) ? {} : { scale: 0.95 }}
            >
                {disabled ? (
                    // Loading spinner
                    <svg 
                        className="w-5 h-5 animate-spin" 
                        style={{ color: colors.gray }}
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    // Send icon
                    <svg 
                        className="w-5 h-5" 
                        style={{ 
                            color: (!message.trim() || message.length > 500) 
                                ? colors.gray 
                                : colors.white 
                        }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                        />
                    </svg>
                )}
            </motion.button>
        </form>
    );
};

export default MessageInput;