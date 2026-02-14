import React from "react";

export default function Text({ 
    children, 
    className = "", 
    color = "#1F5A9F",
    textAlign = "left",
    ...props 
}) {
    return (
        <p 
            className={`font-museum tracking-[0.04em] text-[8px] leading-[10.9px] sm:text-[13px] sm:leading-[18px] md:text-[13px] md:leading-[18px] lg:text-[16px] lg:leading-[22px] xl:text-[20px] xl:leading-[30px] ${className}`}
            style={{ 
                color,
                textAlign,
                ...props.style 
            }}
            {...props}
        >
            {children}
        </p>
    );
}
