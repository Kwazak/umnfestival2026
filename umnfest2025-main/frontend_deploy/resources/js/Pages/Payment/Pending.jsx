import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import BackgroundSection from '../../Layouts/BackgroundSection';
import { Link } from '@inertiajs/react';

const Pending = () => {
    const [statusMessage, setStatusMessage] = useState('Checking your payment status...');
    const [isChecking, setIsChecking] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [orderNumber, setOrderNumber] = useState(null);
    const [checkCount, setCheckCount] = useState(0);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [lastStatusCheck, setLastStatusCheck] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); // Track current payment status
    const [hasAutoResumed, setHasAutoResumed] = useState(false);
    const [pollCount, setPollCount] = useState(0);
    const maxPolls = 300; // e.g., 5 minutes at 1s intervals
    
    // Use refs to prevent race conditions
    const isCheckingRef = useRef(false);
    const hasRedirectedRef = useRef(false);
    const checkIntervalRef = useRef(null);
    const aggressiveIntervalRef = useRef(null);

    // Load Midtrans Snap script on component mount
    useEffect(() => {
        const clientKey = document.querySelector('meta[name="midtrans-client-key"]')?.getAttribute('content');
        
        if (!clientKey) {
            console.error('Midtrans client key not found in meta tags');
            return;
        }
        
        if (window.snap) {
            console.log('Midtrans Snap already loaded');
            return;
        }
        
        const snapScript = document.createElement('script');
        snapScript.src = 'https://app.midtrans.com/snap/snap.js';
        snapScript.setAttribute('data-client-key', clientKey);
        snapScript.async = true;
        
        snapScript.onload = () => {
            console.log('Midtrans Snap script loaded successfully');
        };
        
        snapScript.onerror = (error) => {
            console.error('Failed to load Midtrans Snap script:', error);
        };
        
        document.head.appendChild(snapScript);

        return () => {
            if (document.head.contains(snapScript)) {
                document.head.removeChild(snapScript);
            }
        };
    }, []);

    // OPTIMIZED: Initialize order data and start checking with fast paths
    useEffect(() => {
        const storedOrder = localStorage.getItem('pending_order');
        const recentSuccessfulOrder = localStorage.getItem('recent_successful_order');
        const urlParams = new URLSearchParams(window.location.search);
        const orderFromUrl = urlParams.get('order_id') || urlParams.get('order_number');

        // FAST PATH 1: Check if we have a recent successful order that should redirect to success
        if (recentSuccessfulOrder && !orderFromUrl && !storedOrder) {
            try {
                const successData = JSON.parse(recentSuccessfulOrder);
                console.log('🚀 FAST REDIRECT: Recent successful order found, redirecting to success page');
                window.location.href = '/payment/success';
                return;
            } catch (e) {
                localStorage.removeItem('recent_successful_order');
            }
        }

        if (orderFromUrl) {
            setOrderNumber(orderFromUrl);
            setStatusMessage("Checking payment status...");
            setIsChecking(true);
            console.log('🔍 CRITICAL CHECK from URL: Checking payment status for order:', orderFromUrl);
            checkPaymentStatusImmediately(orderFromUrl);
        } else if (storedOrder) {
            let orderData = null;
            try {
                orderData = JSON.parse(storedOrder);
            } catch (e) {
                console.error('Failed to parse pending_order from localStorage:', e);
                localStorage.removeItem('pending_order');
                setStatusMessage("Invalid order data.");
                setIsChecking(false);
                return;
            }

            if (orderData && orderData.orderId) {
                console.log('🔍 FAST SETUP: Stored order found, setting up immediately:', orderData.orderId);
                setPendingOrder(orderData);
                setOrderNumber(orderData.orderId);
                setStatusMessage("Monitoring payment status...");
                setIsChecking(false); // Show UI immediately, then start checking
                
                // Start checking after a brief moment to show UI first
                setTimeout(() => {
                    checkPaymentStatusImmediately(orderData.orderId);
                }, 100);
            } else {
                localStorage.removeItem('pending_order');
                setPendingOrder(null);
                setStatusMessage("No pending payment found.");
                setIsChecking(false);
            }
        } else {
            setStatusMessage("");
            setIsChecking(false);
        }
    }, []);

    // ULTRA AGGRESSIVE STATUS CHECKING - Check every 1 second for the first 3 minutes
    useEffect(() => {
        if (!orderNumber || hasRedirectedRef.current) return;

        let checkAttempts = 0;
        const maxAttempts = 180; // 3 minutes of 1-second checks

        const ultraAggressiveCheck = async () => {
            if (hasRedirectedRef.current || isCheckingRef.current) return;
            
            checkAttempts++;
            setPollCount(prev => prev + 1);
            console.log(`🚨 ULTRA AGGRESSIVE CHECK #${checkAttempts}: Checking order ${orderNumber}`);
            
            try {
                const data = await checkPaymentStatusAPI(orderNumber);
                
                // Handle order not found (deleted from database)
                if (data.status === 404 || (data.success === false && data.message.includes('not found'))) {
                    console.log('🗑️ ORDER NOT FOUND - Likely expired and deleted from database');
                    clearInterval(aggressiveIntervalRef.current);
                    handleOrderNotFound();
                    return;
                }
                
                if (data.success) {
                    const orderStatus = data.data.status;
                    const isSuccessful = data.data.is_successful;
                    const isFailed = data.data.is_failed;
                    
                    console.log(`🚨 ULTRA AGGRESSIVE CHECK #${checkAttempts} RESULT:`, {
                        status: orderStatus,
                        isSuccessful,
                        isFailed,
                        paidAt: data.data.paid_at
                    });
                    
                    if (isSuccessful) {
                        console.log('🎉 ULTRA AGGRESSIVE CHECK FOUND PAYMENT SUCCESS!');
                        clearInterval(aggressiveIntervalRef.current);
                        handleSuccessfulPayment(data, orderNumber);
                        return;
                    } else if (isFailed) {
                        console.log('❌ ULTRA AGGRESSIVE CHECK FOUND PAYMENT FAILURE!');
                        clearInterval(aggressiveIntervalRef.current);
                        handleFailedPayment(orderStatus);
                        return;
                    }
                }
            } catch (error) {
                console.error(`🚨 ULTRA AGGRESSIVE CHECK #${checkAttempts} ERROR:`, error);
            }

            // Remove the aggressive max polls check that causes premature expiration
            // The backend should be the source of truth for expiration status
            // if (pollCount >= maxPolls) {
            //     console.log('⏰ Max poll attempts reached, treating as expired');
            //     clearInterval(aggressiveIntervalRef.current);
            //     handleFailedPayment('expire');
            //     return;
            // }

            // Stop ultra aggressive checking after max attempts
            if (checkAttempts >= maxAttempts) {
                console.log('⏰ Stopping ultra aggressive checks, switching to normal interval');
                clearInterval(aggressiveIntervalRef.current);
                startNormalChecking();
            }
        };

        // Start ultra aggressive checking immediately
        ultraAggressiveCheck();
        aggressiveIntervalRef.current = setInterval(ultraAggressiveCheck, 1000); // Check every 1 second

        return () => {
            if (aggressiveIntervalRef.current) {
                clearInterval(aggressiveIntervalRef.current);
            }
        };
    }, [orderNumber, pollCount]);

    // Normal checking after aggressive phase
    const startNormalChecking = () => {
        if (hasRedirectedRef.current) return;
        
        const normalCheck = async () => {
            if (hasRedirectedRef.current || isCheckingRef.current) return;
            
            setPollCount(prev => prev + 1);
            
            try {
                const data = await checkPaymentStatusAPI(orderNumber);
                
                // Handle order not found (deleted from database)
                if (data.status === 404 || (data.success === false && data.message.includes('not found'))) {
                    console.log('🗑️ ORDER NOT FOUND - Likely expired and deleted from database');
                    clearInterval(checkIntervalRef.current);
                    handleOrderNotFound();
                    return;
                }
                
                if (data.success) {
                    const isSuccessful = data.data.is_successful;
                    const isFailed = data.data.is_failed;
                    
                    if (isSuccessful) {
                        clearInterval(checkIntervalRef.current);
                        handleSuccessfulPayment(data, orderNumber);
                        return;
                    } else if (isFailed) {
                        clearInterval(checkIntervalRef.current);
                        handleFailedPayment(data.data.status);
                        return;
                    }
                }
            } catch (error) {
                console.error('Normal check error:', error);
            }
            
            // Remove max polls check - let backend determine expiration
            // if (pollCount >= maxPolls) {
            //     console.log('⏰ Max poll attempts reached, treating as expired');
            //     clearInterval(checkIntervalRef.current);
            //     handleFailedPayment('expire');
            //     return;
            // }
        };

        checkIntervalRef.current = setInterval(normalCheck, 5000); // Check every 5 seconds
    };

    // Handle page visibility and focus changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (pendingOrder && !hasRedirectedRef.current && paymentStatus !== 'expire' && paymentStatus !== 'deleted') {
                e.preventDefault();
                e.returnValue = 'You have a pending payment. Your order might be cancelled if you leave.';
                return e.returnValue;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && orderNumber && !hasRedirectedRef.current) {
                console.log('🔍 TAB BECAME VISIBLE: Checking payment status immediately');
                checkPaymentStatusImmediately(orderNumber);
            }
        };

        const handleFocus = () => {
            if (orderNumber && !hasRedirectedRef.current) {
                console.log('🔍 WINDOW FOCUSED: Checking payment status immediately');
                checkPaymentStatusImmediately(orderNumber);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [pendingOrder, orderNumber, paymentStatus]);

    // Countdown logic for manual checks
    useEffect(() => {
        if (!orderNumber || isChecking || hasRedirectedRef.current || paymentStatus === 'expire' || paymentStatus === 'deleted') return;

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    checkPaymentStatus();
                    return 5; // Reset countdown to 5 seconds
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [orderNumber, isChecking, paymentStatus]);
    
    const handleSuccessfulPayment = (data, orderNum) => {
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;
        
        console.log('✅ PAYMENT SUCCESSFUL! Redirecting to success page...');
        setStatusMessage('🎉 Payment confirmed! Redirecting to your tickets...');
        
        // Clear all intervals
        if (aggressiveIntervalRef.current) clearInterval(aggressiveIntervalRef.current);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        
        localStorage.setItem('recent_successful_order', JSON.stringify({
            orderNumber: orderNum,
            status: data.data.status,
            paidAt: data.data.paid_at,
        }));
        
        localStorage.removeItem('pending_order');
        setPendingOrder(null);
        
        // Immediate redirect
        setTimeout(() => {
            window.location.href = '/payment/success';
        }, 500); // Reduced from 1000ms to 500ms for faster redirect
    };

    const handleFailedPayment = (status) => {
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;
        
        console.log('❌ PAYMENT FAILED:', status);
        setPaymentStatus(status);
        
        // Clear all intervals
        if (aggressiveIntervalRef.current) clearInterval(aggressiveIntervalRef.current);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        
        // Set appropriate message based on status
        if (status === 'expire') {
            setStatusMessage('⏰ Payment has expired. Please create a new order to continue.');
        } else if (status === 'cancel') {
            setStatusMessage('❌ Payment was cancelled. Please try again if you want to continue.');
        } else if (status === 'deny') {
            setStatusMessage('❌ Payment was denied. Please try with a different payment method.');
        } else {
            setStatusMessage('❌ Payment failed or was cancelled.');
        }
        
        localStorage.removeItem('pending_order');
        setPendingOrder(null);
        setIsChecking(false);
    };

    const handleOrderNotFound = () => {
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;
        
        console.log('🗑️ ORDER NOT FOUND - Order was deleted (likely expired)');
        setPaymentStatus('deleted');
        
        // Clear all intervals
        if (aggressiveIntervalRef.current) clearInterval(aggressiveIntervalRef.current);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        
        setStatusMessage('⏰ Order has expired and been removed from the system. Please create a new order to continue.');
        localStorage.removeItem('pending_order');
        setPendingOrder(null);
        setIsChecking(false);
    };

    const checkPaymentStatusAPI = async (orderNum) => {
        const response = await fetch(`/api/payment/${orderNum}/status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
        });
        
        // Handle 404 specifically (order not found/deleted)
        if (response.status === 404) {
            return {
                success: false,
                message: 'Order not found',
                status: 404
            };
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    };

    const checkPaymentStatusImmediately = async (orderNum) => {
        if (!orderNum || isCheckingRef.current || hasRedirectedRef.current) return;
        
        isCheckingRef.current = true;
        setIsChecking(true);
        console.log('🚀 IMMEDIATE STATUS CHECK for order:', orderNum);
        setStatusMessage('Checking your payment status...');

        try {
            const data = await checkPaymentStatusAPI(orderNum);
            console.log('📊 Payment status response:', data);
            setLastStatusCheck(new Date().toISOString());

            // Handle order not found (deleted from database)
            if (data.status === 404 || (data.success === false && data.message.includes('not found'))) {
                console.log('🗑️ ORDER NOT FOUND - Likely expired and deleted from database');
                handleOrderNotFound();
                return;
            }

            if (data.success) {
                const orderStatus = data.data.status;
                const isSuccessful = data.data.is_successful;
                const isFailed = data.data.is_failed;
                const isPending = data.data.is_pending;
                
                setPaymentStatus(orderStatus);
                
                // SECURITY: snap_token is no longer exposed by the public status API.
                // If we're pending and we don't have a pending_order yet, try to fetch a new token
                // via the authenticated create endpoint (only if purchase_token is available).
                if (isPending && !hasRedirectedRef.current && !hasAutoResumed && !pendingOrder) {
                    const purchaseToken = localStorage.getItem('purchase_token');
                    if (purchaseToken) {
                        try {
                            console.log('🔐 Requesting new Snap token via authenticated create endpoint');
                            const resp = await fetch(`/api/payment/${orderNum}/create`, {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${purchaseToken}`,
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                                },
                                credentials: 'include',
                            });
                            if (resp.ok) {
                                const json = await resp.json();
                                if (json?.success && json?.data?.snap_token) {
                                    const newPendingOrder = { orderId: orderNum, snapToken: json.data.snap_token };
                                    setPendingOrder(newPendingOrder);
                                    localStorage.setItem('pending_order', JSON.stringify(newPendingOrder));
                                    setHasAutoResumed(true);
                                    console.log('✅ Snap token refreshed and stored');
                                    // Do not auto-open payment; keep for manual resume by user
                                    return;
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to refresh snap token:', e);
                        }
                    }
                }
                
                if (isSuccessful) {
                handleSuccessfulPayment(data, orderNum);
                return;
                } else if (isFailed) {
                handleFailedPayment(orderStatus);
                return;
                } else if (isPending) {
                console.log('⏳ PAYMENT STILL PENDING:', orderStatus);
                setStatusMessage(`⏳ Payment still being processed (${data.data.status_description || orderStatus}). We'll keep checking...`);
                setCheckCount(prev => prev + 1);
                } else {
                console.log('🤔 UNKNOWN STATUS:', orderStatus);
                setStatusMessage(`Status: ${data.data.status_description || orderStatus}. Continuing to monitor...`);
                setCheckCount(prev => prev + 1);
                }
            } else {
                console.log('⚠️ API ERROR:', data.message);
                setStatusMessage('Could not retrieve status. We will keep trying.');
                setCheckCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('🚨 Error checking payment status:', error);
            setStatusMessage('Connection issue. Retrying...');
            setCheckCount(prev => prev + 1);
        } finally {
            isCheckingRef.current = false;
            setIsChecking(false);
            setPollCount(prev => prev + 1);
            // Remove max polls check - let backend determine expiration
            // if (pollCount >= maxPolls) {
            //     console.log('⏰ Max poll attempts reached in immediate check, treating as expired');
            //     handleFailedPayment('expire');
            // }
        }
    };

    const checkPaymentStatus = async () => {
        if (!orderNumber || isCheckingRef.current || hasRedirectedRef.current) return;

        console.log(`🔄 AUTO CHECK #${checkCount + 1} for order:`, orderNumber);
        await checkPaymentStatusImmediately(orderNumber);
    };

    const handleCancelOrder = async (auto = false) => {
        console.log('🚨 handleCancelOrder called with auto =', auto);
        if (!pendingOrder) return;
        
        // Show confirmation dialog before cancelling (only for manual cancellation)
        if (!auto) {
            console.log('Showing confirmation dialog for manual cancellation');
            const confirmed = confirm('Are you sure you want to cancel this order? This action cannot be undone and you will need to create a new order to purchase tickets.');
            console.log('User confirmation result:', confirmed);
            if (!confirmed) {
                console.log('User cancelled the cancellation');
                return;
            }
            console.log('User confirmed cancellation, proceeding...');
        }
        
        try {
            const purchaseToken = localStorage.getItem('purchase_token');
            const response = await fetch(`/api/orders/${pendingOrder.orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // temp.auth requires bearer token used during purchase flow
                    ...(purchaseToken ? { 'Authorization': `Bearer ${purchaseToken}` } : {}),
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                credentials: 'include',
            });
            
            if (response.ok) {
                // Set cancelled state instead of showing alert
                setPaymentStatus('cancelled');
                localStorage.removeItem('pending_order');
                setPendingOrder(null);
                setOrderNumber(null);
                setStatusMessage(auto ? "Payment session expired. Please create a new order." : "Your order has been successfully cancelled.");
                setIsChecking(false);
                hasRedirectedRef.current = true;
                
                // Clear all intervals
                if (aggressiveIntervalRef.current) clearInterval(aggressiveIntervalRef.current);
                if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            } else {
                // Try to read error response for better diagnostics
                let errText = '';
                try { errText = await response.text(); } catch (_) {}
                console.warn('Cancel request failed:', response.status, errText);
                throw new Error('Failed to cancel order');
            }
        } catch (error) {
            console.error("Failed to cancel order:", error);
            alert("Could not cancel the order. Please try again or contact support.");
        }
    };

    const handleManualCheck = () => {
        if (isCheckingRef.current || hasRedirectedRef.current) return;
        
        console.log('👆 MANUAL CHECK triggered by user');
        checkPaymentStatusImmediately(orderNumber);
        setCountdown(5); // Reset countdown
    };

    const loadMidtransScript = () => {
        return new Promise((resolve, reject) => {
            if (window.snap) {
                console.log('Midtrans Snap already loaded');
                resolve();
                return;
            }

            const clientKey = document.querySelector('meta[name="midtrans-client-key"]')?.getAttribute('content');
            
            if (!clientKey) {
                console.error('Midtrans client key not found in meta tags');
                reject(new Error('Midtrans client key not found'));
                return;
            }
            
            const snapScript = document.createElement('script');
            snapScript.src = 'https://app.midtrans.com/snap/snap.js';
            snapScript.setAttribute('data-client-key', clientKey);
            snapScript.async = true;
            
            snapScript.onload = () => {
                console.log('Midtrans Snap script loaded successfully');
                resolve();
            };
            
            snapScript.onerror = (error) => {
                console.error('Failed to load Midtrans Snap script:', error);
                reject(error);
            };
            
            document.head.appendChild(snapScript);
        });
    };

    const handleReopenPayment = async () => {
        if (!pendingOrder?.snapToken) {
            alert('Payment session not available. Please try refreshing the page or contact support.');
            return;
        }

        try {
            console.log('🔄 REOPENING PAYMENT for order:', pendingOrder.orderId);
            
            if (typeof window.snap === 'undefined') {
                console.log('Loading Midtrans script...');
                try {
                    await loadMidtransScript();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    alert('Failed to load payment system. Please refresh the page and try again.');
                    return;
                }
            }

            if (typeof window.snap === 'undefined') {
                alert('Payment system is still not ready. Please refresh the page and try again.');
                return;
            }

            window.snap.pay(pendingOrder.snapToken, {
                skipOrderSummary: true, // This removes the "Back to Merchant" button and auto-closes on success
                onSuccess: function(result) {
                    console.log('✅ PAYMENT SUCCESS from snap:', result);
                    // Immediately check payment status after success
                    setTimeout(() => {
                        checkPaymentStatusImmediately(orderNumber);
                    }, 1000);
                },
                onPending: function(result) {
                    console.log('⏳ PAYMENT PENDING from snap:', result);
                    // Continue checking status
                    setTimeout(() => {
                        checkPaymentStatusImmediately(orderNumber);
                    }, 1000);
                },
                onError: function(result) {
                    console.log('❌ PAYMENT ERROR from snap:', result);
                    alert('Payment failed. Please try again or contact support.');
                },
                onClose: function() {
                    console.log('🔒 PAYMENT POPUP CLOSED by user');
                    // Check status when user closes popup
                    setTimeout(() => {
                        checkPaymentStatusImmediately(orderNumber);
                    }, 2000);
                }
            });
        } catch (error) {
            console.error('🚨 Error reopening payment:', error);
            alert('Failed to open payment. Please refresh the page and try again.');
        }
    };

    const handleStartNewOrder = () => {
        // Clear all data and redirect to ticket page
        localStorage.removeItem('pending_order');
        localStorage.removeItem('recent_successful_order');
        window.location.href = '/ticket';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (aggressiveIntervalRef.current) clearInterval(aggressiveIntervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, []);

    // Determine UI state based on payment status
    const isExpired = paymentStatus === 'expire';
    const isFailed = paymentStatus && ['cancel', 'deny', 'failure'].includes(paymentStatus);
    const isDeleted = paymentStatus === 'deleted'; // Order not found in database
    const isCancelled = paymentStatus === 'cancelled'; // Order manually cancelled
    const showActiveButtons = !isExpired && !isFailed && !isDeleted && !isCancelled && !hasRedirectedRef.current;

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#281F65] flex items-center justify-center p-4 pt-45 pb-20">
                <div className="w-full max-w-2xl bg-[#FFFFFF]/15 backdrop-blur-2xl border border-[#42B5B5]/30 rounded-3xl shadow-2xl shadow-[#0E4280]/30 p-8 md:p-12" style={{ fontFamily: 'LT Museum' }}>
                    <div className="text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                            isExpired || isFailed || isDeleted || isCancelled ? 'bg-[#A42128]/20' : 'bg-[#F3C019]/20'
                        }`}>
                            {isExpired || isDeleted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#A42128]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : isFailed || isCancelled ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#A42128]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : isChecking ? (
                               <svg className="animate-spin h-12 w-12 text-[#F3C019]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#F3C019]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight ${
                            isExpired || isFailed || isDeleted || isCancelled ? 'text-[#fff]' : 'text-[#FFFFFF]'
                        }`}>
                            {isExpired ? 'Payment Expired' : 
                             isFailed ? 'Payment Failed' :
                             isDeleted ? 'Order Expired' :
                             isCancelled ? 'Order Cancelled' :
                             orderNumber ? 'Payment Pending' : 'No Pending Payment'}
                        </h1>
                        <p className="text-lg text-[#FFFFFF]/90 mb-8">
                            {statusMessage}
                        </p>
                        
                        {orderNumber && (
                             <div className={`border rounded-2xl p-6 mb-6 backdrop-blur-sm ${
                                 isExpired || isFailed || isDeleted || isCancelled ? 'bg-[#A42128]/20 border-[#A42128]/40' : 'bg-[#42B5B5]/20 border-[#42B5B5]/40'
                             }`}>
                                 <p className="text-base font-semibold text-[#FFFFFF]">
                                     <strong className="text-[#fff]">Order Number:</strong> {orderNumber}
                                 </p>
                                 {checkCount > 0 && !isExpired && !isFailed && !isDeleted && !isCancelled && (
                                     <p className="text-[#FFFFFF]/80 text-sm mt-2">
                                         Status checks performed: {checkCount}
                                     </p>
                                 )}
                                 {lastStatusCheck && !isExpired && !isFailed && !isDeleted && !isCancelled && (
                                     <p className="text-[#FFFFFF]/70 text-sm mt-1">
                                         Last checked: {new Date(lastStatusCheck).toLocaleTimeString()}
                                     </p>
                                 )}
                                 {(isExpired || isFailed || isDeleted || isCancelled) && (
                                     <p className="text-[#FFFFFF]/80 text-sm mt-2">
                                         Status: {paymentStatus === 'expire' ? 'Expired' : 
                                                 paymentStatus === 'cancel' ? 'Cancelled' :
                                                 paymentStatus === 'deny' ? 'Denied' : 
                                                 paymentStatus === 'deleted' ? 'Removed from system' : 
                                                 paymentStatus === 'cancelled' ? 'Cancelled by user' : 'Failed'}
                                     </p>
                                 )}
                             </div>
                        )}

                        {/* Show countdown only for active pending payments */}
                        {orderNumber && showActiveButtons && (
                            <div className="bg-[#F3C019]/20 backdrop-blur-sm border border-[#F3C019]/40 rounded-2xl p-6 mb-6">
                               <div className="flex items-center justify-center mb-4">
                                    <div className="flex space-x-1">
                                        <div className={`w-3 h-3 rounded-full ${isChecking ? 'bg-[#F3C019] animate-pulse' : 'bg-[#F3C019]/60'}`}></div>
                                        <div className={`w-3 h-3 rounded-full ${isChecking ? 'bg-[#F3C019] animate-pulse delay-75' : 'bg-[#F3C019]/60'}`}></div>
                                        <div className={`w-3 h-3 rounded-full ${isChecking ? 'bg-[#F3C019] animate-pulse delay-150' : 'bg-[#F3C019]/60'}`}></div>
                                    </div>
                                </div>

                                {!isChecking ? (
                                    <div className="text-center">
                                        <p className="text-[#F3C019] text-base font-semibold">
                                            ⏱️ Next automatic check in {countdown} seconds...
                                        </p>
                                        <div className="w-full bg-[#F3C019]/30 rounded-full h-2 mt-3">
                                            <div 
                                                className="bg-[#F3C019] h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${(5 - countdown) / 5 * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#F3C019] text-base font-semibold text-center">
                                        🔍 Checking payment status...
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Show cancelled message */}
                        {isCancelled && (
                            <div className="bg-[#A42128]/20 backdrop-blur-sm border border-[#A42128]/40 rounded-2xl p-6 mb-6">
                                <div className="text-center">
                                    <p className="text-[#FFFFFF] text-base font-semibold mb-2">
                                        ❌ Order Successfully Cancelled
                                    </p>
                                    <p className="text-[#FFFFFF]/80 text-sm">
                                        Your order has been cancelled and removed from the system. You can create a new order anytime to purchase tickets.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Show expired/failed/deleted message */}
                        {(isExpired || isFailed || isDeleted) && (
                            <div className="bg-[#A42128]/20 backdrop-blur-sm border border-[#A42128]/40 rounded-2xl p-6 mb-6">
                                <div className="text-center">
                                    <p className="text-[#FFFFFF] text-base font-semibold mb-2">
                                        {isExpired ? '⏰ Payment time has expired' : 
                                         isDeleted ? '🗑️ Order has been removed from the system' :
                                         '❌ Payment could not be processed'}
                                    </p>
                                    <p className="text-[#FFFFFF]/80 text-sm">
                                        {isExpired || isDeleted ? 
                                            'Please create a new order to continue purchasing tickets.' :
                                            'Please try again with a different payment method.'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* --- Action Buttons --- */}
                        <div className="space-y-4">
                           <div className='flex flex-wrap gap-3 justify-center'>
                                {/* Show re-open payment only for active pending orders */}
                                {pendingOrder?.snapToken && showActiveButtons && (
                                    <button
                                        onClick={handleReopenPayment}
                                        className="bg-gradient-to-r from-[#42B5B5] to-[#0E4280] text-[#FFFFFF] py-3 px-6 rounded-2xl font-bold hover:from-[#42B5B5]/80 hover:to-[#0E4280]/80 transition duration-300 flex-grow shadow-lg"
                                    >
                                        Re-open Payment
                                    </button>
                                )}
                                
                                {/* Show check status only for active pending orders */}
                                {orderNumber && showActiveButtons && (
                                    <button
                                        onClick={handleManualCheck}
                                        disabled={isChecking}
                                        className="bg-gradient-to-r from-[#F3C019] to-[#E34921] text-[#FFFFFF] py-3 px-6 rounded-2xl font-bold hover:from-[#F3C019]/90 hover:to-[#E34921]/90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex-grow shadow-lg"
                                    >
                                        {isChecking ? 'Checking...' : 'Check Status Now'}
                                    </button>
                                )}
                                
                                {/* Show cancel only for active pending orders */}
                                {pendingOrder && showActiveButtons && (
                                    <button
                                        onClick={() => handleCancelOrder(false)}
                                        className="bg-[#D9D9D9] text-[#545454] py-3 px-6 rounded-2xl font-bold hover:bg-[#D9D9D9]/80 transition duration-300 flex-grow shadow-lg"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {/* Show "Order New Tickets" for expired/failed/deleted/cancelled payments */}
                                {(isExpired || isFailed || isDeleted || isCancelled) && (
                                    <button
                                        onClick={handleStartNewOrder}
                                        className="cursor-pointer bg-gradient-to-r from-[#F3C019] to-[#E34921] text-[#FFFFFF] py-4 px-8 rounded-2xl font-bold hover:from-[#F3C019]/90 hover:to-[#E34921]/90 transition duration-300 flex-grow shadow-lg"
                                    >
                                        🎫 Order New Tickets
                                    </button>
                                )}
                           </div>
                           
                            {/* Hide "Order Tickets" button when there's an active order or cancelled order */}
                            {!isExpired && !isFailed && !isDeleted && !isCancelled && !isChecking && !orderNumber && (
                                <Link 
                                    href="/ticket" 
                                    className="inline-block bg-gradient-to-r from-[#F3C019] to-[#E34921] text-[#FFFFFF] py-3 px-6 mt-4 rounded-2xl font-bold hover:from-[#F3C019]/90 hover:to-[#E34921]/90 transition duration-300 shadow-lg"
                                >
                                    Order Tickets
                                </Link>
                            )}
                        </div>
                        
                        <p className="text-[#FFFFFF]/80 text-sm mt-8">
                            Having issues? Contact our support team via WhatsApp at +62 813-1598-3958 (Chealsea)
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Pending;