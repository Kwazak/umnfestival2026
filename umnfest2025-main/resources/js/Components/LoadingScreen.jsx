import React, { useState, useEffect } from 'react';
import Tree from '../../images/Tree.svg';
import LogoUfest2 from '../../images/LogoUfest2.svg';
import LoadingText from '../../images/LoadingText.svg';

const LoadingScreen = ({ 
    image1Url = {LogoUfest2}, 
    image2Url = {LoadingText}, 
    bottomImageUrl = {Tree},
    progress = 0,
    onLoadingComplete = null 
}) => {
    const [currentProgress, setCurrentProgress] = useState(0);

    useEffect(() => {
        if (progress > currentProgress) {
            const timer = setTimeout(() => {
                setCurrentProgress(prev => Math.min(prev + 1, progress));
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [progress, currentProgress]);

    useEffect(() => {
        if (currentProgress >= 100 && onLoadingComplete) {
            const timer = setTimeout(() => {
                onLoadingComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentProgress, onLoadingComplete]);

    return (
        <div 
            className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50"
            style={{
                backgroundColor: '#FFF5D6'
            }}
        >
            {/* Bottom Image - Full width at bottom with lower z-index */}
            {bottomImageUrl && (
                <div className="absolute bottom-[0px] lg:bottom-[-80px] xl:bottom-[-100px] left-0 w-full z-0 border-none">
                    <img 
                        src={bottomImageUrl} 
                        alt="Bottom Background" 
                        className="w-full h-auto object-cover object-bottom border-none"
                    />
                </div>
            )}
            
            {/* Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center mt-[-50px] space-y-8">
                
                {/* Image Container */}
                <div className="flex flex-col items-center space-y-6">
                    {/* Gambar 1 */}
                    {image1Url ? (
                        <img 
                            src={image1Url} 
                            alt="Loading Image 1" 
                            className="w-[25vw] object-contain
                                     sm:w-[100px] 
                                     md:w-[140px] 
                                     lg:w-[150px] "
                        />
                    ) : (
                        <div>
                        </div>
                    )}
                    
                    {/* Gambar 2 */}
                    {image2Url ? (
                        <img 
                            src={image2Url} 
                            alt="Loading Image 2" 
                            className="w-[70vw] object-contain
                                     sm:w-[350px] 
                                     md:w-[500px] 
                                     lg:w-[550px]  mt-[-15px]"
                        />
                    ) : (
                        <div>
                        </div>
                    )}
                </div>

                {/* Progress Bar Container */}
                <div className="w-[80vw] sm:w-[60%] md:w-[550px] lg:w-[650px] xl:w-[750px] px-2 mt-[-5px]">
                    {/* Progress Bar */}
                    <div className="relative">
                        {/* Outer Border (Stroke) */}
                        <div 
                            className="w-full h-[32px] rounded-full border-4 bg-white overflow-hidden"
                            style={{ borderColor: '#F9CC4C' }}
                        >
                            {/* Progress Fill */}
                            <div 
                                className="h-full rounded-full transition-all duration-300 ease-out"
                                style={{ 
                                    backgroundColor: '#B42129',
                                    width: `${currentProgress}%`,
                                    minWidth: currentProgress > 0 ? '8%' : '0%'
                                }}
                            ></div>
                        </div>
                        
                        {/* Progress Text */}
                        <div className="mt-6 text-center">
                            <span className="text-gray-800 text-xl font-semibold tracking-wider">
                                {Math.round(currentProgress)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;