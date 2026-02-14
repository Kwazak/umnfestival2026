import React from "react";

export default function HeadText({ 
    children, 
    className = "", 
    color = "#1F5A9F",
    textAlign = "left",
    ...props 
}) {
    return (
        <h1 
            className={`font-museum font-bold tracking-[0.04em] text-[14px] leading-[13.8px] sm:text-[23px] sm:leading-[22.8px] md:text-[23px] md:leading-[22.8px] lg:text-[30px] lg:leading-[30px] xl:text-[45px] xl:leading-[30px] ${className}`}
            style={{ 
                color,
                textAlign,
                ...props.style 
            }}
            {...props}
        >
            {children}
        </h1>
    );
}
