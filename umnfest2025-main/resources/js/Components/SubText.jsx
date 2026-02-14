import React from "react";

export default function SubText({ 
    children, 
    className = "", 
    color = "#1F5A9F",
    textAlign = "left",
    ...props 
}) {
    return (
        <p 
            className={`font-museum tracking-[0.04em] text-[10px] leading-[10.9px] sm:text-[15px] sm:leading-[18px] md:text-[15px] md:leading-[18px] lg:text-[18px] lg:leading-[22px] xl:text-[22px] xl:leading-[30px] ${className}`}
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
