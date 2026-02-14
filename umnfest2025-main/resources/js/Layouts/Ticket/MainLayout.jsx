import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import ChatbotWidget from '../../Components/Chatbot/ChatbotWidget';

export default function MainLayout({ children }) {
    const [snapIsReady, setSnapIsReady] = useState(false);

    useEffect(() => {
        // Get client key from meta tag (set by Laravel in app.blade.php)
        const clientKey = document.querySelector('meta[name="midtrans-client-key"]')?.getAttribute('content');
        
        if (!clientKey) {
            console.error('Midtrans client key not found in meta tags');
            return;
        }
        
        // Load Midtrans Snap script
        const snapScript = document.createElement('script');
        // Determine Snap script URL (sandbox for localhost/127.0.0.1)
        let snapUrl = document.querySelector('meta[name="midtrans-snap-url"]')?.getAttribute('content');
        if (!snapUrl) {
            const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
            const host = isLocal ? 'https://app.sandbox.midtrans.com' : 'https://app.midtrans.com';
            snapUrl = `${host}/snap/snap.js`;
        }
        snapScript.src = snapUrl;
        snapScript.setAttribute('data-client-key', clientKey);
        snapScript.async = true;
        
        // Add onload handler to ensure script is loaded
        snapScript.onload = () => {
            console.log('Midtrans Snap script loaded successfully');
            setSnapIsReady(true);
            
            // Override Midtrans redirect behavior after script loads
            if (window.snap) {
                console.log('🔒 Applying Midtrans redirect overrides');
                
                // Store original methods if they exist
                const originalPay = window.snap.pay;
                
                // Override the pay method to ensure our callbacks are always used
                window.snap.pay = function(token, options = {}) {
                    console.log('🔄 Midtrans pay method called with overrides');
                    
                    // Only use supported Midtrans Snap options
                    const enhancedOptions = {
                        ...options,
                        // Only include supported options
                        skipOrderSummary: options.skipOrderSummary || true,
                        onSuccess: options.onSuccess,
                        onPending: options.onPending,
                        onError: options.onError,
                        onClose: options.onClose,
                    };
                    
                    return originalPay.call(this, token, enhancedOptions);
                };
            }
        };
        
        snapScript.onerror = (error) => {
            console.error('Failed to load Midtrans Snap script:', error);
        };
        
        document.head.appendChild(snapScript);

        // Global redirect protection
        const originalWindowOpen = window.open;
        window.open = function(url, ...args) {
            console.log('🚫 Intercepted window.open attempt to:', url);
            // Only allow opens to our own domain
            if (url && url.includes(window.location.origin)) {
                return originalWindowOpen.call(this, url, ...args);
            } else {
                console.log('🚫 Blocked external window.open to:', url);
                return null;
            }
        };

        return () => {
            // Cleanup script on unmount
            if (document.head.contains(snapScript)) {
                document.head.removeChild(snapScript);
            }
            // Restore original window.open
            window.open = originalWindowOpen;
        };
    }, []);

    // Make snap status available to child components
    useEffect(() => {
        window.snapIsReady = snapIsReady;
    }, [snapIsReady]);

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Content */}
            <main className="relative z-10 flex-1 font-museum overflow-x-hidden">
                {children}
            </main>

            {/* Footer */}
            <Footer />
            
            {/* Chatbot Widget - appears on all pages */}
            <ChatbotWidget />
        </div>
    );
}