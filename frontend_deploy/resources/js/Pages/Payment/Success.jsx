import React, { useState, useEffect } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import BackgroundSection from '../../Layouts/BackgroundSection';
import { Link } from '@inertiajs/react';

const Success = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // FAST PATH: Try to get order information from localStorage first
        const recentOrder = localStorage.getItem('recent_successful_order');
        const urlParams = new URLSearchParams(window.location.search);
        const orderNumber = urlParams.get('order_id') || urlParams.get('order_number');
        
        // IMMEDIATE DISPLAY: If we have recent order data, show it immediately
        if (recentOrder && !orderNumber) {
            try {
                const orderData = JSON.parse(recentOrder);
                console.log('🚀 FAST DISPLAY: Using cached successful order data');
                setOrderDetails(orderData);
                setIsLoading(false);
                
                // Optional: Still verify in background but don't block UI
                if (orderData.orderNumber) {
                    verifyOrderInBackground(orderData.orderNumber);
                }
            } catch (e) {
                console.log('Could not parse recent order data, fetching fresh data');
                localStorage.removeItem('recent_successful_order');
                if (orderNumber) {
                    fetchOrderDetails(orderNumber);
                } else {
                    setIsLoading(false);
                }
            }
        } else if (orderNumber) {
            // If we have order number from URL, fetch details
            fetchOrderDetails(orderNumber);
        } else {
            // No order data available
            setIsLoading(false);
        }

        // Clean up any pending order data since payment is successful
        localStorage.removeItem('pending_order');
    }, []);

    const verifyOrderInBackground = async (orderNumber) => {
        try {
            console.log('🔍 BACKGROUND VERIFICATION: Verifying order status');
            const response = await fetch(`/api/payment/${orderNumber}/status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success && data.data.is_successful) {
                // Update with fresh data if different
                const freshOrderData = {
                    orderNumber: orderNumber,
                    status: data.data.status,
                    paidAt: data.data.paid_at,
                };
                
                setOrderDetails(freshOrderData);
                localStorage.setItem('recent_successful_order', JSON.stringify(freshOrderData));
                console.log('✅ BACKGROUND VERIFICATION: Order confirmed successful');
            } else if (data.success && !data.data.is_successful) {
                // If order is not actually successful, redirect to pending
                console.log('⚠️ BACKGROUND VERIFICATION: Order not successful, redirecting to pending');
                window.location.href = '/payment/pending';
            }
        } catch (error) {
            console.error('Background verification error:', error);
            // Don't disrupt user experience for background verification errors
        }
    };

    const fetchOrderDetails = async (orderNumber) => {
        try {
            console.log('🔍 FETCHING: Order details for', orderNumber);
            const response = await fetch(`/api/payment/${orderNumber}/status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                if (data.data.is_successful) {
                    const orderData = {
                        orderNumber: orderNumber,
                        status: data.data.status,
                        paidAt: data.data.paid_at,
                    };
                    
                    setOrderDetails(orderData);
                    
                    // Store for future reference
                    localStorage.setItem('recent_successful_order', JSON.stringify(orderData));
                    console.log('✅ FETCHED: Successful order details');
                } else {
                    // Order exists but not successful, redirect to pending
                    console.log('⚠️ FETCHED: Order not successful, redirecting to pending');
                    window.location.href = '/payment/pending';
                    return;
                }
            } else {
                console.log('⚠️ FETCHED: Order not found, redirecting to pending');
                window.location.href = '/payment/pending';
                return;
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            // On error, redirect to pending page
            window.location.href = '/payment/pending';
            return;
        }
        setIsLoading(false);
    };

    // If still loading and no cached data, show minimal loading
    if (isLoading && !orderDetails) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-[#281F65] flex items-center justify-center p-4 pt-32 pb-20">
                    <div className="w-full max-w-2xl bg-[#FFFFFF]/15 backdrop-blur-2xl border border-[#42B5B5]/30 rounded-3xl shadow-2xl shadow-[#0E4280]/30 p-8 md:p-12 text-center" style={{ fontFamily: 'LT Museum' }}>
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-[#F3C019]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="animate-spin h-12 w-12 text-[#F3C019]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFFFFF] mb-4 leading-tight">
                                Confirming Payment...
                            </h1>
                            <p className="text-lg text-[#FFFFFF]/90 mb-6">
                                Please wait while we verify your payment details.
                            </p>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#281F65] flex items-center justify-center p-4 pt-45 pb-20">
                <div className="w-full max-w-2xl bg-[#FFFFFF]/15 backdrop-blur-2xl border border-[#42B5B5]/30 rounded-3xl shadow-2xl shadow-[#0E4280]/30 p-8 md:p-12 text-center" style={{ fontFamily: 'LT Museum' }}>
                    <div className="text-center">
                        <div className="w-24 h-24 bg-[#42B5B5]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#42B5B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFFFFF] mb-4 leading-tight">
                            Payment Successful!
                        </h1>
                        <p className="text-lg text-[#FFFFFF]/90 mb-8">
                            🎉 Thank you for your purchase. Your tickets have been secured for UMN Festival 2025!
                        </p>

                        {/* Order Details */}
                        {orderDetails ? (
                            <div className="bg-[#42B5B5]/20 backdrop-blur-sm border border-[#42B5B5]/40 rounded-2xl p-6 mb-6">
                                <h3 className="font-black text-[#fff] text-xl mb-4">Order Details</h3>
                                <div className="text-[#FFFFFF] text-base space-y-2">
                                    <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
                                    <p><strong>Status:</strong> <span className="capitalize text-[#fff] font-bold">Paid</span></p>
                                    {orderDetails.paidAt && (
                                        <p><strong>Paid At:</strong> {new Date(orderDetails.paidAt).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#D9D9D9]/20 backdrop-blur-sm border border-[#D9D9D9]/40 rounded-2xl p-6 mb-6">
                                <p className="text-[#D9D9D9]">Your payment has been processed successfully!</p>
                            </div>
                        )}

                        {/* Email Notification */}
                        <div className="bg-[#42B5B5]/20 backdrop-blur-sm border text-[#fff] border-[#42B5B5]/40 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-center mb-4 text-[#fff]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fff] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="font-black text-[#fff] text-lg">E-Tickets on the Way!</h3>
                            </div>
                            <p className="text-[#fff] text-base">
                                Your e-tickets will be sent to your email shortly. Please check your inbox (and spam folder) for the confirmation email with your QR codes.
                            </p>
                        </div>

                        {/* Success Animation */}
                        <div className="bg-[#F3C019]/20 backdrop-blur-sm border border-[#F3C019]/40 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 rounded-full bg-[#F3C019] animate-bounce"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#F3C019] animate-bounce delay-75"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#F3C019] animate-bounce delay-150"></div>
                                </div>
                            </div>
                            <p className="text-[#F3C019] text-base font-bold">
                                🎫 Your tickets are being prepared and will be delivered shortly!
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-6">
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button
                                    onClick={() => window.location.href = '/ticket'}
                                    className="bg-gradient-to-r from-[#F3C019] to-[#E34921] text-[#FFFFFF] py-4 px-8 rounded-2xl font-bold hover:from-[#F3C019]/90 hover:to-[#E34921]/90 transition duration-300 shadow-lg cursor-pointer"
                                >
                                    🎫 Order More Tickets
                                </button>
                            </div>
                            <p className="text-[#FFFFFF]/80 text-sm">
                                Need help? Contact our support team via WhatsApp at +62 813-1598-3958 (Chealsea)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Success;