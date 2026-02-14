import React from "react";

/**
 * Button component with responsive design and customizable styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button style variant: "primary", "secondary", "outline"
 * @param {string} props.size - Button size: "small", "medium", "large" (currently unused but available for extension)
 * @param {string} props.className - Additional CSS classes to override default styles
 * @param {Function} props.onClick - Click handler
 * @param {string} props.href - If provided, renders as <a> tag instead of <button>
 * @param {boolean} props.disabled - Disables the button
 * @param {string} props.fontSize - Custom font size (CSS value like "12px", "1.5rem")
 * @param {string} props.padding - Custom padding (CSS value like "8px 16px")
 * @param {string} props.scale - Scale percentage for font size only (e.g., "80%" reduces font size by 20%, padding stays responsive)
 * 
 * Usage examples:
 * // Default responsive button
 * <Button>Click me</Button>
 * 
 * // Scale button font size to 60% of default size (padding stays responsive)
 * <Button scale="60%">Smaller text button</Button>
 * 
 * // Custom styling with className (recommended for Tailwind)
 * <Button className="text-[12px] px-4 py-2">Small button</Button>
 * 
 * // Custom styling with props
 * <Button fontSize="14px" padding="6px 12px">Custom button</Button>
 * 
 * // Link button
 * <Button href="/about">About</Button>
 */
export default function Button({ 
    children, 
    variant = "primary", 
    size = "medium", 
    className = "", 
    onClick,
    href,
    disabled = false,
    fontSize,
    padding,
    scale,
    ...props 
}) {
    // Default responsive classes
    const defaultClasses = "text-[7.45px] px-[13.5px] py-[5.5px] rounded-[9.22px] sm:text-[12.15px] sm:px-[23px] sm:py-[9px] sm:rounded-[15.19px] md:text-[12.15px] md:px-[23px] md:py-[9px] md:rounded-[15.19px] lg:text-[16px] lg:px-[30px] lg:py-[8px] lg:rounded-[20px] xl:text-[24px] xl:px-[30px] xl:py-[8px] xl:rounded-[27px]";
    
    // Base classes (always applied)
    const baseClasses = "inline-block font-museum font-medium leading-auto text-center transition-colors duration-200 cursor-pointer";
    
    // Use default responsive classes unless overridden by fontSize/padding props or className
    const shouldUseCustomSizing = fontSize || padding || className.includes('text-') || className.includes('px-') || className.includes('py-') || (scale && parseFloat(scale.replace('%', '')) !== 100);
    const responsiveClasses = shouldUseCustomSizing
        ? "rounded-[9.22px] sm:rounded-[15.19px] md:rounded-[15.19px] lg:rounded-[20px] xl:rounded-[27px]" 
        : defaultClasses;
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
    
    // Combine all classes
    const classes = `${baseClasses} ${responsiveClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    
    // Apply custom inline styles for fontSize, padding, and scale if provided
    const customStyles = {};
    if (fontSize) {
        customStyles.fontSize = fontSize;
    }
    if (padding) {
        customStyles.padding = padding;
    }
    if (scale && !fontSize) {
        // Only apply scale to font size if fontSize is not explicitly set AND scale is not 100%
        const scaleValue = parseFloat(scale.replace('%', '')) / 100;
        if (scaleValue !== 1) {
            customStyles.fontSize = `calc(1em * ${scaleValue})`;
        }
    }
    
    if (href && !disabled) {
        return (
            <a 
                href={href} 
                className={classes}
                style={customStyles}
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
            style={customStyles}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
