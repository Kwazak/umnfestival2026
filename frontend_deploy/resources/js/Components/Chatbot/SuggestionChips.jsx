import React from 'react';
import { motion } from 'framer-motion';

const SuggestionChips = ({ suggestions, onSuggestionClick, colors, language, isFullScreen = false }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className={`flex flex-wrap gap-${isFullScreen ? '3' : '2'}`}>
                {suggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSuggestionClick(suggestion)}
                        className={`${isFullScreen ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs'} font-medium transition-all duration-200 text-left flex-shrink-0 max-w-full rounded-xl shadow-sm hover:shadow-md border-2`}
                        style={{
                            backgroundColor: colors.white,
                            color: colors.primary,
                            borderColor: colors.primary + '30'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.primary + '08';
                            e.target.style.borderColor = colors.primary + '60';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = `0 8px 25px -5px ${colors.primary}30, 0 0 0 1px ${colors.primary}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.white;
                            e.target.style.borderColor = colors.primary + '30';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                        }}
                    >
                        <span className="block truncate">
                            {suggestion}
                        </span>
                    </motion.button>
                ))}
            </div>
            
            {/* Enhanced helper text */}
            <div className="text-center mt-3">
                <p className={`${isFullScreen ? 'text-sm' : 'text-xs'} flex items-center justify-center space-x-2`} 
                   style={{ color: colors.gray + '80' }}>
                    <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></span>
                    <span>
                        {language === 'id' 
                            ? 'Klik pertanyaan di atas untuk memulai percakapan'
                            : 'Click a question above to start the conversation'
                        }
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SuggestionChips;