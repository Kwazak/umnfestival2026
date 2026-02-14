import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/Ticket/MainLayout';
import BackgroundSection from '../Layouts/Ticket/BackgroundSection';
import HeroSection from '../Layouts/Ticket/HeroSection';
import LineUpSection from '../Layouts/Ticket/LineUpSection';
import TicketPricingSection from '../Layouts/Ticket/TicketPricingSection';
import SpinSection from '../Layouts/Ticket/SpinSection';
import SecondaryNavigation from '../Layouts/Ticket/SecondaryNavigation';
import '../../css/ticket-transitions.css';

const Ticket = () => {
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        confirmEmail: '',
        phone: '',
        category: 'internal',
        quantity: 1,
        referralCode: '',
        discountCode: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [referralStatus, setReferralStatus] = useState({
        isValidating: false,
        isValid: false,
        error: '',
        appliedCode: null,
    });

    const [discountStatus, setDiscountStatus] = useState({
        isValidating: false,
        isValid: false,
        error: '',
        appliedCode: null,
        discountPercentage: 0,
        discountAmount: 0,
    });

    const [orderSummary, setOrderSummary] = useState({
        basePrice: 0,
        subtotal: 0,
        discountAmount: 0,
        bundleDiscountAmount: 0,
        finalPrice: 0,
    });

    const [bundleEnabled, setBundleEnabled] = useState(false);

    const [currentTicketPrice, setCurrentTicketPrice] = useState({
        price: 0,
        ticket_type: null,
        header: '',
        loading: true,
        error: null
    });

    // Fetch current ticket price
    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                const response = await fetch('/api/orders/current-price');
                const data = await response.json();
                
                if (data.success && data.data) {
                    setCurrentTicketPrice({
                        price: data.data.price,
                        ticket_type: data.data.ticket_type,
                        header: data.data.header,
                        loading: false,
                        error: null
                    });
                } else {
                    setCurrentTicketPrice(prev => ({
                        ...prev,
                        loading: false,
                        error: data.message || 'No tickets available'
                    }));
                }
            } catch (error) {
                console.error('Error fetching current price:', error);
                setCurrentTicketPrice(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to fetch ticket price'
                }));
            }
        };

        fetchCurrentPrice();
    }, []);

    // Update order summary when quantity or price changes
    useEffect(() => {
        if (currentTicketPrice.price > 0) {
            const basePrice = currentTicketPrice.price * 1;
            const subtotal = basePrice * formData.quantity;

            // compute bundle discount if enabled
            let bundleDiscount = 0;
            if (bundleEnabled) {
                const q = parseInt(formData.quantity, 10);
                if (q === 2) bundleDiscount = 4000;
                else if (q === 3) bundleDiscount = 6000;
                else if (q === 4) bundleDiscount = 8000;
                else if (q === 5) bundleDiscount = 10000;
            }

            setOrderSummary(prev => ({
                ...prev,
                basePrice,
                subtotal,
                bundleDiscountAmount: bundleDiscount,
                finalPrice: subtotal - prev.discountAmount - bundleDiscount,
            }));
        }
    }, [formData.quantity, currentTicketPrice.price, bundleEnabled]);

    // Fetch public bundle feature flag
    useEffect(() => {
        const fetchBundleFlag = async () => {
            try {
                const res = await fetch('/api/settings/bundle-ticket');
                if (!res.ok) return;
                const j = await res.json();
                if (j.success && j.data) setBundleEnabled(!!j.data.enabled);
            } catch (e) {
                // ignore
            }
        };
        fetchBundleFlag();
    }, []);

    useEffect(() => {
        const storedOrder = localStorage.getItem('pending_order');
        if (storedOrder) {
            // If there's a pending order, redirect to pending page
            window.location.href = '/payment/pending';
        }
    }, []);

    // Auto-fill and auto-apply referral code from URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        if (refCode && refCode.trim()) {
            console.log('Referral code detected from URL:', refCode);
            
            // LANGSUNG TAMPILKAN FORM
            setShowOrderForm(true);
            setSelectedTicketType('presale'); // Default ticket type
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'auto' });
            
            // Set the referral code in form data
            setFormData(prev => ({
                ...prev,
                referralCode: refCode.trim()
            }));
            
            // Auto-validate the referral code
            const autoValidateReferral = async () => {
                setReferralStatus({ isValidating: true, isValid: false, error: '', appliedCode: null });

                try {
                    const response = await fetch('/api/referral-codes/validate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        },
                        body: JSON.stringify({ code: refCode.trim() }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        setReferralStatus({
                            isValidating: false,
                            isValid: true,
                            error: '',
                            appliedCode: data.data.referral_code,
                        });
                        console.log('Referral code auto-applied successfully:', data.data.referral_code.panitia_name);
                    } else {
                        setReferralStatus({
                            isValidating: false,
                            isValid: false,
                            error: data.message || 'Invalid referral code',
                            appliedCode: null,
                        });
                        console.error('Referral code validation failed:', data.message);
                    }
                } catch (error) {
                    setReferralStatus({
                        isValidating: false,
                        isValid: false,
                        error: 'Failed to validate referral code',
                        appliedCode: null,
                    });
                    console.error('Error auto-validating referral code:', error);
                }
            };

            // Execute auto-validation
            autoValidateReferral();
        }
    }, []); // Run only once on component mount

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Reset referral status when referral code is changed
        if (name === 'referralCode') {
            setReferralStatus({
                isValidating: false,
                isValid: false,
                error: '',
                appliedCode: null,
            });
            
            if (referralStatus.appliedCode) {
                setOrderSummary(prev => ({
                    ...prev,
                    discount: 0,
                    finalPrice: prev.subtotal,
                }));
            }
        }

        // Reset discount status when discount code is changed
        if (name === 'discountCode') {
            setDiscountStatus({
                isValidating: false,
                isValid: false,
                error: '',
                appliedCode: null,
                discountPercentage: 0,
                discountAmount: 0,
            });
            
            // Recalculate order summary without discount
            if (currentTicketPrice.price > 0) {
                const basePrice = currentTicketPrice.price * 1;
                const subtotal = basePrice * formData.quantity;
                setOrderSummary({
                    basePrice,
                    subtotal,
                    discountAmount: 0,
                    finalPrice: subtotal,
                });
            }
        }
    };

    const validateReferralCode = async () => {
        if (!formData.referralCode.trim()) return;

        setReferralStatus({ isValidating: true, isValid: false, error: '', appliedCode: null });

        try {
            const response = await fetch('/api/referral-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ code: formData.referralCode }),
            });

            const data = await response.json();

            if (data.success) {
                setReferralStatus({
                    isValidating: false,
                    isValid: true,
                    error: '',
                    appliedCode: data.data.referral_code,
                });
            } else {
                setReferralStatus({
                    isValidating: false,
                    isValid: false,
                    error: data.message || 'Invalid referral code',
                    appliedCode: null,
                });
            }
        } catch (error) {
            setReferralStatus({
                isValidating: false,
                isValid: false,
                error: 'Failed to validate referral code',
                appliedCode: null,
            });
        }
    };

    const validateDiscountCode = async () => {
        if (!formData.discountCode.trim()) return;

        // Check if price is loaded
        if (currentTicketPrice.loading) {
            setDiscountStatus({
                isValidating: false,
                isValid: false,
                error: 'Please wait for ticket price to load',
                appliedCode: null,
                discountPercentage: 0,
                discountAmount: 0,
            });
            return;
        }

        if (currentTicketPrice.error || currentTicketPrice.price <= 0) {
            setDiscountStatus({
                isValidating: false,
                isValid: false,
                error: 'Unable to validate discount - ticket price not available',
                appliedCode: null,
                discountPercentage: 0,
                discountAmount: 0,
            });
            return;
        }

        // Calculate current subtotal
        const currentSubtotal = currentTicketPrice.price * formData.quantity;
        
        if (currentSubtotal <= 0) {
            setDiscountStatus({
                isValidating: false,
                isValid: false,
                error: 'Invalid order amount for discount validation',
                appliedCode: null,
                discountPercentage: 0,
                discountAmount: 0,
            });
            return;
        }

        setDiscountStatus({ 
            isValidating: true, 
            isValid: false, 
            error: '', 
            appliedCode: null,
            discountPercentage: 0,
            discountAmount: 0,
        });

        try {
            const response = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ 
                    code: formData.discountCode,
                    amount: currentSubtotal 
                }),
            });

            const data = await response.json();
            console.log('Discount validation response:', data); // Debug log

            if (data.success) {
                const discountPercentage = data.data.discount_code?.discount_percentage || data.data.discount_percentage;
                const discountAmount = currentSubtotal * (discountPercentage / 100);
                
                setDiscountStatus({
                    isValidating: false,
                    isValid: true,
                    error: '',
                    appliedCode: data.data.discount_code || data.data,
                    discountPercentage: discountPercentage,
                    discountAmount: discountAmount,
                });

                // Update order summary with discount
                setOrderSummary(prev => ({
                    ...prev,
                    discountAmount: discountAmount,
                    finalPrice: prev.subtotal - discountAmount,
                }));
            } else {
                setDiscountStatus({
                    isValidating: false,
                    isValid: false,
                    error: data.message || 'Invalid discount code',
                    appliedCode: null,
                    discountPercentage: 0,
                    discountAmount: 0,
                });
            }
        } catch (error) {
            console.error('Discount validation error:', error); // Debug log
            setDiscountStatus({
                isValidating: false,
                isValid: false,
                error: 'Failed to validate discount code. Please try again.',
                appliedCode: null,
                discountPercentage: 0,
                discountAmount: 0,
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.confirmEmail.trim()) {
            errors.confirmEmail = 'Please confirm your email address';
        } else if (formData.email !== formData.confirmEmail) {
            errors.confirmEmail = 'Email addresses do not match';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (!formData.category) {
            errors.category = 'Category is required';
        }

        if (formData.quantity < 1 || formData.quantity > 10) {
            errors.quantity = 'Quantity must be between 1 and 10';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const proceedToPayment = async () => {
        // Validate form before proceeding
        if (!validateForm()) {
            return;
        }

        setIsProcessingPayment(true);

        try {
            // Step 1: Check for existing order
            const checkOrderResponse = await fetch('/api/orders/check-existing', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    email: formData.email,
                    phone: formData.phone,
                }),
            });

            if (checkOrderResponse.status === 422) {
                const errorData = await checkOrderResponse.json();
                
                // Handle validation errors (duplicate email/phone)
                if (errorData.errors) {
                    setFormErrors(prev => ({
                        ...prev,
                        ...errorData.errors
                    }));
                } else {
                    // Fallback: try to determine which field has the error based on message
                    if (errorData.message.toLowerCase().includes('email')) {
                        setFormErrors(prev => ({
                            ...prev,
                            email: errorData.message
                        }));
                    } else if (errorData.message.toLowerCase().includes('phone')) {
                        setFormErrors(prev => ({
                            ...prev,
                            phone: errorData.message
                        }));
                    } else {
                        // If we can't determine, show on both fields
                        setFormErrors(prev => ({
                            ...prev,
                            email: errorData.message,
                            phone: errorData.message
                        }));
                    }
                }
                setIsProcessingPayment(false);
                return;
            }

            // Step 2: Login user with their actual data
            console.log('Starting authentication process...');
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }
            
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                }),
                credentials: 'include',
            });

            console.log('Login response status:', loginResponse.status);
            
            let loginData;
            try {
                const responseText = await loginResponse.text();
                console.log('Login response text:', responseText);
                
                try {
                    loginData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse login response as JSON:', parseError);
                    throw new Error('Authentication failed - invalid response format');
                }
            } catch (textError) {
                console.error('Failed to get response text:', textError);
                throw new Error('Authentication failed - could not read response');
            }
            
            if (!loginData.success) {
                console.error('Login failed:', loginData.message);
                throw new Error(loginData.message || 'Authentication failed');
            }
            
            localStorage.setItem('purchase_token', loginData.data.token);
            console.log('Authentication successful, proceeding to create order...');

            // Step 3: Create order
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('purchase_token')}`,
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    buyer_name: formData.fullName,
                    buyer_email: formData.email,
                    buyer_phone: formData.phone,
                    quantity: formData.quantity,
                    category: formData.category,
                    referral_code: formData.referralCode,
                    discount_code: formData.discountCode,
                    ticket_type: currentTicketPrice.ticket_type,
                }),
                credentials: 'include',
            });

            console.log('Order response status:', orderResponse.status);
            
            let orderData;
            try {
                const responseText = await orderResponse.text();
                console.log('Order response text:', responseText);
                
                try {
                    orderData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse order response as JSON:', parseError);
                    throw new Error('Order creation failed - invalid response format');
                }
            } catch (textError) {
                console.error('Failed to get order response text:', textError);
                throw new Error('Order creation failed - could not read response');
            }
            
            if (!orderData.success) {
                console.error('Order creation failed:', orderData.message);
                
                // Handle validation errors from order creation
                if (orderResponse.status === 422 && orderData.errors) {
                    setFormErrors(prev => ({
                        ...prev,
                        ...orderData.errors
                    }));
                    setIsProcessingPayment(false);
                    return;
                }
                
                throw new Error(orderData.message || 'Failed to create order');
            }
            
            console.log('Order created successfully, proceeding to payment...');

            // Step 4: Get payment token
            const paymentResponse = await fetch(`/api/payment/${orderData.data.order.order_number}/create`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('purchase_token')}`,
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });

            console.log('Payment response status:', paymentResponse.status);
            
            let paymentData;
            try {
                const responseText = await paymentResponse.text();
                console.log('Payment response text:', responseText);
                
                try {
                    paymentData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse payment response as JSON:', parseError);
                    throw new Error('Payment creation failed - invalid response format');
                }
            } catch (textError) {
                console.error('Failed to get payment response text:', textError);
                throw new Error('Payment creation failed - could not read response');
            }

            if (!paymentData.success) {
                console.error('Payment creation failed:', paymentData.message);
                throw new Error(paymentData.message || 'Failed to create payment token');
            }
            
            console.log('Payment token created successfully:', paymentData.data.snap_token);
            setIsProcessingPayment(false);

            const verifyPaymentWithBackend = async (orderNumber) => {
                const purchaseToken = localStorage.getItem('purchase_token');

                try {
                    if (purchaseToken) {
                        const verifyResponse = await fetch(`/api/payment/${orderNumber}/verify`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                ...(purchaseToken ? { 'Authorization': `Bearer ${purchaseToken}` } : {}),
                                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                            },
                            credentials: 'include',
                        });

                        const verifyData = await verifyResponse.json().catch(() => ({}));

                        if (verifyResponse.ok && verifyData?.success) {
                            return {
                                success: true,
                                order: verifyData?.data?.order ?? null,
                            };
                        }

                        console.warn('Payment verification did not confirm success yet:', verifyData);
                    }

                    const statusResponse = await fetch(`/api/payment/${orderNumber}/status`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });

                    const statusData = await statusResponse.json().catch(() => ({}));

                    if (statusResponse.ok && statusData?.success && statusData?.data?.is_successful) {
                        return {
                            success: true,
                            order: {
                                order_number: orderNumber,
                                status: statusData.data.status,
                                paid_at: statusData.data.paid_at,
                            },
                        };
                    }

                    return { success: false };
                } catch (error) {
                    console.error('Payment verification error:', error);
                    return { success: false, error };
                }
            };

            // Check if Midtrans Snap is ready
            if (!window.snap || !window.snapIsReady) {
                console.log('Waiting for Midtrans Snap to be ready...');
                let attempts = 0;
                const checkSnapInterval = setInterval(() => {
                    attempts++;
                    console.log(`Checking Snap readiness (attempt ${attempts}/20)...`);
                    
                    if (window.snap && window.snapIsReady) {
                        console.log('Midtrans Snap is now ready!');
                        clearInterval(checkSnapInterval);
                        processPayment(paymentData.data.snap_token, orderData.data.order.order_number);
                    } else if (attempts >= 20) {
                        clearInterval(checkSnapInterval);
                        console.error('Timed out waiting for Midtrans Snap to be ready');
                        alert('Payment gateway is not available. Please refresh the page and try again.');
                    }
                }, 500);
            } else {
                console.log('Midtrans Snap is already ready, proceeding with payment');
                processPayment(paymentData.data.snap_token, orderData.data.order.order_number);
            }

            function processPayment(token, orderNumber) {
                // Store order details for pending page
                const orderDetails = {
                    orderId: orderNumber,
                    snapToken: token,
                };
                localStorage.setItem('pending_order', JSON.stringify(orderDetails));

                window.snap.pay(token, {
                    skipOrderSummary: true, // This removes the "Back to Merchant" button and auto-closes on success
                    onSuccess: function(result) {
                        console.log('PAYMENT SUCCESS from Midtrans:', result);

                        (async () => {
                            const verifyResult = await verifyPaymentWithBackend(orderNumber);

                            if (verifyResult.success) {
                                const orderInfo = verifyResult.order || {};
                                localStorage.setItem('recent_successful_order', JSON.stringify({
                                    orderNumber,
                                    status: orderInfo.status ?? 'settlement',
                                    paidAt: orderInfo.paid_at ?? new Date().toISOString(),
                                }));
                                localStorage.removeItem('pending_order');
                                window.location.href = '/payment/success';
                            } else {
                                console.warn('Could not confirm payment settlement immediately, redirecting to pending page for follow-up checks.');
                                window.location.href = '/payment/pending';
                            }
                        })();
                    },
                    onPending: function(result) {
                        console.log('PAYMENT PENDING from Midtrans:', result);
                        // Go to our pending page
                        window.location.href = '/payment/pending';
                    },
                    onError: function(result) {
                        console.log('PAYMENT ERROR from Midtrans:', result);
                        localStorage.removeItem('pending_order');
                        // Go to our pending page
                        window.location.href = '/payment/pending';
                    },
                    onClose: function() {
                        console.log('PAYMENT POPUP CLOSED by user');
                        // Don't cancel order immediately, redirect to pending page
                        window.location.href = '/payment/pending';
                    }
                });
            }
        } catch (error) {
            setIsProcessingPayment(false);
            console.error('Payment processing error:', error);
            alert(`Payment processing failed: ${error.message}. Please try again.`);
        }
    };

    const handleBuyTicket = (ticketType) => {
        setSelectedTicketType(ticketType);
        // Scroll to top before showing form
        window.scrollTo({ top: 0, behavior: 'auto' });
        setShowOrderForm(true);
    };

    const handleBackToPricing = () => {
        setShowOrderForm(false);
        setSelectedTicketType(null);
    };

    return (
        <MainLayout>
            {!showOrderForm ? (
                <>
                    <HeroSection />
                    <SecondaryNavigation />
                    <LineUpSection />
                    <TicketPricingSection onBuyTicket={handleBuyTicket} />
                    <SpinSection />
                </>
            ) : (
                <div className="min-h-screen bg-[#281F65] pt-20">
                    <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20 pb-20">
                        {/* Main Form Container */}
                        <div className="w-full max-w-5xl">
                            {/* Header Section */}
                            <div className="text-center mb-12">
                                <button
                                    onClick={handleBackToPricing}
                                    className="cursor-pointer group mb-8 inline-flex items-center gap-3 px-8 py-4 bg-[#0E4280]/20 border border-[#42B5B5]/30 rounded-full text-[#FFFFFF] font-semibold hover:bg-[#0E4280]/30 hover:border-[#42B5B5]/50 transition-all duration-300 hover:scale-105"
                                >
                                    <svg className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Ticket Selection
                                </button>
                                
                                {/* Festival Title with Clean White Text */}
                                <div className="relative mb-8">
                                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#FFFFFF] mb-4 font-museum">
                                        UNIFY 2025
                                    </h1>
                                </div>
                                
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#F3C019] via-[#E34921] to-[#A42128] rounded-full text-[#FFFFFF] font-bold text-base uppercase tracking-wider shadow-2xl shadow-[#F3C019]/30">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {selectedTicketType?.toUpperCase().replace('-', ' ')} TICKET
                                </div>
                            </div>

                            {/* Form Container with Enhanced Glass Morphism */}
                            <div className="bg-[#FFFFFF]/15 backdrop-blur-2xl border border-[#42B5B5]/30 rounded-3xl shadow-2xl shadow-[#0E4280]/30 p-8 md:p-12 lg:p-16 font-museum">
                                <form className="space-y-10">
                                    {/* Contact Information Section */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-gradient-to-r from-[#F3C019] to-[#E34921] rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 className="text-3xl font-black text-[#FFFFFF]">
                                                Contact Information
                                            </h3>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="group md:col-span-2">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        Full Name *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg ${
                                                            formErrors.fullName ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                        }`}
                                                        placeholder="Enter your full name"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                {formErrors.fullName && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.fullName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                        Email Address *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg ${
                                                            formErrors.email ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                        }`}
                                                        placeholder="active@email.com"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                {/* Email Helper Text - Always Visible */}
                                                <div className="mt-3">
                                                    <p className="text-[#F3C019] text-sm flex items-center gap-2 bg-[#F3C019]/10 border border-[#F3C019]/30 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-4 h-4 text-[#F3C019] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="break-words">MAKE SURE THIS IS YOUR ACTIVE EMAIL. Your ticket will be delivered here.</span>
                                                    </p>
                                                </div>
                                                
                                                {formErrors.email && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.email}
                                                    </p>
                                                )}
                                                {formErrors.buyer_email && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.buyer_email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                        Confirm Email *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        name="confirmEmail"
                                                        value={formData.confirmEmail}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg ${
                                                            formErrors.confirmEmail ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                        }`}
                                                        placeholder="Confirm your active email"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                {/* Confirm Email Helper Text - Always Visible */}
                                                <div className="mt-3">
                                                    <p className="text-[#F3C019] text-sm flex items-center gap-2 bg-[#F3C019]/10 border border-[#F3C019]/30 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-4 h-4 text-[#F3C019] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="break-words">MAKE SURE THIS IS YOUR ACTIVE EMAIL. Your ticket will be delivered here.</span>
                                                    </p>
                                                </div>
                                                
                                                {formErrors.confirmEmail && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.confirmEmail}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                        </svg>
                                                        Phone Number *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg ${
                                                            formErrors.phone ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                        }`}
                                                        placeholder="+62 812 3456 7890"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                {formErrors.phone && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.phone}
                                                    </p>
                                                )}
                                                {formErrors.buyer_phone && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.buyer_phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                                        </svg>
                                                        Category *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 appearance-none shadow-lg ${
                                                            formErrors.category ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                        }`}
                                                    >
                                                        <option value="internal" className="text-[#545454] bg-[#FFFFFF]">Internal (UMN Student/Staff)</option>
                                                        <option value="external" className="text-[#545454] bg-[#FFFFFF]">External (General Public)</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                                                        <svg className="w-6 h-6 text-[#D9D9D9]/70" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                {formErrors.category && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.category}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Selection Section */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-gradient-to-r from-[#42B5B5] to-[#0E4280] rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M22 10v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-2-2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2z"/>
                                                    <circle cx="6" cy="6" r="1"/>
                                                    <circle cx="6" cy="12" r="1"/>
                                                    <circle cx="18" cy="6" r="1"/>
                                                    <circle cx="18" cy="12" r="1"/>
                                                    <path d="M10 6h8M10 12h8"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-3xl font-black text-[#FFFFFF]">
                                                Ticket Selection
                                            </h3>
                                        </div>
                                        
                                        {/* Number of Tickets - Full Width */}
                                        <div className="group">
                                            <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#42B5B5] transition-colors duration-300">
                                                <span className="flex items-center gap-3">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" clipRule="evenodd" />
                                                    </svg>
                                                    Number of Tickets *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 rounded-2xl text-[#FFFFFF] text-lg focus:bg-[#FFFFFF]/35 focus:border-[#42B5B5] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 appearance-none shadow-lg ${
                                                        formErrors.quantity ? 'border-[#E34921] bg-[#E34921]/25' : 'border-[#42B5B5]/40'
                                                    }`}
                                                >
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1} className="text-[#545454] bg-[#FFFFFF]">
                                                            {i + 1} {i === 0 ? 'Ticket' : 'Tickets'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                                                    <svg className="w-6 h-6 text-[#D9D9D9]/70" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#42B5B5]/15 to-[#0E4280]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            </div>
                                            {formErrors.quantity && (
                                                <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                    <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {formErrors.quantity}
                                                </p>
                                            )}
                                        </div>

                                        {/* Optional Codes Section - Referral and Discount side by side for md+ */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Referral Code */}
                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#42B5B5] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        Referral Code (Optional)
                                                    </span>
                                                </label>
                                                <div className="flex gap-4">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            name="referralCode"
                                                            value={formData.referralCode}
                                                            onChange={handleInputChange}
                                                            className="w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 border-[#42B5B5]/40 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#42B5B5] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg"
                                                            placeholder="Enter referral code"
                                                        />
                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#42B5B5]/15 to-[#0E4280]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={validateReferralCode}
                                                        disabled={!formData.referralCode.trim() || referralStatus.isValidating}
                                                        className="px-8 py-5 bg-gradient-to-r from-[#42B5B5] to-[#0E4280] text-[#FFFFFF] rounded-2xl font-bold text-lg hover:from-[#42B5B5]/80 hover:to-[#0E4280]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                                                    >
                                                        {referralStatus.isValidating ? (
                                                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : 'Apply'}
                                                    </button>
                                                </div>
                                                {referralStatus.error && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {referralStatus.error}
                                                    </p>
                                                )}
                                                {referralStatus.isValid && referralStatus.appliedCode && (
                                                    <div className="bg-[#42B5B5]/25 border border-[#42B5B5]/40 rounded-2xl p-5 mt-4 backdrop-blur-sm">
                                                        <p className="text-[#FFFFFF] text-base font-semibold flex items-center gap-3">
                                                            <svg className="w-6 h-6 text-[#42B5B5]" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            👤 Panitia: <span className="text-[#42B5B5]">{referralStatus.appliedCode.panitia_name}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Discount Code */}
                                            <div className="group">
                                                <label className="block text-base font-bold text-[#FFFFFF]/95 mb-4 group-focus-within:text-[#F3C019] transition-colors duration-300">
                                                    <span className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                        </svg>
                                                        Discount Code (Optional)
                                                    </span>
                                                </label>
                                                <div className="flex gap-4">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            name="discountCode"
                                                            value={formData.discountCode}
                                                            onChange={handleInputChange}
                                                            className="w-full px-8 py-5 bg-[#FFFFFF]/25 backdrop-blur-sm border-2 border-[#F3C019]/40 rounded-2xl text-[#FFFFFF] text-lg placeholder-[#D9D9D9]/70 focus:bg-[#FFFFFF]/35 focus:border-[#F3C019] focus:outline-none transition-all duration-300 hover:bg-[#FFFFFF]/30 shadow-lg"
                                                            placeholder="Enter discount code"
                                                        />
                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C019]/15 to-[#E34921]/15 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={validateDiscountCode}
                                                        disabled={!formData.discountCode.trim() || discountStatus.isValidating}
                                                        className="px-8 py-5 bg-gradient-to-r from-[#F3C019] to-[#E34921] text-[#FFFFFF] rounded-2xl font-bold text-lg hover:from-[#F3C019]/80 hover:to-[#E34921]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                                                    >
                                                        {discountStatus.isValidating ? (
                                                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : 'Apply'}
                                                    </button>
                                                </div>
                                                {discountStatus.error && (
                                                    <p className="text-[#FFFFFF] text-sm mt-3 flex items-center gap-2 bg-[#E34921]/30 border border-[#E34921]/50 rounded-lg p-3 backdrop-blur-sm">
                                                        <svg className="w-5 h-5 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {discountStatus.error}
                                                    </p>
                                                )}
                                                {discountStatus.isValid && discountStatus.appliedCode && (
                                                    <div className="bg-[#F3C019]/25 border border-[#F3C019]/40 rounded-2xl p-5 mt-4 backdrop-blur-sm">
                                                        <p className="text-[#FFFFFF] text-base font-semibold flex items-center gap-3">
                                                            <svg className="w-6 h-6 text-[#F3C019]" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            🎟️ {discountStatus.discountPercentage}% discount applied! 
                                                            <span className="text-[#F3C019]">Save Rp {discountStatus.discountAmount.toLocaleString('id-ID')}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary Section - Responsive */}
                                    <div className="bg-[#FFFFFF]/25 backdrop-blur-md border border-[#42B5B5]/40 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F3C019] to-[#42B5B5] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#FFFFFF]">
                                                Order Summary
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4 sm:space-y-6">
                                            {/* Base Price - Responsive */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#FFFFFF]/95">
                                                <span className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base md:text-lg">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="break-words">Base Price per Ticket:</span>
                                                </span>
                                                <span className="font-bold text-sm sm:text-base md:text-lg ml-6 sm:ml-0">Rp {orderSummary.basePrice.toLocaleString('id-ID')}</span>
                                            </div>
                                            
                                            {/* Quantity - Responsive */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#FFFFFF]/95">
                                                <span className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base md:text-lg">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Quantity:</span>
                                                </span>
                                                <span className="font-bold text-sm sm:text-base md:text-lg ml-6 sm:ml-0">{formData.quantity} {formData.quantity === 1 ? 'ticket' : 'tickets'}</span>
                                            </div>
                                            
                                            {/* Subtotal - Responsive */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#FFFFFF]/95">
                                                <span className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base md:text-lg">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Subtotal:</span>
                                                </span>
                                                <span className="font-bold text-sm sm:text-base md:text-lg ml-6 sm:ml-0">Rp {orderSummary.subtotal.toLocaleString('id-ID')}</span>
                                            </div>

                                            {/* Discount Amount - Show only if discount is applied */}
                                            {discountStatus.isValid && orderSummary.discountAmount > 0 && (
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#F3C019]">
                                                    <span className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base md:text-lg">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Discount ({discountStatus.discountPercentage}%):</span>
                                                    </span>
                                                    <span className="font-bold text-sm sm:text-base md:text-lg ml-6 sm:ml-0">-Rp {orderSummary.discountAmount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}

                                            {/* Bundle Discount - show if applicable */}
                                            {orderSummary.bundleDiscountAmount > 0 && (
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#F59E0B]">
                                                    <span className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base md:text-lg">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" />
                                                        </svg>
                                                        <span>Bundle Discount:</span>
                                                    </span>
                                                    <span className="font-bold text-sm sm:text-base md:text-lg ml-6 sm:ml-0">-Rp {orderSummary.bundleDiscountAmount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                            
                                            {/* Total Amount - Responsive */}
                                            <div className="border-t border-[#42B5B5]/30 pt-4 sm:pt-6">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[#FFFFFF]">
                                                    <span className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-black">
                                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="break-words">Total Amount:</span>
                                                    </span>
                                                    <span className="text-[#F3C019] drop-shadow-lg text-lg sm:text-xl md:text-2xl font-black ml-7 sm:ml-0 break-all">
                                                        Rp {orderSummary.finalPrice.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Loading/Error State */}
                                    {currentTicketPrice.loading && (
                                        <div className="bg-[#FFFFFF]/25 backdrop-blur-md border border-[#42B5B5]/40 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl mb-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <svg className="animate-spin w-6 h-6 text-[#F3C019]" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-[#FFFFFF] font-semibold">Loading ticket prices...</span>
                                            </div>
                                        </div>
                                    )}

                                    {currentTicketPrice.error && (
                                        <div className="bg-[#E34921]/25 backdrop-blur-md border border-[#E34921]/40 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl mb-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <svg className="w-6 h-6 text-[#E34921]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-[#FFFFFF] font-semibold">{currentTicketPrice.error}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Button - Fully Responsive */}
                                    <button
                                        type="button"
                                        onClick={proceedToPayment}
                                        disabled={isProcessingPayment || currentTicketPrice.loading || currentTicketPrice.error || currentTicketPrice.price <= 0}
                                        className="group w-full cursor-pointer bg-gradient-to-r from-[#F3C019] via-[#E34921] to-[#A42128] text-[#FFFFFF] py-4 sm:py-6 md:py-8 px-4 sm:px-8 md:px-12 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-lg md:text-xl lg:text-2xl hover:from-[#F3C019]/90 hover:via-[#E34921]/90 hover:to-[#A42128]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#F3C019]/30 relative overflow-hidden shadow-xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFFFF]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
                                            {isProcessingPayment ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-center">Processing Payment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-center leading-tight">
                                                        <span className="block sm:inline">PROCEED TO CHECKOUT</span>
                                                    </span>
                                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* WhatsApp Contact Button */}
                                    <div className="mt-4 sm:mt-6 text-center">
                                        <p className="text-[#fff] font-semibold text-sm sm:text-base mb-2 sm:mb-3">
                                            Need help or experiencing issues?
                                        </p>
                                        <a
                                            href="https://wa.me/6281315983958?text=Hello,%20I%20need%20help%20with%20ticket%20purchase"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                            <span>Contact Support via WhatsApp</span>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Ticket;


