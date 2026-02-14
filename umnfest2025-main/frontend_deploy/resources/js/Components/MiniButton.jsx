import React from "react";

export default function MiniButton({ 
    children, 
    variant = "primary", 
    size = "medium", 
    className = "", 
    onClick,
    href,
    disabled = false,
    ...props 
}) {
    // Custom font sizes and padding for different breakpoints
    // Mobile: 10% smaller, SM/MD: 25% smaller, LG/XL: 40% smaller
    const baseClasses = "inline-block font-museum font-medium leading-auto text-center transition-colors duration-200 cursor-pointer text-[6.7px] px-[12.15px] py-[4.95px] rounded-[9.22px] sm:text-[9.11px] sm:px-[17.25px] sm:py-[6.75px] sm:rounded-[15.19px] md:text-[9.11px] md:px-[17.25px] md:py-[6.75px] md:rounded-[15.19px] lg:text-[9.6px] lg:px-[18px] lg:py-[4.8px] lg:rounded-[20px] xl:text-[14.4px] xl:px-[18px] xl:py-[4.8px] xl:rounded-[27px]";
    
    const variants = {
        primary: "bg-[#B42129] text-[#ffffff] hover:bg-[#892026]",
        secondary: "bg-gray-600 text-[#ffffff] hover:bg-gray-700",
        outline: "border-2 border-[#B42129] text-[#B42129] hover:bg-[#B42129] hover:text-[#ffffff]",
    };

    const sizes = {
        small: "",
        medium: "",
        large: "",
    };
    
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    
    if (href && !disabled) {
        return (
            <a 
                href={href} 
                className={classes}
                onClick={onClick}
                {...props}
            >
                {children}
            </a>
        );
    }
    
    return (
        <button 
            className={classes}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
