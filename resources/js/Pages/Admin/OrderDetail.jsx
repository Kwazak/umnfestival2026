import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../Layouts/AdminLayout';

export default function OrderDetail() {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicketQR, setSelectedTicketQR] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/orders/${orderId}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data.data.order);
                setLoading(false);
            });
    }, [orderId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: {
                bg: 'bg-gradient-to-r from-emerald-100 to-green-100',
                text: 'text-green-700',
                icon: '✅'
            },
            pending: {
                bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
                text: 'text-orange-700',
                icon: '⏳'
            },
            failed: {
                bg: 'bg-gradient-to-r from-red-100 to-pink-100',
                text: 'text-red-700',
                icon: '❌'
            },
            cancelled: {
                bg: 'bg-gradient-to-r from-slate-100 to-gray-100',
                text: 'text-slate-700',
                icon: '⛔'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl border border-white/20 shadow-sm ${config.bg} ${config.text}`}>
                <span className="mr-2 text-base">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTicketStatusBadge = (status) => {
        const statusConfig = {
            valid: {
                bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
                text: 'text-green-700',
                icon: '✅'
            },
            used: {
                bg: 'bg-gradient-to-r from-blue-100 to-indigo-100',
                text: 'text-blue-700',
                icon: '🎯'
            },
            expired: {
                bg: 'bg-gradient-to-r from-red-100 to-pink-100',
                text: 'text-red-700',
                icon: '⚠️'
            }
        };

        const config = statusConfig[status] || statusConfig.valid;

        return (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const handleViewQR = (ticket) => {
        setSelectedTicketQR(ticket);
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <AdminLayout 
            title={`Order Details #${order.id}`} 
            subtitle={`Order placed by ${order.buyer_name} on ${formatDate(order.created_at)}`}
        >
            <div className="space-y-8 p-6">
                {/* Back Button & Actions */}
                <div className="flex justify-between items-center">
                    <Link 
                        href="/admin/orders"
                        className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Orders
                    </Link>
                    
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                            Print Receipt
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            Send Email
                        </button>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Order #{order.id}</h2>
                            <p className="text-slate-600 mt-1">
                                {order.ticket_quantity} ticket{order.ticket_quantity > 1 ? 's' : ''} • {order.category} • {formatDate(order.created_at)}
                            </p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(order.payment_status)}
                            <p className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(order.final_amount)}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column - Order Details */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Buyer Information Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="text-2xl mr-3">👤</span>
                                Buyer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                                    <p className="text-lg font-medium text-slate-800">{order.buyer_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 capitalize">
                                        {order.category}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                                    <p className="text-lg text-slate-800">{order.buyer_email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                                    <p className="text-lg text-slate-800">{order.buyer_phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="text-2xl mr-3">💳</span>
                                Transaction Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Amount</label>
                                    <p className="text-lg text-slate-800">{formatCurrency(order.amount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Payment Status</label>
                                    {getStatusBadge(order.payment_status)}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Referral Code</label>
                                    {order.referral_code ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                                            🎁 {order.referral_code.code} ({order.referral_code.panitia_name})
                                        </span>
                                    ) : (
                                        <p className="text-slate-500">No referral code used</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Transaction ID</label>
                                    <p className="text-sm font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                                        {order.midtrans_transaction_id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Tickets List */}
                    <div className="xl:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="text-2xl mr-3">🎫</span>
                                Associated Tickets ({order.tickets?.length || 0})
                            </h3>
                            <div className="space-y-4">
                                {order.tickets && order.tickets.length > 0 ? (
                                    order.tickets.map((ticket) => (
                                    <div key={ticket.id} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-mono text-sm font-bold text-slate-800">
                                                {ticket.ticket_code}
                                            </span>
                                            {getTicketStatusBadge(ticket.status)}
                                        </div>
                                        
                                        {ticket.checked_in_at && (
                                            <p className="text-xs text-slate-600 mb-3">
                                                Checked in: {formatDate(ticket.checked_in_at)}
                                            </p>
                                        )}
                                        
                                        <button
                                            onClick={() => handleViewQR(ticket)}
                                            className="w-full px-3 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                            View QR Code
                                        </button>
                                    </div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                                        <p className="text-slate-500">No tickets associated with this order.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {selectedTicketQR && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                            QR Code - {selectedTicketQR.ticket_code}
                        </h3>
                        
                        <div className="bg-white p-6 rounded-xl border-2 border-slate-200 mb-6">
                            <div className="w-48 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mx-auto flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-black/10 rounded-lg mb-3 mx-auto"></div>
                                    <p className="text-xs text-slate-500">QR Code Placeholder</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-6">
                            <p className="font-medium">Status: {getTicketStatusBadge(selectedTicketQR.status)}</p>
                            {selectedTicketQR.checked_in_at && (
                                <p className="mt-2">Checked in: {formatDate(selectedTicketQR.checked_in_at)}</p>
                            )}
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setSelectedTicketQR(null)}
                                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
