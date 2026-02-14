/**
 * Enhanced Midtrans Override Script
 * This script prevents all "return to merchant" redirects with proper cross-origin handling
 * Fixes SecurityError: Failed to read a named property 'document' from 'Window'
 */

(function() {
    'use strict';
    
    console.log('🔧 Enhanced Midtrans Override Script Loaded (Cross-Origin Safe)');
    
    // Function to override redirect mechanisms using event interception
    function overrideRedirects() {
        console.log('🔧 Setting up redirect interception');
        
        // 1. Override window.open
        const originalWindowOpen = window.open;
        try {
            window.open = function(url, name, features) {
                console.log('🔍 Intercepting window.open to:', url);
                if (shouldBlockRedirect(url)) {
                    console.log('🔄 Blocked popup, refreshing page instead');
                    window.location.reload();
                    return null;
                }
                return originalWindowOpen.call(this, url, name, features);
            };
        } catch (e) {
            console.warn('Could not override window.open:', e);
        }
        
        // 2. Override history methods
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        try {
            history.pushState = function(state, title, url) {
                if (url && shouldBlockRedirect(url)) {
                    console.log('🔄 Blocked history.pushState, refreshing instead');
                    window.location.reload();
                    return;
                }
                return originalPushState.call(this, state, title, url);
            };
            
            history.replaceState = function(state, title, url) {
                if (url && shouldBlockRedirect(url)) {
                    console.log('🔄 Blocked history.replaceState, refreshing instead');
                    window.location.reload();
                    return;
                }
                return originalReplaceState.call(this, state, title, url);
            };
        } catch (e) {
            console.warn('Could not override history methods:', e);
        }
        
        // 3. Override location setters (safer approach)
        try {
            let currentLocation = window.location.href;
            
            // Monitor location changes
            setInterval(() => {
                if (window.location.href !== currentLocation) {
                    console.log('🔍 Location changed from', currentLocation, 'to', window.location.href);
                    if (shouldBlockRedirect(window.location.href)) {
                        console.log('🔄 Detected blocked redirect, refreshing instead');
                        window.location.reload();
                        return;
                    }
                    currentLocation = window.location.href;
                }
            }, 100);
        } catch (e) {
            console.warn('Could not set up location monitoring:', e);
        }
        
        // 4. Override common redirect functions
        const redirectFunctions = [
            'redirectToMerchant',
            'returnToMerchant', 
            'backToMerchant',
            'goToMerchant',
            'redirect',
            'goBack',
            'finishPayment',
            'unfinishPayment'
        ];
        
        redirectFunctions.forEach(funcName => {
            if (window[funcName]) {
                const originalFunc = window[funcName];
                window[funcName] = function(...args) {
                    console.log(`🔍 Intercepting ${funcName} call with args:`, args);
                    console.log('���� Blocked redirect function, refreshing page instead');
                    window.location.reload();
                };
            }
        });
        
        // 5. Set up periodic check for new redirect functions
        setInterval(() => {
            redirectFunctions.forEach(funcName => {
                if (window[funcName] && !window[funcName]._overridden) {
                    console.log(`🔧 Found new ${funcName} function, overriding it`);
                    const originalFunc = window[funcName];
                    window[funcName] = function(...args) {
                        console.log(`🔍 Intercepting ${funcName} call with args:`, args);
                        console.log('🔄 Blocked redirect function, refreshing page instead');
                        window.location.reload();
                    };
                    window[funcName]._overridden = true;
                }
            });
        }, 1000);
    }
    
    // Function to determine if a redirect should be blocked
    function shouldBlockRedirect(url) {
        if (!url || typeof url !== 'string') return false;
        
        const urlLower = url.toLowerCase();
        
        // Allow internal admin routes and login pages
        if (urlLower.includes('/admin') || urlLower.includes('/login')) {
            return false;
        }
        
        // Only block specific Midtrans merchant return patterns
        const blockPatterns = [
            'back_to_merchant',
            'return_to_merchant',
            'finish_redirect',
            'unfinish_redirect',
            'merchant_redirect',
            'payment_finish',
            'payment_unfinish'
        ];
        
        // Block if URL contains specific merchant return patterns
        for (const pattern of blockPatterns) {
            if (urlLower.includes(pattern)) {
                return true;
            }
        }
        
        // Block external redirects to different domains (but allow same domain)
        try {
            const urlObj = new URL(url, window.location.origin);
            if (urlObj.hostname !== window.location.hostname) {
                // Only block if it's a Midtrans redirect pattern
                const midtransPatterns = ['merchant', 'return', 'finish', 'unfinish'];
                for (const pattern of midtransPatterns) {
                    if (urlLower.includes(pattern)) {
                        return true;
                    }
                }
            }
        } catch (e) {
            // If URL parsing fails, it might be a relative URL, allow it
            return false;
        }
        
        return false;
    }
    
    // Function to override buttons and links
    function overrideButtons() {
        const selectors = [
            'button[onclick*="back_to_merchant"]',
            'button[onclick*="return_to_merchant"]',
            'button[onclick*="merchant_redirect"]',
            'a[href*="back_to_merchant"]',
            'a[href*="return_to_merchant"]',
            'a[href*="merchant_redirect"]',
            '.btn-return-merchant',
            '.return-merchant',
            '.back-merchant',
            '[data-action="return_to_merchant"]',
            '[data-action="back_to_merchant"]'
        ];
        
        // Text patterns to look for (more specific to avoid admin interference)
        const textPatterns = [
            'return to merchant',
            'back to merchant',
            'kembali ke merchant',
            'kembali ke toko',
            'finish payment',
            'complete payment'
        ];
        
        // Process selector-based elements
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!element.hasAttribute('data-override-applied')) {
                        overrideElement(element);
                    }
                });
            } catch (e) {
                console.warn('Error processing selector:', selector, e);
            }
        });
        
        // Process text-based elements
        const allButtons = document.querySelectorAll('button, a, [onclick], [href]');
        allButtons.forEach(element => {
            if (element.hasAttribute('data-override-applied')) return;
            
            const text = (element.textContent || element.innerText || '').toLowerCase();
            const href = element.getAttribute('href') || '';
            const onclick = element.getAttribute('onclick') || '';
            
            // Check text content
            for (const pattern of textPatterns) {
                if (text.includes(pattern) || href.includes(pattern) || onclick.includes(pattern)) {
                    overrideElement(element);
                    break;
                }
            }
            
            // Check if href should be blocked
            if (href && shouldBlockRedirect(href)) {
                overrideElement(element);
            }
        });
    }
    
    // Function to override a specific element
    function overrideElement(element) {
        console.log('🔧 Overriding element:', element);
        
        element.setAttribute('data-override-applied', 'true');
        
        // Remove existing event listeners by cloning
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Add new click handler
        newElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('🔄 Blocked element click - refreshing page instead');
            window.location.reload();
            
            return false;
        }, true);
        
        // Override attributes
        if (newElement.tagName === 'A') {
            newElement.href = 'javascript:void(0)';
        }
        newElement.removeAttribute('onclick');
        
        // Override any data attributes that might trigger redirects
        ['data-href', 'data-url', 'data-redirect'].forEach(attr => {
            if (newElement.hasAttribute(attr)) {
                newElement.removeAttribute(attr);
            }
        });
    }
    
    // Function to handle cross-origin iframe communication safely
    function setupCrossOriginIframeHandling() {
        console.log('🔧 Setting up cross-origin iframe handling');
        
        // Set up message listener for cross-origin communication
        window.addEventListener('message', function(event) {
            // Only listen to messages from Midtrans domains
            const trustedOrigins = [
                'midtrans.com',
                'veritrans.co.id',
                'app.midtrans.com'
            ];
            
            const isTrustedOrigin = trustedOrigins.some(origin => 
                event.origin.includes(origin)
            );
            
            if (isTrustedOrigin) {
                console.log('🔍 Received message from Midtrans iframe:', event.data);
                
                // Check if message indicates a redirect attempt
                if (typeof event.data === 'string') {
                    const data = event.data.toLowerCase();
                    if (data.includes('redirect') || 
                        data.includes('return') || 
                        data.includes('merchant') ||
                        data.includes('finish') ||
                        data.includes('back') ||
                        data.includes('kembali')) {
                        
                        console.log('🔄 Blocked iframe redirect message, refreshing page instead');
                        window.location.reload();
                        return;
                    }
                }
                
                // Handle object messages
                if (typeof event.data === 'object' && event.data !== null) {
                    try {
                        const dataStr = JSON.stringify(event.data).toLowerCase();
                        if (dataStr.includes('redirect') || 
                            dataStr.includes('return') || 
                            dataStr.includes('merchant') ||
                            dataStr.includes('finish') ||
                            dataStr.includes('back') ||
                            dataStr.includes('kembali')) {
                            
                            console.log('🔄 Blocked iframe redirect object, refreshing page instead');
                            window.location.reload();
                            return;
                        }
                    } catch (e) {
                        // Ignore JSON stringify errors
                    }
                }
            }
        });
    }
    
    // Function to monitor iframes without accessing their content
    function monitorIframes() {
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            if (iframe.hasAttribute('data-monitor-applied')) return;
            
            iframe.setAttribute('data-monitor-applied', 'true');
            console.log('🔍 Monitoring iframe:', iframe.src);
            
            // Monitor iframe URL changes (this doesn't require cross-origin access)
            let lastSrc = iframe.src;
            const checkSrcChange = setInterval(() => {
                try {
                    if (iframe.src !== lastSrc) {
                        console.log('🔍 Iframe src changed from', lastSrc, 'to', iframe.src);
                        
                        if (shouldBlockRedirect(iframe.src)) {
                            console.log('🔄 Blocked iframe redirect, refreshing page instead');
                            clearInterval(checkSrcChange);
                            window.location.reload();
                            return;
                        }
                        
                        lastSrc = iframe.src;
                    }
                } catch (e) {
                    // Ignore errors when checking iframe src
                }
            }, 500);
            
            // Clean up interval when iframe is removed
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((node) => {
                        if (node === iframe) {
                            clearInterval(checkSrcChange);
                            observer.disconnect();
                        }
                    });
                });
            });
            
            if (iframe.parentNode) {
                observer.observe(iframe.parentNode, { childList: true });
            }
            
            // Try to access same-origin iframes only
            iframe.addEventListener('load', function() {
                try {
                    const iframeSrc = iframe.src || '';
                    const currentOrigin = window.location.origin;
                    
                    // Only attempt to access if it's same-origin
                    if (!iframeSrc || iframeSrc.startsWith(currentOrigin) || iframeSrc === 'about:blank') {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        
                        if (iframeDoc) {
                            console.log('🔧 Overriding same-origin iframe content');
                            
                            // Inject override script into same-origin iframe
                            const script = iframeDoc.createElement('script');
                            script.textContent = `
                                (function() {
                                    console.log('🔧 Same-origin iframe override script loaded');
                                    
                                    function overrideIframeButtons() {
                                        const elements = document.querySelectorAll('button, a, [onclick]');
                                        elements.forEach(el => {
                                            if (el.hasAttribute('data-iframe-override')) return;
                                            
                                            const text = (el.textContent || '').toLowerCase();
                                            const href = el.getAttribute('href') || '';
                                            const onclick = el.getAttribute('onclick') || '';
                                            
                                            if (text.includes('return') || text.includes('back') || 
                                                text.includes('merchant') || text.includes('kembali') ||
                                                href.includes('merchant') || href.includes('return') ||
                                                onclick.includes('merchant') || onclick.includes('return')) {
                                                
                                                el.setAttribute('data-iframe-override', 'true');
                                                
                                                const newEl = el.cloneNode(true);
                                                el.parentNode.replaceChild(newEl, el);
                                                
                                                newEl.onclick = function(e) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('🔄 Iframe button blocked, refreshing parent');
                                                    window.parent.location.reload();
                                                    return false;
                                                };
                                                
                                                if (newEl.href) newEl.href = 'javascript:void(0)';
                                                newEl.removeAttribute('onclick');
                                            }
                                        });
                                    }
                                    
                                    const redirectFunctions = ['redirectToMerchant', 'returnToMerchant', 'goBack'];
                                    redirectFunctions.forEach(funcName => {
                                        if (window[funcName]) {
                                            window[funcName] = function() {
                                                console.log('🔄 Iframe redirect function blocked, refreshing parent');
                                                window.parent.location.reload();
                                            };
                                        }
                                    });
                                    
                                    overrideIframeButtons();
                                    setInterval(overrideIframeButtons, 1000);
                                })();
                            `;
                            
                            if (iframeDoc.head) {
                                iframeDoc.head.appendChild(script);
                            } else if (iframeDoc.body) {
                                iframeDoc.body.appendChild(script);
                            }
                        }
                    }
                } catch (error) {
                    // This is expected for cross-origin iframes - don't log as error
                    console.log('ℹ️ Cross-origin iframe detected (using message-based approach)');
                }
            });
        });
    }
    
    // Function to override forms that might redirect
    function overrideForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (form.hasAttribute('data-form-override')) return;
            
            const action = form.getAttribute('action') || '';
            if (shouldBlockRedirect(action)) {
                form.setAttribute('data-form-override', 'true');
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('🔄 Blocked form submission, refreshing page instead');
                    window.location.reload();
                    return false;
                });
            }
        });
    }
    
    // Main initialization function
    function init() {
        console.log('🚀 Initializing enhanced Midtrans override (cross-origin safe)');
        
        // Set up all overrides
        overrideRedirects();
        setupCrossOriginIframeHandling();
        overrideButtons();
        monitorIframes();
        overrideForms();
        
        // Set up mutation observer for dynamic content
        const observer = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldCheck = true;
                }
            });
            
            if (shouldCheck) {
                setTimeout(() => {
                    overrideButtons();
                    monitorIframes();
                    overrideForms();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['onclick', 'href', 'action']
        });
        
        // Run periodically as fallback
        setInterval(() => {
            overrideButtons();
            monitorIframes();
            overrideForms();
        }, 2000);
        
        console.log('✅ Enhanced Midtrans override initialized (cross-origin safe)');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also initialize on window load
    window.addEventListener('load', init);
    
    // Override any global redirect functions that might be defined later
    setTimeout(() => {
        const globalRedirectFunctions = [
            'redirectToMerchant',
            'returnToMerchant',
            'backToMerchant',
            'goToMerchant',
            'finishPayment',
            'unfinishPayment'
        ];
        
        globalRedirectFunctions.forEach(funcName => {
            if (window[funcName] && !window[funcName]._overridden) {
                console.log(`🔧 Overriding global function: ${funcName}`);
                const originalFunc = window[funcName];
                window[funcName] = function() {
                    console.log(`🔄 Blocked ${funcName} call`);
                    window.location.reload();
                };
                window[funcName]._overridden = true;
            }
        });
    }, 1000);
    
})();