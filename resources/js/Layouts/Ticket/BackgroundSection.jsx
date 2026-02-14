    import React from "react";

    export default function BackgroundSection() {
        return (
            <div
                className="fixed inset-0 w-full h-full -z-10"
                style={{
                    background:
                        "linear-gradient(180deg,rgba(255, 194, 47, 1) 0%, rgba(255, 194, 47, 1) 20%, rgba(242, 118, 46, 1) 100%)",
                }}
            />
        );
    }
    