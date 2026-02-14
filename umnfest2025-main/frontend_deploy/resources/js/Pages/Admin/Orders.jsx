import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [syncSource, setSyncSource] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [webTotal, setWebTotal] = useState(0);
    const [googleFormTotal, setGoogleFormTotal] = useState(0);
    const [otsTotal, setOtsTotal] = useState(0);
    const [resendState, setResendState] = useState({ sending: false, message: '', error: '' });
    const [bulkResendState, setBulkResendState] = useState({ running: false, message: '', error: '', stats: null });
    const [syncState, setSyncState] = useState({ syncing: false, message: '', error: '' });
    const [emailEdit, setEmailEdit] = useState({ editing: false, draft: '', saving: false, message: '', error: '' });
    const [adminOverride, setAdminOverride] = useState({ working: false, message: '', error: '' });
    const [manualFormOpen, setManualFormOpen] = useState(false);
    const [manualForm, setManualForm] = useState({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        category: 'internal',
        ticket_quantity: 1,
        final_amount: 0,
        referral_code: ''
    });
    const [manualState, setManualState] = useState({ working: false, message: '', error: '' });
    const [deleteState, setDeleteState] = useState({ working: false, message: '', error: '' });
    const [manualConfirm, setManualConfirm] = useState({ ack: false, text: '' });
    // Additional UI state
    const [monthFilter, setMonthFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');
    const [tablePage, setTablePage] = useState(1);
    const [reconcileState, setReconcileState] = useState({ running: false, message: '', error: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const pageSize = 30;

    const orderSortAccessors = useMemo(() => ({
        order_number: (o) => (o?.order_number ?? '').toString().toLowerCase(),
        customer: (o) => `${(o?.buyer_name ?? '').toString().toLowerCase()}|${(o?.buyer_email ?? '').toString().toLowerCase()}`,
        amount: (o) => {
            const value = Number(o?.final_amount ?? o?.amount ?? 0);
            return Number.isFinite(value) ? value : 0;
        },
        tickets: (o) => {
            if (!o) return 0;
            if (o.ticket_quantity !== undefined && o.ticket_quantity !== null) {
                const value = Number(o.ticket_quantity);
                return Number.isFinite(value) ? value : 0;
            }
            if (Array.isArray(o?.tickets)) {
                return o.tickets.length;
            }
            return 0;
        },
        status: (o) => (o?.payment_status || o?.status || '').toString().toLowerCase(),
        sync_state: (o) => `${o?.sync_locked ? 1 : 0}|${(o?.sync_locked_reason || '').toString().toLowerCase()}`,
        inviter: (o) => (o?.referral_code?.panitia_name || '').toString().toLowerCase(),
        created_at: (o) => {
            const value = o?.created_at;
            const time = value ? new Date(value).getTime() : NaN;
            return Number.isFinite(time) ? time : 0;
        },
        whatsapp: (o) => (o?.buyer_phone || '').toString().replace(/[^\d+]/g, ''),
        actions: (o) => (o?.order_number ?? '').toString().toLowerCase(),
    }), []);

    const sortedOrders = useMemo(() => {
        const { key, direction } = sortConfig;
        if (!key || !orderSortAccessors[key]) {
            return filteredOrders;
        }
        const sorted = [...filteredOrders].sort((a, b) => {
            const valueA = orderSortAccessors[key](a);
            const valueB = orderSortAccessors[key](b);
            let comparison;
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                comparison = valueA - valueB;
            } else {
                const stringA = (valueA ?? '').toString();
                const stringB = (valueB ?? '').toString();
                comparison = stringA.localeCompare(stringB, 'id', { numeric: true, sensitivity: 'base' });
            }
            return direction === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [filteredOrders, sortConfig, orderSortAccessors]);

    // Derived pagination values based on current sorted orders
    const totalPages = Math.max(1, Math.ceil((sortedOrders?.length || 0) / pageSize));
    const currentTablePage = Math.min(tablePage, totalPages);
    const paginatedOrders = sortedOrders.slice((currentTablePage - 1) * pageSize, currentTablePage * pageSize);

    const metricCardClass = "flex flex-col justify-center gap-1 rounded-xl border border-slate-200 bg-white/95 px-5 py-3 shadow-sm";
    const GOOGLE_FORM_REASON = 'Manual import (pre-web sale)';
    const OTS_REASON = 'Onsite sale (OTS)';
    const normalizeReason = (reason) => {
        const raw = (reason ?? '').toString().trim();
        const stripped = raw.replace(/^['"]+|['"]+$/g, '');
        return stripped.toLowerCase();
    };
    const isOtsReason = (reason) => normalizeReason(reason) === normalizeReason(OTS_REASON);
    const isGoogleFormReason = (reason) => normalizeReason(reason) === normalizeReason(GOOGLE_FORM_REASON);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '⇅';
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const handleSort = (columnKey) => {
        setSortConfig((prev) => {
            if (prev.key === columnKey) {
                return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key: columnKey, direction: 'asc' };
        });
        setTablePage(1);
    };

    // CSRF helpers for routes under 'web' middleware
    const getXsrfCookie = () => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    };
    const getMetaCsrf = () => {
        if (typeof document === 'undefined') return null;
        const el = document.querySelector('meta[name="csrf-token"]');
        return el ? el.getAttribute('content') : null;
    };
    const withCsrf = (extra = {}) => {
        const xsrf = getXsrfCookie();
        const csrf = getMetaCsrf();
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
            ...extra,
        };
    };

    // Inline currency formatter used for header totals (kept local so it can be used before other helpers)
    const formatCurrencyShort = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Compute totals for the currently filtered dataset so the summary matches table filters
    useEffect(() => {
        let web = 0;
        let google = 0;
        let ots = 0;
        if (Array.isArray(filteredOrders) && filteredOrders.length > 0) {
            filteredOrders.forEach(o => {
                const amount = Number(o?.final_amount ?? o?.amount ?? 0) || 0;
                const reason = normalizeReason(o?.sync_locked_reason);
                const status = (o?.payment_status || o?.status || '')
                    .toString()
                    .trim()
                    .toLowerCase();
                const isPaidOrder = status === 'paid' || status === 'settlement';

                if (isOtsReason(reason)) {
                    ots += amount;
                } else if (isGoogleFormReason(reason)) {
                    google += amount;
                } else if (isPaidOrder) {
                    web += amount;
                }
            });
        }
        setWebTotal(web);
        setGoogleFormTotal(google);
        setOtsTotal(ots);
    }, [filteredOrders]);

    // Fetch orders from API (no auto-refresh; one-time load, filters client-side)
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        // Request a large page size (up to 10,000) to show all results; client-side filters + pagination
        params.append('per_page', '10000');

        fetch(`/api/orders?${params.toString()}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                if (data.success && data.data.orders) {
                    const list = data.data.orders.data || [];
                    setOrders(list);
                    setPagination({
                        current_page: data.data.orders.current_page || 1,
                        last_page: data.data.orders.last_page || 1,
                    });
                    setFilteredOrders(list);
                    setTablePage(1);
                } else {
                    console.error('Invalid response format:', data);
                    setOrders([]);
                    setFilteredOrders([]);
                    setTablePage(1);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
                setOrders([]);
                setFilteredOrders([]);
                setTablePage(1);
            });
    }, []);

    // Filter orders based on search, status, source, and date (month/day)
    useEffect(() => {
        if (orders.length > 0) {
            let filtered = [...orders];

            // Status filter (supports payment_status or status)
            if (status) {
                const s = status.toLowerCase();
                filtered = filtered.filter(order =>
                    ((order.payment_status || order.status) || '').toString().toLowerCase() === s
                );
            }

            // Filter by sync source derived from sync_locked_reason
            if (syncSource) {
                if (syncSource === 'google_form') {
                    filtered = filtered.filter(order => isGoogleFormReason(order.sync_locked_reason));
                } else if (syncSource === 'ots') {
                    filtered = filtered.filter(order => isOtsReason(order.sync_locked_reason));
                } else if (syncSource === 'web') {
                    filtered = filtered.filter(order => {
                        const reason = normalizeReason(order.sync_locked_reason);
                        // include everything except explicit Google Form and OTS markers
                        return !isGoogleFormReason(reason) && !isOtsReason(reason);
                    });
                }
            }

            // Date filters (month/day of created_at)
            filtered = filtered.filter(order => {
                const dt = new Date(order.created_at);
                if (monthFilter !== '' && Number.isFinite(Number(monthFilter))) {
                    if ((dt.getMonth() + 1) !== Number(monthFilter)) return false;
                }
                if (dayFilter !== '' && Number.isFinite(Number(dayFilter))) {
                    if (dt.getDate() !== Number(dayFilter)) return false;
                }
                return true;
            });

            // Enhanced search across many columns (including inviter/referral and ticket codes)
            if (search) {
                const q = search.toLowerCase();
                const inc = (v) => (v ?? '').toString().toLowerCase().includes(q);
                filtered = filtered.filter(order => {
                    const rc = order.referral_code || {};
                    const tickets = Array.isArray(order.tickets) ? order.tickets : [];
                    const ticketCodes = tickets.map(t => t.ticket_code).join(' ');
                    const ticketStatuses = tickets.map(t => t.status).join(' ');
                    return (
                        inc(order.order_number) ||
                        inc(order.id) ||
                        inc(order.buyer_name) ||
                        inc(order.buyer_email) ||
                        inc(order.buyer_phone) ||
                        inc(order.category) ||
                        inc(order.status) ||
                        inc(order.payment_status) ||
                        inc(order.sync_locked_reason) ||
                        inc(rc.code) ||
                        inc(rc.panitia_name) ||
                        inc(order.created_at) ||
                        inc(order.updated_at) ||
                        inc(order.amount) ||
                        inc(order.discount_amount) ||
                        inc(order.final_amount) ||
                        inc(ticketCodes) ||
                        inc(ticketStatuses)
                    );
                });
            }

            setFilteredOrders(filtered);
            setTablePage(1);
        } else {
            setFilteredOrders([]);
            setTablePage(1);
        }
    }, [orders, search, status, syncSource, monthFilter, dayFilter]);

    // Filter function is no longer needed since we're using API filtering

    const handleSearchChange = (e) => {
        setSearch(e.target.value ?? '');
        setPagination(p => ({ ...p, current_page: 1 }));
        setTablePage(1);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value ?? '');
        setPagination(p => ({ ...p, current_page: 1 }));
        setTablePage(1);
    };

    const handlePageChange = (page) => {
        setPagination(p => ({ ...p, current_page: page }));
    };

    const handleViewDetails = (orderIdOrNumber) => {
        // Try find by id first, fallback to order_number match
        let order = orders.find(o => o.id === orderIdOrNumber);
        if (!order) {
            order = orders.find(o => o.order_number === orderIdOrNumber);
        }
        if (order) {
            setSelectedOrder(order);
        } else {
            // If not found in current array, fetch by assuming it's an order_number (backend expects order_number for show)
            setLoading(true);
            fetch(`/api/admin/orders/${orderIdOrNumber}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.success && data.data.order) {
                        setSelectedOrder(data.data.order);
                    } else {
                        console.error('Invalid response format:', data);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching order details:', error);
                    setLoading(false);
                });
        }
    };

    // Refetch and refresh selected order and list after a mutation (sync/repair)
    const refreshSelectedOrder = async () => {
        const orderNumber = selectedOrder?.order_number;
        if (!orderNumber) return;
        try {
            const res = await fetch(`/api/admin/orders/${orderNumber}`);
            if (!res.ok) throw new Error('Failed to refresh order');
            const data = await res.json();
            const fresh = data?.data?.order;
            if (fresh) {
                setSelectedOrder(fresh);
                // Update the order in the main list so table reflects latest state
                setOrders(prev => prev.map(o => (o.order_number === fresh.order_number ? { ...o, ...fresh } : o)));
            }
        } catch (e) {
            console.error('Error refreshing order:', e);
        }
    };

    // Reconcile a single order with Midtrans real-time status and refresh
    const handleReconcileStatus = async () => {
        const orderNumber = selectedOrder?.order_number;
        if (!orderNumber || reconcileState.running) return;
        setReconcileState({ running: true, message: '', error: '' });
        try {
            const res = await fetch(`/api/sync/order/${encodeURIComponent(orderNumber)}/status`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || 'Failed to reconcile status');
            }
            await refreshSelectedOrder();
            setReconcileState({ running: false, message: 'Status reconciled with Midtrans.', error: '' });
        } catch (e) {
            setReconcileState({ running: false, message: '', error: e.message || 'Failed to reconcile status' });
        }
    };

    // Admin: Lock sync for the selected order
    const handleLockSync = async () => {
        if (!selectedOrder?.order_number || adminOverride.working) return;
        const confirmText = window.prompt('Type LOCK to confirm locking sync for this order. This prevents Midtrans updates from changing it.');
        if (confirmText !== 'LOCK') return;
        const reason = window.prompt('Reason for locking (optional, max 1000 chars):') || '';
        setAdminOverride({ working: true, message: '', error: '' });
        try {
            const res = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.order_number)}/lock-sync`, {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify({ confirm: 'LOCK', reason })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Failed to lock sync');
            }
            setAdminOverride({ working: false, message: 'Sync locked.', error: '' });
            await refreshSelectedOrder();
        } catch (e) {
            setAdminOverride({ working: false, message: '', error: e.message || 'Failed to lock sync' });
        }
    };

    // Admin: Unlock sync for the selected order
    const handleUnlockSync = async () => {
        if (!selectedOrder?.order_number || adminOverride.working) return;
        const confirmText = window.prompt('Type UNLOCK to confirm re-enabling sync for this order.');
        if (confirmText !== 'UNLOCK') return;
        setAdminOverride({ working: true, message: '', error: '' });
        try {
            const res = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.order_number)}/unlock-sync`, {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify({ confirm: 'UNLOCK' })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Failed to unlock sync');
            }
            setAdminOverride({ working: false, message: 'Sync unlocked.', error: '' });
            await refreshSelectedOrder();
        } catch (e) {
            setAdminOverride({ working: false, message: '', error: e.message || 'Failed to unlock sync' });
        }
    };

    // Admin: Manual update status with lock + confirmations
    const handleManualStatusUpdate = async () => {
        if (!selectedOrder?.order_number || adminOverride.working) return;
        // Choose status
        const status = window.prompt('Enter new status (e.g., settlement, paid, pending, cancel, expire):');
        if (!status) return;
        const s = status.trim();
        const allowed = ['pending','authorize','capture','settlement','deny','cancel','expire','refund','partial_refund','chargeback','partial_chargeback','failure','paid','failed','cancelled'];
        if (!allowed.includes(s)) {
            alert('Invalid status. Allowed: ' + allowed.join(', '));
            return;
        }
        const c1 = window.prompt('Type I_UNDERSTAND to confirm you take responsibility for this manual override.');
        if (c1 !== 'I_UNDERSTAND') return;
        const c2 = window.prompt('Type LOCK_AND_UPDATE to lock sync and update status now.');
        if (c2 !== 'LOCK_AND_UPDATE') return;
        const reason = window.prompt('Reason (optional, max 1000 chars):') || '';
        setAdminOverride({ working: true, message: '', error: '' });
        try {
            const res = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.order_number)}/admin-status`, {
                method: 'PUT',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify({ status: s, confirm1: 'I_UNDERSTAND', confirm2: 'LOCK_AND_UPDATE', reason })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Failed to update status');
            }
            setAdminOverride({ working: false, message: 'Status updated and sync locked.', error: '' });
            await refreshSelectedOrder();
        } catch (e) {
            setAdminOverride({ working: false, message: '', error: e.message || 'Failed to update status' });
        }
    };

    // Resend receipt emails to every successful order (bulk)
    const handleBulkResendReceipts = async () => {
        if (bulkResendState.running) return;
        const confirmAll = window.confirm('Kirim ulang email ke SEMUA pembeli yang sudah bayar? Ini akan mengirim ulang struk ke semua status paid/settlement/capture/manual.');
        if (!confirmAll) return;
        setBulkResendState({ running: true, message: '', error: '', stats: null });
        try {
            const res = await fetch('/api/orders/resend-receipts-all', {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Failed to resend receipts');
            }
            setBulkResendState({
                running: false,
                message: data.message || 'Receipts resent to all paid buyers.',
                error: '',
                stats: data.data || null
            });
        } catch (e) {
            setBulkResendState({
                running: false,
                message: '',
                error: e.message || 'Failed to resend receipts',
                stats: null
            });
        }
    };

    // Resend receipt email for the selected order
    const handleSendReceipt = async () => {
        if (!selectedOrder?.id || resendState.sending) return;
        setResendState({ sending: true, message: '', error: '' });
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}/resend-receipt`, {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) {
                const msg = data?.message || 'Failed to resend receipt';
                throw new Error(msg);
            }
            setResendState({ sending: false, message: data.message || 'Receipt sent successfully.', error: '' });
        } catch (err) {
            setResendState({ sending: false, message: '', error: err.message || 'Failed to resend receipt' });
        }
    };

    // Sync tickets for the selected order (normalize pending -> valid if order is paid/settlement)
    const handleSyncTickets = async () => {
        if (!selectedOrder?.id || syncState.syncing) return;
        setSyncState({ syncing: true, message: '', error: '' });
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}/repair-tickets`, {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) {
                const msg = data?.message || 'Failed to sync tickets';
                throw new Error(msg);
            }
            const updated = data?.data?.updated_count;
            setSyncState({
                syncing: false,
                message: typeof updated === 'number' ? `Synced ${updated} ticket(s).` : (data.message || 'Tickets synced.'),
                error: ''
            });
            // Refresh order details to reflect latest ticket statuses
            await refreshSelectedOrder();
        } catch (err) {
            setSyncState({ syncing: false, message: '', error: err.message || 'Failed to sync tickets' });
        }
    };

    // Delete the selected order (soft delete)
    const handleDeleteOrder = async (order) => {
        if (deleteState.working) return;
        if (!order?.sync_locked) {
            alert('This order is not sync-locked. You can only delete orders that are locked.');
            return;
        }
        const c1 = window.prompt('Type I_UNDERSTAND_DELETE to confirm deletion. This will permanently delete order and tickets.');
        if (c1 !== 'I_UNDERSTAND_DELETE') return;
        const c2 = window.prompt(`Type the exact order number to proceed (Order: ${order.order_number}).`);
        if (c2 !== order.order_number) return;
        try {
            setDeleteState({ working: true, message: '', error: '' });
            let res = await fetch(`/api/orders/${encodeURIComponent(order.order_number)}`, {
                method: 'DELETE',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify({ confirm1: 'I_UNDERSTAND_DELETE', confirm2: order.order_number })
            });
            // If some environments block DELETE, fallback to POST /delete
            if (res.status === 405) {
                res = await fetch(`/api/orders/${encodeURIComponent(order.order_number)}/delete`, {
                    method: 'POST',
                    headers: withCsrf(),
                    credentials: 'same-origin',
                    body: JSON.stringify({ confirm1: 'I_UNDERSTAND_DELETE', confirm2: order.order_number })
                });
            }
            // If throttled, wait briefly and retry once (prefer POST fallback which some proxies allow better)
            if (res.status === 429) {
                await new Promise(r => setTimeout(r, 800));
                res = await fetch(`/api/orders/${encodeURIComponent(order.order_number)}/delete`, {
                    method: 'POST',
                    headers: withCsrf(),
                    credentials: 'same-origin',
                    body: JSON.stringify({ confirm1: 'I_UNDERSTAND_DELETE', confirm2: order.order_number })
                });
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Failed to delete order');
            }
            // Remove from list and close detail if it's the same
            setOrders(prev => prev.filter(o => o.order_number !== order.order_number));
            setFilteredOrders(prev => prev.filter(o => o.order_number !== order.order_number));
            if (selectedOrder?.order_number === order.order_number) setSelectedOrder(null);
            setDeleteState({ working: false, message: 'Order deleted.', error: '' });
        } catch (e) {
            setDeleteState({ working: false, message: '', error: e.message || 'Failed to delete order' });
        }
    };

    // Helper functions for formatting and display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const normalizedStatus = status.toLowerCase() === 'settlement' ? 'paid' : status.toLowerCase();
        const statusMap = {
            'paid': { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-700', label: '✅ Paid' },
            'pending': { bg: 'bg-gradient-to-r from-yellow-100 to-amber-100', text: 'text-amber-700', label: '⏳ Pending' },
            'failed': { bg: 'bg-gradient-to-r from-red-100 to-rose-100', text: 'text-rose-700', label: '❌ Failed' },
            'cancelled': { bg: 'bg-gradient-to-r from-slate-100 to-gray-100', text: 'text-slate-700', label: '🚫 Cancelled' },
            'expire': { bg: 'bg-gradient-to-r from-red-100 to-orange-100', text: 'text-red-700', label: '⌛ Expired' },
            'expired': { bg: 'bg-gradient-to-r from-red-100 to-orange-100', text: 'text-red-700', label: '⌛ Expired' },
        };

        const style = statusMap[normalizedStatus] || { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-700', label: status };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                {style.label}
            </span>
        );
    };

    // Normalize Indonesian phone numbers to wa.me link
    const getWhatsappLink = (rawPhone) => {
        if (!rawPhone) return null;
        let n = String(rawPhone).trim();
        // keep digits and leading + only, drop spaces, dashes, brackets
        n = n.replace(/[^\d+]/g, '');
        if (n.startsWith('+')) n = n.slice(1);
        if (n.startsWith('62')) {
            // already correct
        } else if (n.startsWith('0')) {
            n = '62' + n.slice(1);
        } else {
            // As per assumption, Indonesian numbers come in 62/+62/0, fallback: prefix 62 if missing
            n = '62' + n;
        }
        // final wa.me requires digits only
        n = n.replace(/\D/g, '');
        if (!n || n.length < 8) return null; // basic sanity check
        return `https://wa.me/${n}`;
    };

    // CSV helpers and export
    const csvEscape = (val) => {
        const s = (val ?? '').toString();
        // Escape quotes by doubling them, wrap in quotes
        return `"${s.replace(/"/g, '""')}"`;
    };

    const downloadCsv = (filename, rows) => {
        const bom = '\uFEFF'; // Excel-compatible BOM
        const content = rows.map(r => r.map(csvEscape).join(',')).join('\n');
        const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportOrdersCsv = () => {
        const header = [
            'order_number',
            'order_id',
            'buyer_name',
            'buyer_email',
            'buyer_phone',
            'whatsapp_link',
            'category',
            'subtotal_amount',
            'discount_amount',
            'final_amount',
            'status',
            'payment_status',
            'sync_locked',
            'sync_locked_reason',
            'referral_code',
            'inviter_name',
            'ticket_quantity',
            'ticket_codes',
            'tickets_valid_count',
            'tickets_used_count',
            'created_at',
            'updated_at',
            'source'
        ];
        const rows = filteredOrders.map(o => {
            const tickets = Array.isArray(o?.tickets) ? o.tickets : [];
            const validCount = tickets.filter(t => t.status === 'valid').length;
            const usedCount = tickets.filter(t => t.status === 'used').length;
            const codes = tickets.map(t => t.ticket_code).join(' ');
            const reason = (o?.sync_locked_reason || '').toString().trim();
            const source = reason === 'Manual import (pre-web sale)' ? 'Google Form' : 'Web';
            const rc = o?.referral_code || {};
            return [
                o?.order_number || '',
                o?.id || '',
                o?.buyer_name || '',
                o?.buyer_email || '',
                o?.buyer_phone || '',
                getWhatsappLink(o?.buyer_phone) || '',
                o?.category || '',
                Number(o?.amount ?? 0),
                Number(o?.discount_amount ?? 0),
                Number(o?.final_amount ?? o?.amount ?? 0),
                (o?.status || '').toString(),
                (o?.payment_status || '').toString(),
                o?.sync_locked ? '1' : '0',
                o?.sync_locked_reason || '',
                rc.code || '',
                rc.panitia_name || '',
                o?.ticket_quantity ?? tickets.length,
                codes,
                validCount,
                usedCount,
                o?.created_at || '',
                o?.updated_at || '',
                source
            ];
        });
        downloadCsv(`orders_export_${new Date().toISOString().slice(0,10)}.csv`, [header, ...rows]);
    };

    // XLSX export (Excel)
    const exportOrdersXlsx = async () => {
        const XLSX = await import('xlsx');
        const header = [
            'order_number',
            'order_id',
            'buyer_name',
            'buyer_email',
            'buyer_phone',
            'whatsapp_link',
            'category',
            'subtotal_amount',
            'discount_amount',
            'final_amount',
            'status',
            'payment_status',
            'sync_locked',
            'sync_locked_reason',
            'referral_code',
            'inviter_name',
            'ticket_quantity',
            'ticket_codes',
            'tickets_valid_count',
            'tickets_used_count',
            'created_at',
            'updated_at',
            'source'
        ];
        const rows = filteredOrders.map(o => {
            const tickets = Array.isArray(o?.tickets) ? o.tickets : [];
            const validCount = tickets.filter(t => t.status === 'valid').length;
            const usedCount = tickets.filter(t => t.status === 'used').length;
            const codes = tickets.map(t => t.ticket_code).join(' ');
            const reason = (o?.sync_locked_reason || '').toString().trim();
            const source = reason === 'Manual import (pre-web sale)' ? 'Google Form' : 'Web';
            const rc = o?.referral_code || {};
            return [
                o?.order_number || '',
                o?.id || '',
                o?.buyer_name || '',
                o?.buyer_email || '',
                o?.buyer_phone || '',
                getWhatsappLink(o?.buyer_phone) || '',
                o?.category || '',
                Number(o?.amount ?? 0),
                Number(o?.discount_amount ?? 0),
                Number(o?.final_amount ?? o?.amount ?? 0),
                (o?.status || '').toString(),
                (o?.payment_status || '').toString(),
                o?.sync_locked ? '1' : '0',
                o?.sync_locked_reason || '',
                rc.code || '',
                rc.panitia_name || '',
                o?.ticket_quantity ?? tickets.length,
                codes,
                validCount,
                usedCount,
                o?.created_at || '',
                o?.updated_at || '',
                source
            ];
        });
        const aoa = [header, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        XLSX.writeFile(wb, `orders_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const openManualForm = () => { 
        setManualFormOpen(true); 
        setManualState({ working: false, message: '', error: '' });
        setManualForm({
            buyer_name: '',
            buyer_email: '',
            buyer_phone: '',
            category: 'internal',
            ticket_quantity: 1,
            final_amount: 0,
            referral_code: ''
        });
        setManualConfirm({ ack: false, text: '' });
    };
    const closeManualForm = () => { 
        setManualFormOpen(false);
        setManualState({ working: false, message: '', error: '' });
        setManualConfirm({ ack: false, text: '' });
    };

    const submitManualForm = async () => {
        if (manualState.working) return;
        
        // Reset previous messages
        setManualState({ working: false, message: '', error: '' });
        
        if (!manualConfirm.ack || manualConfirm.text !== 'CREATE') {
            setManualState({ working: false, message: '', error: 'Please acknowledge and type CREATE to proceed.' });
            return;
        }
        
        // Basic validation
        if (!manualForm.buyer_name || !manualForm.buyer_email || !manualForm.buyer_phone || !manualForm.category || !manualForm.ticket_quantity || manualForm.final_amount === null) {
            setManualState({ working: false, message: '', error: 'Please fill all required fields.' });
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(manualForm.buyer_email)) {
            setManualState({ working: false, message: '', error: 'Please enter a valid email address.' });
            return;
        }
        
        // Phone validation (basic - at least 10 digits)
        const phoneDigits = manualForm.buyer_phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setManualState({ working: false, message: '', error: 'Phone number must be at least 10 digits.' });
            return;
        }
        
        setManualState({ working: true, message: '', error: '' });
        
        try {
            const res = await fetch('/api/admin/orders/manual', {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify(manualForm)
            });
            
            const data = await res.json().catch(() => ({}));
            
            if (!res.ok || !data.success) {
                // Handle specific validation errors
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    throw new Error(errorMessage || data?.message || 'Failed to create manual order');
                }
                throw new Error(data?.message || 'Failed to create manual order');
            }
            
            const created = data?.data?.order;
            if (created?.order_number) {
                setOrders(prev => [created, ...prev]);
                setFilteredOrders(prev => [created, ...prev]);
                setSelectedOrder(created);
            }
            
            setManualState({ working: false, message: 'Manual order created successfully as paid (sync locked).', error: '' });
            
            // Reset form
            setManualForm({
                buyer_name: '',
                buyer_email: '',
                buyer_phone: '',
                category: 'internal',
                ticket_quantity: 1,
                final_amount: 0,
                referral_code: ''
            });
            setManualConfirm({ ack: false, text: '' });
            
            // Close modal after 2 seconds
            setTimeout(() => {
                setManualFormOpen(false);
                setManualState({ working: false, message: '', error: '' });
            }, 2000);
            
        } catch (e) {
            setManualState({ working: false, message: '', error: e.message || 'Failed to create manual order' });
        }
    };

    return (
        <AdminLayout title="Orders Management" subtitle="View and manage all ticket orders">
            <div className="space-y-6 p-6">
                {/* Actions Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-stretch gap-4">
                        <div className={`${metricCardClass} min-w-[180px]`}>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Orders Loaded</span>
                            <span className="text-xl font-bold text-slate-800 leading-none">{filteredOrders.length}</span>
                            <span className="text-xs text-slate-400">of {orders.length} total</span>
                        </div>
                        <div className={`${metricCardClass} min-w-[180px]`}>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Web Total</span>
                            <span className="text-xl font-bold text-slate-800 leading-none">{formatCurrencyShort(webTotal)}</span>
                            <span className="text-xs text-slate-400">All orders excluding Google Form & OTS</span>
                        </div>
                        <div className={`${metricCardClass} min-w-[180px]`}>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Google Form Total</span>
                            <span className="text-xl font-bold text-slate-800 leading-none">{formatCurrencyShort(googleFormTotal)}</span>
                            <span className="text-xs text-slate-400">Manual import (pre-web sale)</span>
                        </div>
                        <div className={`${metricCardClass} min-w-[180px]`}>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">OTS Total</span>
                            <span className="text-xl font-bold text-slate-800 leading-none">{formatCurrencyShort(otsTotal)}</span>
                            <span className="text-xs text-slate-400">Onsite sales (gatekeeper list)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkResendReceipts}
                            disabled={bulkResendState.running}
                            className={`px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-red-500 hover:shadow-lg transition-all ${bulkResendState.running ? 'opacity-70 cursor-not-allowed' : ''}`}
                            title="Kirim ulang email ke semua pembeli yang sudah bayar"
                        >
                            {bulkResendState.running ? 'Sending all…' : 'Resend ALL Receipts'}
                        </button>
                        <button
                            onClick={exportOrdersCsv}
                            className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-lg transition-all"
                            title="Export current filtered orders to CSV (Excel-compatible)"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={exportOrdersXlsx}
                            className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-500 hover:shadow-lg transition-all"
                            title="Export current filtered orders to Excel (.xlsx)"
                        >
                            Export XLSX
                        </button>
                        <button onClick={openManualForm} className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:shadow-lg transition-all">Add Manual Order</button>
                    </div>
                </div>

                {(bulkResendState.message || bulkResendState.error) && (
                    <div className={`rounded-xl border p-4 ${bulkResendState.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {bulkResendState.error ? 'Bulk resend failed' : 'Bulk resend finished'}
                                </p>
                                <p className="text-sm text-slate-700">
                                    {bulkResendState.error || bulkResendState.message}
                                </p>
                                {bulkResendState.stats && (
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-slate-700">
                                        <span>Eligible: {bulkResendState.stats.eligible ?? 0}</span>
                                        <span>Processed: {bulkResendState.stats.processed ?? 0}</span>
                                        <span>Sent: {bulkResendState.stats.sent ?? 0}</span>
                                        <span>Tickets fixed: {bulkResendState.stats.tickets_normalized ?? 0}</span>
                                        <span>Skipped (no email): {bulkResendState.stats.skipped_missing_email ?? 0}</span>
                                        <span>Skipped (wrong status): {bulkResendState.stats.skipped_wrong_status ?? 0}</span>
                                        <span>Skipped (OTS/no email blast): {bulkResendState.stats.skipped_ots_reason ?? 0}</span>
                                        <span>Failed: {bulkResendState.stats.failed ?? 0}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setBulkResendState({ running: false, message: '', error: '', stats: null })}
                                className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Enhanced Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Enhanced Search */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Search Orders
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 text-lg">🔍</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or order ID..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Enhanced Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Payment Status
                            </label>
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                            >
                                <option value="">All Statuses</option>
                                <option value="settlement">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="expire">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Source</label>
                            <select
                                value={syncSource}
                                onChange={(e) => { setSyncSource(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                            >
                                <option value="">All Sources</option>
                                <option value="google_form">Google Form</option>
                                <option value="ots">Onsite (OTS)</option>
                                <option value="web">Web</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Month</label>
                            <select
                                value={monthFilter}
                                onChange={(e) => { setMonthFilter(e.target.value); setTablePage(1); }}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                            >
                                <option value="">All Months</option>
                                <option value="1">Jan</option>
                                <option value="2">Feb</option>
                                <option value="3">Mar</option>
                                <option value="4">Apr</option>
                                <option value="5">May</option>
                                <option value="6">Jun</option>
                                <option value="7">Jul</option>
                                <option value="8">Aug</option>
                                <option value="9">Sep</option>
                                <option value="10">Oct</option>
                                <option value="11">Nov</option>
                                <option value="12">Dec</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Day</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={dayFilter}
                                onChange={(e) => { setDayFilter(e.target.value); setTablePage(1); }}
                                placeholder="All Days"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Enhanced Orders Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-blue-50 sticky top-0 z-10">
                                <tr>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'order_number' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('order_number')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Order Number</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('order_number')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'customer' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('customer')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Customer Info</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('customer')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('amount')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Amount</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('amount')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'tickets' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('tickets')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Tickets</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('tickets')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('status')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Status</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('status')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'sync_state' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('sync_state')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Sync State</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('sync_state')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'inviter' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('inviter')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Inviter</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('inviter')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('created_at')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Date</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('created_at')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'whatsapp' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('whatsapp')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>WhatsApp</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('whatsapp')}</span>
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Check Midtrans
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'actions' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('actions')}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Actions</span>
                                            <span className="text-[10px] text-slate-500">{getSortIcon('actions')}</span>
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <div className="w-4 h-4 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-4 h-4 bg-[#FFC22F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-4 h-4 bg-[#004E89] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                            <p className="mt-2 text-slate-500">Loading orders...</p>
                                        </td>
                                    </tr>
                                ) : paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] bg-clip-text text-transparent">{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {order.buyer_name}
                                                </div>
                                                <div className="text-sm text-slate-500 font-medium">
                                                    {order.buyer_email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{formatCurrency(order.final_amount || order.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{order.ticket_quantity} ticket{order.ticket_quantity > 1 ? 's' : ''}</span>
                                                {order.tickets && order.tickets.length > 0 && (
                                                    <span className="text-xs text-slate-500 mt-1">
                                                        {order.tickets.filter(t => t.status === 'valid').length} valid,
                                                        {order.tickets.filter(t => t.status === 'used').length} used
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.payment_status || order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.sync_locked ? (
                                                <span title={order.sync_locked_reason || ''} className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">🔒 Locked</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">🔓 Unlocked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.referral_code ? order.referral_code.panitia_name : 'None'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {(() => {
                                                const link = getWhatsappLink(order.buyer_phone);
                                                return (
                                                    <a
                                                        href={link || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-bold ${link ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-md hover:opacity-95' : 'bg-slate-300 cursor-not-allowed opacity-60'} transition`}
                                                        title={link ? `Chat ${order.buyer_name || ''} on WhatsApp` : 'Invalid phone number'}
                                                        onClick={(e) => { if (!link) e.preventDefault(); }}
                                                    >
                                                        <span>WhatsApp</span>
                                                    </a>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <a
                                                href={`https://dashboard.midtrans.com/beta/transactions?type=customer_email&query=${encodeURIComponent(order.buyer_email)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-500 hover:shadow-md hover:opacity-95 transition"
                                                title={`Check ${order.buyer_email} in Midtrans`}
                                            >
                                                <span>🔍 Midtrans</span>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                              <button onClick={() => handleViewDetails(order.order_number || order.id)} className="bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">View Details</button>
                                              <button
                                                onClick={() => handleDeleteOrder(order)}
                                                disabled={!order.sync_locked || deleteState.working}
                                                title={!order.sync_locked ? 'Only locked orders can be deleted' : 'Delete order (strict confirmations)'}
                                                className={`px-3 py-2 rounded-lg font-semibold text-white ${!order.sync_locked || deleteState.working ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                              >
                                                Delete
                                              </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white/70">
                        <div className="text-sm text-slate-600">
                            Showing {(filteredOrders.length === 0) ? 0 : ((currentTablePage - 1) * pageSize + 1)}–
                            {Math.min(currentTablePage * pageSize, filteredOrders.length)} of {filteredOrders.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-3 py-1.5 rounded-lg border text-sm ${currentTablePage <= 1 ? 'text-slate-400 border-slate-200 cursor-not-allowed' : 'text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                disabled={currentTablePage <= 1}
                                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>
                            <span className="text-sm text-slate-600">Page {currentTablePage} of {totalPages}</span>
                            <button
                                className={`px-3 py-1.5 rounded-lg border text-sm ${currentTablePage >= totalPages ? 'text-slate-400 border-slate-200 cursor-not-allowed' : 'text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                disabled={currentTablePage >= totalPages}
                                onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No orders found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] via-[#FFC22F] to-[#004E89] rounded-t-2xl opacity-10"></div>
                            <div className="relative px-8 py-6 border-b border-slate-200/50 flex justify-between items-center">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#004E89] bg-clip-text text-transparent">
                                    Order Details #{selectedOrder?.id}
                                </h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-8 h-8 bg-slate-100 hover:bg-red-100 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 transition-all duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="px-8 py-6 space-y-8">
                            {/* Enhanced Customer Info */}
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <span className="text-lg mr-2">👤</span>
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <span className="font-semibold text-slate-600">Name:</span>
                                        <p className="text-slate-800 font-medium mt-1">{selectedOrder?.buyer_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Email:</span>
                                        {!emailEdit.editing ? (
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-slate-800 font-medium">{selectedOrder?.buyer_email}</p>
                                                <button
                                                    onClick={() => setEmailEdit({ editing: true, draft: selectedOrder?.buyer_email || '', saving: false, message: '', error: '' })}
                                                    className="text-[#004E89] hover:text-[#003966] text-sm font-semibold"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:items-center">
                                                <input
                                                    type="email"
                                                    value={emailEdit.draft}
                                                    onChange={(e) => setEmailEdit(prev => ({ ...prev, draft: e.target.value }))}
                                                    className="w-full sm:w-72 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC22F] focus:border-transparent"
                                                    placeholder="Enter new buyer email"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            if (!selectedOrder?.id || emailEdit.saving) return;
                                                            setEmailEdit(prev => ({ ...prev, saving: true, message: '', error: '' }));
                                                            try {
                                                                const res = await fetch(`/api/orders/${selectedOrder.id}/email`, {
                                                                    method: 'PUT',
                                                                    headers: withCsrf(),
                                                                    credentials: 'same-origin',
                                                                    body: JSON.stringify({ buyer_email: emailEdit.draft })
                                                                });
                                                                const data = await res.json().catch(() => ({}));
                                                                if (!res.ok || !data.success) {
                                                                    const msg = data?.message || 'Failed to update email';
                                                                    throw new Error(msg);
                                                                }
                                                                const fresh = data?.data?.order;
                                                                if (fresh) {
                                                                    setSelectedOrder(fresh);
                                                                    setOrders(prev => prev.map(o => (o.id === fresh.id ? { ...o, ...fresh } : o)));
                                                                }
                                                                setEmailEdit({ editing: false, draft: '', saving: false, message: 'Email updated.', error: '' });
                                                            } catch (e) {
                                                                setEmailEdit(prev => ({ ...prev, saving: false, error: e.message || 'Failed to update email' }));
                                                            }
                                                        }}
                                                        className={`px-4 py-2 bg-[#004E89] text-white rounded-md text-sm font-semibold ${emailEdit.saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#003966]'}`}
                                                        disabled={emailEdit.saving}
                                                    >
                                                        {emailEdit.saving ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEmailEdit({ editing: false, draft: '', saving: false, message: '', error: '' })}
                                                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {(emailEdit.message || emailEdit.error) && (
                                            <p className={`mt-1 text-sm ${emailEdit.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                {emailEdit.error || emailEdit.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Phone:</span>
                                        <p className="text-slate-800 font-medium mt-1">{selectedOrder?.buyer_phone}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Category:</span>
                                        <p className="text-slate-800 font-medium mt-1 capitalize">{selectedOrder?.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Order Info */}
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200/50">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <span className="text-lg mr-2">📋</span>
                                    Order Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    {selectedOrder?.discount_amount > 0 ? (
                                        <>
                                            <div>
                                                <span className="font-semibold text-slate-600">Subtotal:</span>
                                                <p className="text-slate-800 font-medium text-lg mt-1">{formatCurrency(selectedOrder?.amount || 0)}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-600">Discount Applied:</span>
                                                <p className="text-green-600 font-bold text-lg mt-1">-{formatCurrency(selectedOrder?.discount_amount || 0)}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-600">Final Amount:</span>
                                                <p className="text-slate-800 font-bold text-xl mt-1">{formatCurrency(selectedOrder?.final_amount || 0)}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <span className="font-semibold text-slate-600">Total Amount:</span>
                                            <p className="text-slate-800 font-bold text-lg mt-1">{formatCurrency(selectedOrder?.final_amount || selectedOrder?.amount || 0)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold text-slate-600">Ticket Quantity:</span>
                                        <p className="text-slate-800 font-medium mt-1">{selectedOrder?.ticket_quantity}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Payment Status:</span>
                                        <div className="mt-2">{selectedOrder?.status ? getStatusBadge(selectedOrder.status) : ''}</div>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Sync State:</span>
                                        <div className="mt-2 flex items-center gap-2">
                                            {selectedOrder?.sync_locked ? (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700">🔒 Locked</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700">🔓 Unlocked</span>
                                            )}
                                        </div>
                                        {selectedOrder?.sync_locked_reason && (
                                            <p className="text-xs text-slate-600 mt-1">Reason: {selectedOrder.sync_locked_reason}</p>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600">Referral Code:</span>
                                        <p className="text-slate-800 font-medium mt-1">
                                            {selectedOrder?.referral_code ? (
                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                    {selectedOrder.referral_code.code} ({selectedOrder.referral_code.panitia_name})
                                                </span>
                                            ) : 'None'}
                                        </p>
                                    </div>
                                    {selectedOrder?.discount_code && (
                                        <div>
                                            <span className="font-semibold text-slate-600">Discount Code:</span>
                                            <p className="text-slate-800 font-medium mt-1">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                    {selectedOrder.discount_code.code} ({selectedOrder.discount_code.discount_percentage}% off)
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Tickets */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <span className="text-lg mr-2">🎫</span>
                                    Tickets
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder?.tickets?.map((ticket, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-slate-200/50">
                                            <span className="font-mono text-sm font-bold text-slate-800">{ticket.ticket_code}</span>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                ticket.status === 'valid' 
                                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                                                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                                            }`}>
                                                {
  ticket.status === 'valid'
    ? '✅ Valid'
    : ticket.status === 'pending'
    ? '⏳ Pending'
    : ticket.status === 'used'
    ? '🎯 Used'
    : '❔ Unknown'
}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 py-4 md:py-6 border-t border-slate-200/50 bg-slate-50/50">
                            {(adminOverride.message || adminOverride.error) && (
                                <div className={`mb-3 text-sm font-medium ${adminOverride.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {adminOverride.error || adminOverride.message}
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <button
                                    onClick={handleSyncTickets}
                                    disabled={syncState.syncing}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${syncState.syncing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {syncState.syncing ? 'Syncing…' : 'Sync Tickets'}
                                </button>
                                <button
                                    onClick={handleReconcileStatus}
                                    disabled={reconcileState.running}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${reconcileState.running ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    title="Get real-time status from Midtrans and update order"
                                >
                                    {reconcileState.running ? 'Reconciling…' : 'Reconcile Status'}
                                </button>
                                <button
                                    onClick={handleSendReceipt}
                                    disabled={resendState.sending}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${resendState.sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {resendState.sending ? 'Sending…' : 'Send Receipt'}
                                </button>
                                <button
                                    onClick={handleLockSync}
                                    disabled={adminOverride.working || selectedOrder?.sync_locked}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${adminOverride.working || selectedOrder?.sync_locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    title="Lock sync to prevent Midtrans overrides"
                                >
                                    Lock Sync
                                </button>
                                <button
                                    onClick={handleUnlockSync}
                                    disabled={adminOverride.working || !selectedOrder?.sync_locked}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-slate-500 to-gray-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${adminOverride.working || !selectedOrder?.sync_locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    title="Unlock sync to allow Midtrans updates"
                                >
                                    Unlock Sync
                                </button>
                                <button
                                    onClick={handleManualStatusUpdate}
                                    disabled={adminOverride.working}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${adminOverride.working ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    title="Manually update status (will lock sync)"
                                >
                                    Manual Update Status
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder)}
                                    disabled={deleteState.working}
                                    className={`w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${deleteState.working ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    title="Delete this order (sync-locked orders only)"
                                >
                                    {deleteState.working ? 'Deleting…' : 'Delete Order'}
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-full px-4 py-3 text-slate-700 bg-white hover:bg-slate-100 rounded-xl font-semibold border border-slate-200 transition-all duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Order Form Modal */}
            {manualFormOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && closeManualForm()}>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/20">
                        <div className="px-6 py-4 border-b border-slate-200/60 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Add Manual Order</h3>
                                <p className="text-xs text-slate-500 mt-1">Create an offline/manual order as PAID and SYNC-LOCKED</p>
                            </div>
                            <button 
                                onClick={closeManualForm} 
                                className="w-8 h-8 bg-slate-100 hover:bg-red-100 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {manualState.error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="flex items-start gap-2">
                                        <span className="text-red-600 text-lg">⚠️</span>
                                        <div>
                                            <p className="text-sm font-semibold text-red-800">Error</p>
                                            <p className="text-sm text-red-600">{manualState.error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {manualState.message && (
                                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                    <div className="flex items-start gap-2">
                                        <span className="text-emerald-600 text-lg">✓</span>
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800">Success</p>
                                            <p className="text-sm text-emerald-600">{manualState.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Buyer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                        value={manualForm.buyer_name ?? ''} 
                                        onChange={e=>setManualForm({...manualForm, buyer_name:e.target.value})}
                                        placeholder="Enter buyer's full name"
                                        disabled={manualState.working}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Buyer Email <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                        value={manualForm.buyer_email ?? ''} 
                                        onChange={e=>setManualForm({...manualForm, buyer_email:e.target.value})}
                                        placeholder="buyer@example.com"
                                        disabled={manualState.working}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Buyer Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                        value={manualForm.buyer_phone ?? ''} 
                                        onChange={e=>setManualForm({...manualForm, buyer_phone:e.target.value})}
                                        placeholder="+62812XXXXXXXX"
                                        disabled={manualState.working}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                        value={manualForm.category ?? 'internal'} 
                                        onChange={e=>setManualForm({...manualForm, category:e.target.value})}
                                        disabled={manualState.working}
                                    >
                                        <option value="internal">Internal</option>
                                        <option value="external">External</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Ticket Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={Number.isFinite(manualForm.ticket_quantity) ? manualForm.ticket_quantity : ''}
                                        onChange={e => {
                                            const v = e.target.value;
                                            const n = parseInt(v, 10);
                                            const safe = Number.isFinite(n) && n >= 1 ? n : 1;
                                            setManualForm({ ...manualForm, ticket_quantity: safe });
                                        }}
                                        disabled={manualState.working}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Final Amount (IDR) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={Number.isFinite(manualForm.final_amount) ? manualForm.final_amount : ''}
                                        onChange={e => {
                                            const v = e.target.value;
                                            const n = parseInt(v, 10);
                                            const safe = Number.isFinite(n) && n >= 0 ? n : 0;
                                            setManualForm({ ...manualForm, final_amount: safe });
                                        }}
                                        placeholder="0"
                                        disabled={manualState.working}
                                    />
                                    {manualForm.final_amount > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatCurrencyShort(manualForm.final_amount)}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Referral Code (optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                        value={manualForm.referral_code ?? ''} 
                                        onChange={e=>setManualForm({...manualForm, referral_code:e.target.value})}
                                        placeholder="Enter referral code if any"
                                        disabled={manualState.working}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                                <label className="flex items-start gap-2 text-sm text-amber-800 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="mt-1" 
                                        checked={manualConfirm.ack} 
                                        onChange={(e)=>setManualConfirm(prev=>({...prev, ack:e.target.checked}))}
                                        disabled={manualState.working}
                                    />
                                    <span className="font-medium">
                                        I confirm this is an offline sale and should be created as <strong>PAID</strong> and <strong>SYNC-LOCKED</strong>. I take full responsibility for this action.
                                    </span>
                                </label>
                                <div className="mt-3">
                                    <label className="block text-xs font-semibold text-amber-800 mb-1">
                                        Type <strong>CREATE</strong> to enable the submit button
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono" 
                                        value={manualConfirm.text} 
                                        onChange={(e)=>setManualConfirm(prev=>({...prev, text:e.target.value}))} 
                                        placeholder="Type CREATE"
                                        disabled={manualState.working}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-slate-200/60 flex justify-end gap-3 bg-slate-50/60">
                            <button 
                                onClick={closeManualForm} 
                                className="px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                                disabled={manualState.working}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitManualForm} 
                                disabled={manualState.working || !manualConfirm.ack || manualConfirm.text !== 'CREATE'} 
                                className={`px-6 py-2 text-white rounded-md font-semibold transition-all ${
                                    (manualState.working || !manualConfirm.ack || manualConfirm.text !== 'CREATE')
                                        ? 'bg-slate-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                                }`}
                            >
                                {manualState.working ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Manual Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
