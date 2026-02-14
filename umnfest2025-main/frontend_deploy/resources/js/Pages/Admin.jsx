import React, { useState, useEffect } from 'react';
import AdminLayout from '../Layouts/AdminLayout';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalTickets: 0,
        checkedInTickets: 0,
        pendingOrders: 0
    });
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [referralCodes, setReferralCodes] = useState([]);
    const [bundleEnabled, setBundleEnabled] = useState(false);
    const [savingBundle, setSavingBundle] = useState(false);
    const [bundleSaved, setBundleSaved] = useState(false);
    const [bundleSaveError, setBundleSaveError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [webTotal, setWebTotal] = useState(0);
    const [googleFormTotal, setGoogleFormTotal] = useState(0);
    const [chartPeriod, setChartPeriod] = useState(7); // 7, 14, 30 days
    const [chartType, setChartType] = useState('revenue'); // 'revenue' or 'tickets'

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Compute web / google form totals whenever orders change
    useEffect(() => {
        let web = 0;
        let google = 0;
        if (Array.isArray(orders) && orders.length > 0) {
            orders.forEach(o => {
                const amount = Number(o?.final_amount ?? o?.amount ?? 0) || 0;
                const reason = (o?.sync_locked_reason || '').toString().trim();
                const normalizedStatus = (o?.payment_status || o?.status || '')
                    .toString()
                    .trim()
                    .toLowerCase();
                const isPaidOrder = normalizedStatus === 'paid' || normalizedStatus === 'settlement';

                if (reason === 'Manual import (pre-web sale)') {
                    google += amount;
                } else if (isPaidOrder) {
                    web += amount;
                }
            });
        }
        setWebTotal(web);
        setGoogleFormTotal(google);
    }, [orders]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel with credentials for admin auth
            const [ordersRes, ticketsRes, referralRes] = await Promise.all([
                fetch('/api/orders', { credentials: 'include' }),
                fetch('/api/tickets', { credentials: 'include' }),
                fetch('/api/referral-codes', { credentials: 'include' })
            ]);

            const ordersData = await ordersRes.json();
            const ticketsData = await ticketsRes.json();
            const referralData = await referralRes.json();

            if (ordersData.success) {
                setOrders(ordersData.data.orders.data || ordersData.data.orders);
            }
            if (ticketsData.success) {
                setTickets(ticketsData.data.tickets);
            }
            if (referralData.success) {
                setReferralCodes(referralData.data.referral_codes);
            }

            // fetch admin bundle setting (if admin)
            try {
                const bundleRes = await fetch('/api/admin/settings/bundle-ticket', { credentials: 'include' });
                if (bundleRes.ok) {
                    const bundleJson = await bundleRes.json();
                    if (bundleJson.success && bundleJson.data) {
                        setBundleEnabled(!!bundleJson.data.enabled);
                    }
                }
            } catch (e) {
                // ignore - only admins will have access
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics from real data
    const calculateMetrics = () => {
        if (!orders.length) return metrics;

        const paidOrders = orders.filter(order => 
            ['paid', 'settlement', 'capture'].includes(order.status)
        );
        const pendingOrders = orders.filter(order => 
            ['pending', 'authorize'].includes(order.status)
        );

        const totalRevenue = paidOrders.reduce((sum, order) => 
            sum + parseFloat(order.amount || 0), 0
        );

        const totalTickets = tickets.length;
        const checkedInTickets = tickets.filter(ticket => 
            ticket.status === 'used'
        ).length;

        return {
            totalRevenue,
            totalTickets,
            checkedInTickets,
            pendingOrders: pendingOrders.length
        };
    };

    const realMetrics = calculateMetrics();
    const checkInRate = realMetrics.totalTickets > 0 ? 
        Math.round((realMetrics.checkedInTickets / realMetrics.totalTickets) * 100) : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const metricCardClass = "relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border";

    // Customer payment status categories
    const getCustomerCategories = () => {
        if (!orders.length) return [];

        const paidCount = orders.filter(order => 
            ['paid', 'settlement', 'capture'].includes(order.status)
        ).length;
        const pendingCount = orders.filter(order => 
            ['pending', 'authorize'].includes(order.status)
        ).length;
        const failedCount = orders.filter(order => 
            ['failed', 'cancelled', 'deny', 'cancel', 'expire'].includes(order.status)
        ).length;

        const total = orders.length;
        if (total === 0) return [];

        return [
            { 
                category: 'Paid/Settlement', 
                count: paidCount, 
                percentage: Math.round((paidCount / total) * 100), 
                color: '#10B981' 
            },
            { 
                category: 'Pending', 
                count: pendingCount, 
                percentage: Math.round((pendingCount / total) * 100), 
                color: '#F59E0B' 
            },
            { 
                category: 'Failed/Cancelled', 
                count: failedCount, 
                percentage: Math.round((failedCount / total) * 100), 
                color: '#EF4444' 
            }
        ].filter(cat => cat.count > 0);
    };

    const customerCategories = getCustomerCategories();

    // Recent orders (last 5)
    const getRecentOrders = () => {
        return orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
    };

    const recentOrders = getRecentOrders();

    // Chart 1: Revenue/Tickets Over Time - FLEXIBLE PERIOD
    const getDataByPeriod = () => {
        const days = [];
        const today = new Date();
        
        for (let i = chartPeriod - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            let dayRevenue = 0;
            let dayTickets = 0;
            let dayOrdersCount = 0;
            
            if (Array.isArray(orders) && orders.length > 0) {
                const paidOrdersForDay = orders.filter(o => {
                    if (!o.created_at) return false;
                    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                    const status = (o.status || '').toLowerCase();
                    return orderDate === dateStr && ['paid', 'settlement', 'capture'].includes(status);
                });
                
                dayRevenue = paidOrdersForDay.reduce((sum, o) => sum + parseFloat(o.final_amount || o.amount || 0), 0);
                dayOrdersCount = paidOrdersForDay.length;
            }
            
            if (Array.isArray(tickets) && tickets.length > 0) {
                dayTickets = tickets.filter(t => {
                    if (!t.created_at) return false;
                    const ticketDate = new Date(t.created_at).toISOString().split('T')[0];
                    return ticketDate === dateStr;
                }).length;
            }
            
            days.push({
                date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                fullDate: dateStr,
                revenue: dayRevenue,
                tickets: dayTickets,
                orders: dayOrdersCount
            });
        }
        return days;
    };

    const periodData = getDataByPeriod();
    const maxRevenue = Math.max(...periodData.map(d => d.revenue), 1);
    const maxTickets = Math.max(...periodData.map(d => d.tickets), 1);
    const maxOrders = Math.max(...periodData.map(d => d.orders), 1);

    // Chart 2: Orders by Status (REAL DATA FROM DATABASE)
    const getOrdersByCategory = () => {
        const categories = {
            'Paid': { count: 0, revenue: 0 },
            'Pending': { count: 0, revenue: 0 },
            'Failed/Cancelled': { count: 0, revenue: 0 }
        };
        
        // Group orders by status
        if (Array.isArray(orders) && orders.length > 0) {
            orders.forEach(order => {
                const status = (order.status || '').toLowerCase();
                const amount = parseFloat(order.final_amount || order.amount || 0);
                
                if (['paid', 'settlement', 'capture'].includes(status)) {
                    categories['Paid'].count++;
                    categories['Paid'].revenue += amount;
                } else if (['pending', 'authorize'].includes(status)) {
                    categories['Pending'].count++;
                    categories['Pending'].revenue += amount;
                } else {
                    categories['Failed/Cancelled'].count++;
                    categories['Failed/Cancelled'].revenue += amount;
                }
            });
        }
        
        return Object.entries(categories)
            .map(([name, data]) => ({ name, ...data }))
            .filter(cat => cat.count > 0)
            .sort((a, b) => b.count - a.count);
    };

    const categoryData = getOrdersByCategory();
    const maxCategoryCount = Math.max(...categoryData.map(c => c.count), 1);

    // Chart 3: Top 5 Referral Codes - REAL DATA FROM DATABASE
    const getTopReferralCodes = () => {
        if (!Array.isArray(referralCodes) || referralCodes.length === 0) {
            return [];
        }
        
        return referralCodes
            .filter(code => (code.uses || 0) > 0)
            .sort((a, b) => {
                const usesA = a.uses || 0;
                const usesB = b.uses || 0;
                return usesB - usesA;
            })
            .slice(0, 5)
            .map(code => ({
                code: code.code || 'N/A',
                uses: code.uses || 0,
                owner: code.panitia_name || 'Unknown'
            }));
    };

    const topReferrals = getTopReferralCodes();
    const maxReferralUses = Math.max(...topReferrals.map(r => r.uses), 1);

    // Handler for toggling bundle setting with server persistence
    const handleBundleToggle = async (e) => {
        const enabled = e.target.checked;
        // optimistic update
        setBundleEnabled(enabled);
        setBundleSaveError(null);
        setSavingBundle(true);
        setBundleSaved(false);

        // try to read CSRF token (if available) and include credentials
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/api/admin/settings/bundle-ticket', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ enabled })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to save');
            }

            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to save');

            // success feedback
            setBundleSaved(true);
            setTimeout(() => setBundleSaved(false), 2000);
        } catch (err) {
            console.error('Failed to set bundle ticket flag', err);
            setBundleSaveError(err.message || 'Save failed');
            // revert optimistic update
            setBundleEnabled(!enabled);
        } finally {
            setSavingBundle(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Dashboard Overview">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Dashboard Overview">
            <div className="space-y-8 p-6">
                {/* Real Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Total Revenue Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-600 rounded-xl opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        <div className={`${metricCardClass} border-emerald-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">💰</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Total Revenue</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {formatCurrency(realMetrics.totalRevenue)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">From paid orders</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Web Total Card (consistent layout) */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <div className={`${metricCardClass} border-slate-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">🧾</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Web Total</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(webTotal)}</p>
                                    <p className="text-xs text-slate-500 mt-1">All orders excluding Google Form</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Form Total Card (consistent layout) */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <div className={`${metricCardClass} border-slate-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">📥</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Google Form Total</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(googleFormTotal)}</p>
                                    <p className="text-xs text-slate-500 mt-1">Manual import (pre-web sale)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Tickets Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        <div className={`${metricCardClass} border-blue-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">🎫</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Active Tickets</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {realMetrics.totalTickets.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Excludes pending tickets</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check-ins Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        <div className={`${metricCardClass} border-purple-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">✅</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Check-ins</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-bold text-slate-800">
                                            {realMetrics.checkedInTickets.toLocaleString()}
                                        </p>
                                        <span className="text-sm font-medium text-purple-600">
                                            ({checkInRate}%)
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${checkInRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        <div className={`${metricCardClass} border-orange-100 min-h-[120px]`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xl">⏳</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Pending Orders</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {realMetrics.pendingOrders}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Awaiting payment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="xl:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Order Summary</h3>
                                <div className="text-sm text-slate-500">
                                    Total: {orders.length} orders
                                </div>
                            </div>
                            
                            {/* Order Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {orders.filter(o => ['paid', 'settlement', 'capture'].includes(o.status)).length}
                                    </div>
                                    <div className="text-sm text-green-700 font-medium">Paid Orders</div>
                                    <div className="text-xs text-green-600 mt-1">
                                        {formatCurrency(orders.filter(o => ['paid', 'settlement', 'capture'].includes(o.status))
                                            .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0))}
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {orders.filter(o => ['pending', 'authorize'].includes(o.status)).length}
                                    </div>
                                    <div className="text-sm text-yellow-700 font-medium">Pending Orders</div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                        {formatCurrency(orders.filter(o => ['pending', 'authorize'].includes(o.status))
                                            .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0))}
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {orders.filter(o => ['failed', 'cancelled', 'deny', 'cancel', 'expire'].includes(o.status)).length}
                                    </div>
                                    <div className="text-sm text-red-700 font-medium">Failed/Cancelled</div>
                                    <div className="text-xs text-red-600 mt-1">
                                        {formatCurrency(orders.filter(o => ['failed', 'cancelled', 'deny', 'cancel', 'expire'].includes(o.status))
                                            .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0))}
                                    </div>
                                </div>
                            </div>

                            {/* Referral Codes Summary */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Referral Codes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">{referralCodes.length}</div>
                                        <div className="text-sm text-blue-700">Total Codes</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <div className="text-xl font-bold text-purple-600">
                                            {referralCodes.reduce((sum, code) => sum + (code.uses || 0), 0)}
                                        </div>
                                        <div className="text-sm text-purple-700">Total Uses</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Payment Status */}
                    <div className="xl:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Order Payment Status</h3>
                            
                            {customerCategories.length > 0 ? (
                                <>
                                    {/* Donut Chart */}
                                    <div className="relative flex items-center justify-center mb-6">
                                        <div className="relative w-32 h-32">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke="#f1f5f9"
                                                    strokeWidth="16"
                                                    fill="transparent"
                                                />
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke={customerCategories[0]?.color || '#10B981'}
                                                    strokeWidth="16"
                                                    fill="transparent"
                                                    strokeDasharray={`${(customerCategories[0]?.percentage / 100) * 351.86} 351.86`}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-slate-800">{customerCategories[0]?.percentage}%</p>
                                                    <p className="text-xs text-slate-500">Paid</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Details */}
                                    <div className="space-y-4">
                                        {customerCategories.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div 
                                                        className="w-3 h-3 rounded-full mr-3"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {category.category}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-slate-800">
                                                        {category.count.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {category.percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No order data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New Analytics Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Chart 1: Revenue/Tickets/Orders Trend - ENHANCED WITH PERIOD SELECTOR */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">
                                {chartType === 'revenue' ? '💰 Revenue Trend' : 
                                 chartType === 'tickets' ? '🎫 Ticket Sales Trend' : 
                                 '📦 Orders Trend'}
                            </h3>
                            
                            <div className="flex gap-2">
                                {/* Chart Type Selector */}
                                <select 
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value="revenue">Revenue</option>
                                    <option value="tickets">Tickets</option>
                                    <option value="orders">Orders</option>
                                </select>
                                
                                {/* Period Selector */}
                                <select 
                                    value={chartPeriod}
                                    onChange={(e) => setChartPeriod(Number(e.target.value))}
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value={7}>Last 7 Days</option>
                                    <option value={14}>Last 14 Days</option>
                                    <option value={30}>Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                        
                        {periodData.length > 0 ? (
                            <div className="space-y-4">
                                {/* Bar Chart with Values */}
                                <div className="h-64 flex items-end justify-between gap-1">
                                    {periodData.map((day, index) => {
                                        const value = chartType === 'revenue' ? day.revenue : 
                                                     chartType === 'tickets' ? day.tickets : 
                                                     day.orders;
                                        const maxValue = chartType === 'revenue' ? maxRevenue : 
                                                        chartType === 'tickets' ? maxTickets : 
                                                        maxOrders;
                                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                        
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center group">
                                                <div className="relative w-full" style={{ height: '220px' }}>
                                                    {/* Value Label on Top */}
                                                    {value > 0 && (
                                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                            {chartType === 'revenue' 
                                                                ? `${(value / 1000000).toFixed(1)}jt`
                                                                : value.toLocaleString()}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Bar */}
                                                    <div 
                                                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 cursor-pointer
                                                            ${chartType === 'revenue' ? 'bg-gradient-to-t from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500' : 
                                                              chartType === 'tickets' ? 'bg-gradient-to-t from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500' : 
                                                              'bg-gradient-to-t from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500'}`}
                                                        style={{ height: `${height}%` }}
                                                    >
                                                        {/* Tooltip on Hover */}
                                                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
                                                            <div className="font-bold mb-1">{day.date}</div>
                                                            {chartType === 'revenue' && <div>💰 {formatCurrency(value)}</div>}
                                                            {chartType === 'tickets' && <div>🎫 {value} tickets</div>}
                                                            {chartType === 'orders' && <div>📦 {value} orders</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Date Label */}
                                                <span className={`text-xs text-slate-600 font-medium mt-2 
                                                    ${chartPeriod > 14 ? 'hidden lg:block' : ''}`}>
                                                    {chartPeriod > 14 ? day.date.split(' ')[0] : day.date}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Summary Statistics */}
                                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-600">Total</span>
                                        <div className="text-sm font-bold text-slate-800">
                                            {chartType === 'revenue' 
                                                ? formatCurrency(periodData.reduce((sum, d) => sum + d.revenue, 0))
                                                : periodData.reduce((sum, d) => sum + (chartType === 'tickets' ? d.tickets : d.orders), 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-600">Peak Day</span>
                                        <div className="text-sm font-bold text-blue-600">
                                            {chartType === 'revenue' 
                                                ? formatCurrency(Math.max(...periodData.map(d => d.revenue)))
                                                : Math.max(...periodData.map(d => chartType === 'tickets' ? d.tickets : d.orders)).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-600">Daily Average</span>
                                        <div className="text-sm font-bold text-slate-800">
                                            {chartType === 'revenue' 
                                                ? formatCurrency(periodData.reduce((sum, d) => sum + d.revenue, 0) / chartPeriod)
                                                : Math.round(periodData.reduce((sum, d) => sum + (chartType === 'tickets' ? d.tickets : d.orders), 0) / chartPeriod).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No data available for this period</p>
                            </div>
                        )}
                    </div>

                    {/* Chart 2: Orders by Status (Bar Chart) */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Orders by Status</h3>
                            <span className="text-2xl">📊</span>
                        </div>
                        
                        {categoryData.length > 0 ? (
                            <div className="space-y-4">
                                {categoryData.map((category, index) => {
                                    const percentage = maxCategoryCount > 0 ? (category.count / maxCategoryCount) * 100 : 0;
                                    const colors = [
                                        'from-emerald-500 to-teal-400',
                                        'from-blue-500 to-cyan-400',
                                        'from-purple-500 to-pink-400',
                                        'from-orange-500 to-yellow-400',
                                        'from-red-500 to-rose-400'
                                    ];
                                    const color = colors[index % colors.length];
                                    
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-800">{category.name}</span>
                                                    <span className="text-xs text-slate-500">({category.count} tickets)</span>
                                                </div>
                                                <span className="text-xs font-medium text-slate-600">
                                                    {formatCurrency(category.revenue)}
                                                </span>
                                            </div>
                                            <div className="relative w-full h-8 bg-slate-100 rounded-lg overflow-hidden">
                                                <div 
                                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-lg transition-all duration-700 flex items-center justify-end pr-3`}
                                                    style={{ width: `${percentage}%` }}
                                                >
                                                    {percentage > 20 && (
                                                        <span className="text-xs font-bold text-white">{category.count}</span>
                                                    )}
                                                </div>
                                                {percentage <= 20 && (
                                                    <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-600">
                                                        {category.count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Total Summary */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700">Total Orders</span>
                                        <span className="text-sm font-bold text-slate-800">
                                            {categoryData.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No category data available</p>
                            </div>
                        )}
                    </div>

                    {/* Chart 3: Top 5 Referral Codes (Horizontal Bar) */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Top UMN Festival 2025's Agent</h3>
                            <span className="text-2xl">🏆</span>
                        </div>
                        
                        {topReferrals.length > 0 ? (
                            <div className="space-y-4">
                                {topReferrals.map((referral, index) => {
                                    const percentage = maxReferralUses > 0 ? (referral.uses / maxReferralUses) * 100 : 0;
                                    const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];
                                    const medal = medals[index] || '🎖️';
                                    
                                    return (
                                        <div key={index} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{medal}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{referral.code}</p>
                                                        <p className="text-xs text-slate-500">{referral.owner}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-slate-800">{referral.uses}</span>
                                            </div>
                                            <div className="relative w-full h-6 bg-slate-100 rounded-lg overflow-hidden">
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-400 rounded-lg transition-all duration-700 group-hover:from-amber-600 group-hover:to-orange-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Total Summary */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Total Top 5 Uses</span>
                                        <span className="text-sm font-bold text-amber-600">
                                            {topReferrals.reduce((sum, r) => sum + r.uses, 0)} uses
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-slate-600">All Codes Total</span>
                                        <span className="text-sm font-bold text-slate-800">
                                            {referralCodes.reduce((sum, code) => sum + (code.uses || 0), 0)} uses
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No referral usage data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Breakdown Table - NEW */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">
                                📊 Daily Performance Breakdown ({chartPeriod} Days)
                            </h3>
                            <div className="flex gap-2">
                                <select 
                                    value={chartPeriod}
                                    onChange={(e) => setChartPeriod(Number(e.target.value))}
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value={7}>Last 7 Days</option>
                                    <option value={14}>Last 14 Days</option>
                                    <option value={30}>Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Tickets Sold
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Avg Order Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {periodData.length > 0 ? (
                                    <>
                                        {periodData.slice().reverse().map((day, index) => {
                                            const avgOrderValue = day.orders > 0 ? day.revenue / day.orders : 0;
                                            const isToday = day.fullDate === new Date().toISOString().split('T')[0];
                                            
                                            return (
                                                <tr key={index} className={`hover:bg-slate-50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {isToday && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Today</span>}
                                                            <span className="text-sm font-medium text-slate-800">{day.date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {formatCurrency(day.revenue)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {day.orders}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {day.tickets}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm text-slate-600">
                                                            {formatCurrency(avgOrderValue)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        
                                        {/* Total Row */}
                                        <tr className="bg-slate-100 font-bold">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-800">TOTAL ({chartPeriod} Days)</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-emerald-700">
                                                    {formatCurrency(periodData.reduce((sum, d) => sum + d.revenue, 0))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-slate-800">
                                                    {periodData.reduce((sum, d) => sum + d.orders, 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-slate-800">
                                                    {periodData.reduce((sum, d) => sum + d.tickets, 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-slate-600">
                                                    {formatCurrency(
                                                        periodData.reduce((sum, d) => sum + d.revenue, 0) / 
                                                        Math.max(periodData.reduce((sum, d) => sum + d.orders, 0), 1)
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No data available for this period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">Recent Orders</h3>
                            <a href="/admin/orders" className="text-sm text-[#FF6B35] hover:text-[#004E89] font-medium transition-colors">
                                View All
                            </a>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentOrders.length > 0 ? recentOrders.map((order, index) => {
                            const getStatusColor = (status) => {
                                if (['paid', 'settlement', 'capture'].includes(status)) return 'bg-green-100 text-green-600';
                                if (['pending', 'authorize'].includes(status)) return 'bg-yellow-100 text-yellow-600';
                                return 'bg-red-100 text-red-600';
                            };

                            const getStatusIcon = (status) => {
                                if (['paid', 'settlement', 'capture'].includes(status)) return '✅';
                                if (['pending', 'authorize'].includes(status)) return '⏳';
                                return '❌';
                            };

                            return (
                                <div key={index} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(order.status)} mr-4`}>
                                                <span className="text-sm">{getStatusIcon(order.status)}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-800">
                                                    Order #{order.order_number} - {order.buyer_name}
                                                </span>
                                                <div className="text-xs text-slate-500">
                                                    {order.ticket_quantity} tickets • {formatCurrency(order.amount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-slate-500 font-medium">
                                                {new Date(order.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                            <div className="text-xs text-slate-400">
                                                {order.status.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="px-6 py-8 text-center text-slate-500">
                                <p>No recent orders found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bundle Ticket Toggle */}
            <div className="mt-10 p-6 pt-0 mt-[-2px]">
                <div className="mb-3 flex items-center space-x-2">
                    <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Pricing Features</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <div className="relative overflow-hidden group rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-white pointer-events-none" />
                    <div className="relative p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                            <div className={`mt-1 w-11 h-11 flex items-center justify-center rounded-xl shadow-inner ring-1 ring-slate-200 transition-colors ${bundleEnabled ? 'bg-emerald-500 text-white ring-emerald-400/40' : 'bg-slate-100 text-slate-500'}`}>
                                {bundleEnabled ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.075l-3.5-3.5a.75.75 0 011.06-1.06l2.894 2.893 6.98-8.844a.75.75 0 011.05-.116z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h10.5" /></svg>
                                )}
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                    <h4 className="text-lg font-semibold text-slate-800">Bundle Ticket Discount</h4>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full tracking-wide ${bundleEnabled ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10'}`}>{bundleEnabled ? 'ENABLED' : 'DISABLED'}</span>
                                    {savingBundle && <span className="text-xs text-slate-400 animate-pulse">saving…</span>}
                                    {bundleSaveError && <span className="text-xs text-red-500">{bundleSaveError}</span>}
                                    {bundleSaved && !savingBundle && !bundleSaveError && <span className="text-xs text-emerald-600">saved</span>}
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">Fixed discount by quantity: <span className="font-medium text-slate-700">2→4k • 3→6k • 4→8k • 5→10k</span>. Disabled = no automatic bundle reduction. Server always re-validates.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <label className="relative inline-flex items-center cursor-pointer select-none" aria-label="Toggle bundle ticket discount">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={bundleEnabled}
                                    onChange={handleBundleToggle}
                                    aria-checked={bundleEnabled}
                                />
                                <span className="w-14 h-8 rounded-full transition-colors bg-slate-300 peer-checked:bg-emerald-500 flex items-center px-1">
                                    <span className="w-6 h-6 rounded-full bg-white shadow transform transition-transform peer-checked:translate-x-6" />
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="relative border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center gap-4">
                        <div>Changes apply to new orders only; existing orders keep original pricing.</div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: bundleEnabled ? '#10b981' : '#94a3b8' }} />
                            <span className="uppercase tracking-wide font-medium text-[10px] text-slate-600">{bundleEnabled ? 'ACTIVE' : 'INACTIVE'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}