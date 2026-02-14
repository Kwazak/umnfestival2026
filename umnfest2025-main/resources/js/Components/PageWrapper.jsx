import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import Tree from '../../images/Tree.svg';
import LogoUfest2 from '../../images/LogoUfest2.svg';
import LoadingText from '../../images/LoadingText.svg';

const PageWrapper = ({ children, pageTitle = '' }) => {
    const [isLoading, setIsLoading] = useState(false); // Default to false
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Check if this is the initial page load
        const hasShownPreloader = sessionStorage.getItem('preloader-shown');
        const isInitialLoad = !hasShownPreloader;

        // Only show React loading screen on initial load AND if HTML preloader hasn't been shown
        if (isInitialLoad) {
            setIsLoading(true);
            
            // Simulate loading progress
            const loadingInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(loadingInterval);
                        return 100;
                    }
                    // Random increment between 5-15 for more realistic loading
                    return prev + Math.random() * 10 + 5;
                });
            }, 100);

            // Minimum loading time of 2 seconds
            const minLoadingTime = setTimeout(() => {
                setProgress(100);
            }, 2000);

            return () => {
                clearInterval(loadingInterval);
                clearTimeout(minLoadingTime);
            };
        } else {
            // For SPA navigation, no loading screen
            setIsLoading(false);
        }
    }, []);

    const handleLoadingComplete = () => {
        // Mark that preloader has been shown
        sessionStorage.setItem('preloader-shown', 'true');
        
        // Add a small delay for smooth transition
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // Only show React loading screen if it's the initial load and HTML preloader failed
    if (isLoading) {
        return (
            <LoadingScreen
                image1Url={LogoUfest2}
                image2Url={LoadingText}
                bottomImageUrl={Tree}
                progress={progress}
                onLoadingComplete={handleLoadingComplete}
            />
        );
    }

    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
};

export default PageWrapper;