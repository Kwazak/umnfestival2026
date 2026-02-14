import React from 'react';
import { motion } from 'framer-motion';

const LanguageToggle = ({ language, onChange, colors }) => {
    const handleToggle = () => {
        onChange(language === 'en' ? 'id' : 'en');
    };

    return (
        <motion.button
            onClick={handleToggle}
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200"
            style={{
                backgroundColor: colors.white + '20',
                color: colors.white
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Language Icon */}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
                />
            </svg>
            
            {/* Language Text */}
            <span>{language === 'en' ? 'EN' : 'ID'}</span>
            
            {/* Toggle Indicator */}
            <div className="flex space-x-1">
                <div 
                    className={`w-1 h-1 rounded-full transition-all duration-200 ${
                        language === 'en' ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: colors.white }}
                />
                <div 
                    className={`w-1 h-1 rounded-full transition-all duration-200 ${
                        language === 'id' ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: colors.white }}
                />
            </div>
        </motion.button>
    );
};

export default LanguageToggle;