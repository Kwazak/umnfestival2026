// resources/js/Components/UnderConstruction.jsx
import React from "react";
import ErrorBackground from "../../images/ErrorBackground.png";
import logoImage from "../../images/LogoUfest2.svg"; 
import titleImage from "../../images/TitleImageForge.png";
import ChatbotWidget from "./Chatbot/ChatbotWidget";

export default function UnderConstruction({ 

}) {
    return (
        <div 
            className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden"
            style={{
                backgroundImage: `url(${ErrorBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Main content container with scroll fallback */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 overflow-y-auto pb-20">
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-full py-4 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
                    
                    {/* Top logo */}
                    <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] xl:max-w-[500px]">
                        <img 
                            src={logoImage} 
                            alt="Logo"
                            className="w-full h-auto max-h-[12vh] sm:max-h-[15vh] md:max-h-[18vh] lg:max-h-[22vh] object-contain"
                        />
                    </div>
                    
                    {/* Main title image */}
                    <div className="flex-shrink-0 w-full max-w-[350px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] xl:max-w-[700px]">
                        <img 
                            src={titleImage} 
                            alt="Title"
                            className="w-full h-auto max-h-[15vh] sm:max-h-[18vh] md:max-h-[22vh] lg:max-h-[26vh] object-contain"
                        />
                    </div>
                    
                    {/* Notification text */}
                    <div className="text-center flex-shrink-0 px-4">
                        <p 
                            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-tight sm:leading-normal"
                            style={{
                                fontFamily: 'LT Museum',
                                fontWeight: 'bold',
                                color: '#1253A0',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                            }}
                        >
                            THIS SITE IS CURRENTLY UNDER CONSTRUCTIONS
                            <br />
                            PLEASE COME BACK ANOTHER TIME
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Footer section - only bottom part */}
            <div 
                className="w-full z-10 pt-0 pb-5.5 lg:pt-4 lg:pb-4"
                style={{ backgroundColor: '#CD5433' }}
            >

                    <p className="text-xs sm:text-sm text-white text-center mt-0 mb-0 pt-0 pb-1 lg:pb-0">
                        Copyright ©2025 UMN Festival Codex and Illusionist
                        Division
                    </p>
            </div>
            
            {/* Chatbot Widget - appears on all pages */}
            <ChatbotWidget />
        </div>
    );
}