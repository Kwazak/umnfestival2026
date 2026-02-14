import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function AdminTickets() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCode, setShowCode] = useState({}); // { [ticketId]: true/false }
    const [resetState, setResetState] = useState({ running: false, message: '', error: '' });
    const frameKeys = ['frame_before_1500ms', 'frame_before_700ms', 'frame_after_700ms', 'frame_after_1500ms'];

    // Client-side pagination
    const [tablePage, setTablePage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'order_id', direction: 'desc' });
    const pageSize = 30;

    const filteredTickets = useMemo(() => {
        if (!Array.isArray(tickets)) return [];

        const normalizedSearch = searchTerm.trim().toLowerCase();

        return tickets.filter(ticket => {
            const ticketCode = (ticket?.ticket_code ?? '').toString().toLowerCase();
            const orderId = (ticket?.order_id ?? '').toString();
            const orderNumber = (ticket?.order?.order_number ?? '').toString().toLowerCase();
            const buyerName = (ticket?.order?.buyer_name ?? '').toString().toLowerCase();
            const buyerEmail = (ticket?.order?.buyer_email ?? '').toString().toLowerCase();
            const buyerPhone = (ticket?.order?.buyer_phone ?? '').toString().toLowerCase();
            const status = (ticket?.status ?? '').toString().toLowerCase();
            const scannedBy = (ticket?.scanned_by ?? '').toString().toLowerCase();

            const matchesSearch = normalizedSearch.length === 0 || [
                ticketCode,
                orderId.toLowerCase(),
                orderNumber,
                buyerName,
                buyerEmail,
                buyerPhone,
                status,
                scannedBy,
            ].some(value => value.includes(normalizedSearch));

            const matchesStatus = statusFilter === 'all' ? true : status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchTerm, statusFilter]);

    const ticketSortAccessors = useMemo(() => ({
        ticket_code: (t) => (t?.ticket_code ?? '').toString().toLowerCase(),
        status: (t) => (t?.status ?? '').toString().toLowerCase(),
        name: (t) => (t?.order?.buyer_name ?? '').toString().toLowerCase(),
        checked_in_at: (t) => {
            const value = t?.checked_in_at;
            const time = value ? new Date(value).getTime() : 0;
            return Number.isFinite(time) ? time : 0;
        },
        scanned_by: (t) => (t?.scanned_by ?? '').toString().toLowerCase(),
        actions: (t) => (t?.ticket_code ?? '').toString().toLowerCase(),
        email: (t) => (t?.order?.buyer_email ?? '').toString().toLowerCase(),
        order_id: (t) => Number(t?.order_id ?? 0) || 0,
    }), []);

    const renderFramesCell = (ticket) => {
        const frames = frameKeys
            .map(key => ticket?.[key])
            .filter(Boolean);

        if (!frames.length) {
            return <span className="text-gray-400">-</span>;
        }

        return (
            <div className="flex gap-1 flex-wrap">
                {frames.map((src, idx) => (
                    <a
                        key={`${ticket.id}-frame-${idx}`}
                        href={`/${src}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 rounded overflow-hidden"
                        title={frameKeys[idx] || `Frame ${idx + 1}`}
                    >
                        <img
                            src={`/${src}`}
                            alt={`Frame ${idx + 1}`}
                            className="w-12 h-12 object-cover"
                            loading="lazy"
                        />
                    </a>
                ))}
            </div>
        );
    };

    const sortedTickets = useMemo(() => {
        const { key, direction } = sortConfig;
        if (!key || !ticketSortAccessors[key]) return filteredTickets;
        const sorted = [...filteredTickets].sort((a, b) => {
            const valueA = ticketSortAccessors[key](a);
            const valueB = ticketSortAccessors[key](b);
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
    }, [filteredTickets, sortConfig, ticketSortAccessors]);

    useEffect(() => {
        setLoading(true);
    // Request large page size (up to 10,000)
    fetch('/api/tickets?per_page=10000', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.tickets) {
                    // Filter out pending tickets - only show valid, used, cancelled, expired
                    const validTickets = data.data.tickets.filter(ticket => 
                        ticket.status !== 'pending'
                    );
                    setTickets(validTickets);
                } else {
                    setTickets([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setTickets([]);
                setLoading(false);
            });
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not checked in';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            // Fallback: prefix 62
            n = '62' + n;
        }
        // final wa.me requires digits only
        n = n.replace(/\D/g, '');
        if (!n || n.length < 8) return null; // basic sanity check
        return `https://wa.me/${n}`;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            valid: 'bg-green-100 text-green-800',
            used: 'bg-blue-100 text-blue-800',
            expired: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };

        const statusIcons = {
            valid: '✓',
            used: '🎫',
            expired: '❌',
            cancelled: '⚫'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || statusConfig.valid}`}>
                <span className="mr-1">{statusIcons[status]}</span>
                {status.toUpperCase()}
            </span>
        );
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '⇅';
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const handleSort = (columnKey) => {
        setSortConfig(prev => {
            if (prev.key === columnKey) {
                return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key: columnKey, direction: 'asc' };
        });
        setTablePage(1);
    };

    // CSV helpers and export (Excel compatible)
    const csvEscape = (val) => {
        const s = (val ?? '').toString();
        return `"${s.replace(/"/g, '""')}"`;
    };

    const downloadCsv = (filename, rows) => {
        const bom = '\uFEFF';
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

    const exportTicketsCsv = () => {
        const header = [
            'ticket_code',
            'status',
            'checked_in_at',
            'scanned_by',
            'order_id',
            'order_number',
            'buyer_name',
            'buyer_email',
            'buyer_phone',
            'whatsapp_link',
            'category',
            'referral_code',
            'inviter_name',
            'order_status',
            'order_created_at'
        ];
        const rows = filteredTickets.map(t => {
            const o = t.order || {};
            const rc = o.referral_code || o.referralCode || {};
            return [
                t.ticket_code || '',
                t.status || '',
                t.checked_in_at || '',
                t.scanned_by || '-',
                t.order_id || '',
                o.order_number || '',
                o.buyer_name || '',
                o.buyer_email || '',
                o.buyer_phone || '',
                getWhatsappLink(o.buyer_phone) || '',
                o.category || '',
                rc.code || '',
                rc.panitia_name || '',
                o.status || '',
                o.created_at || ''
            ];
        });
        downloadCsv(`tickets_export_${new Date().toISOString().slice(0,10)}.csv`, [header, ...rows]);
    };


    // XLSX export (Excel)
    const exportTicketsXlsx = async () => {
        const XLSX = await import('xlsx');
        const header = [
            'ticket_code',
            'status',
            'checked_in_at',
            'scanned_by',
            'order_id',
            'order_number',
            'buyer_name',
            'buyer_email',
            'buyer_phone',
            'whatsapp_link',
            'category',
            'referral_code',
            'inviter_name',
            'order_status',
            'order_created_at'
        ];
        const rows = filteredTickets.map(t => {
            const o = t.order || {};
            const rc = o.referral_code || o.referralCode || {};
            return [
                t.ticket_code || '',
                t.status || '',
                t.checked_in_at || '',
                t.scanned_by || '-',
                t.order_id || '',
                o.order_number || '',
                o.buyer_name || '',
                o.buyer_email || '',
                o.buyer_phone || '',
                getWhatsappLink(o.buyer_phone) || '',
                o.category || '',
                rc.code || '',
                rc.panitia_name || '',
                o.status || '',
                o.created_at || ''
            ];
        });
        const aoa = [header, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
        XLSX.writeFile(wb, `tickets_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    // Table pagination derived values
    const totalPages = Math.max(1, Math.ceil(sortedTickets.length / pageSize));
    const currentTablePage = Math.min(tablePage, totalPages);
    const paginatedTickets = sortedTickets.slice((currentTablePage - 1) * pageSize, currentTablePage * pageSize);

    // Reset to first page when filter/data changes
    useEffect(() => { setTablePage(1); }, [searchTerm, statusFilter, tickets]);

    const stats = {
        total: tickets.length,
        valid: tickets.filter(t => t.status === 'valid').length,
        used: tickets.filter(t => t.status === 'used').length,
        checkInRate: tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'used').length / tickets.length) * 100) : 0
    };

    return (
        <AdminLayout title="Tickets Management" subtitle="Monitor and manage individual tickets">
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tickets Management</h2>
                        <p className="text-gray-600">Track individual tickets and check-in status (excluding pending tickets)</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        {resetState.message && (
                            <span className="text-sm text-emerald-700 font-medium">{resetState.message}</span>
                        )}
                        {resetState.error && (
                            <span className="text-sm text-rose-600 font-medium">{resetState.error}</span>
                        )}
                        <button
                            onClick={async () => {
                                if (resetState.running) return;
                                const secret = prompt('Konfirmasi dengan memasukkan kode rahasia untuk RESET SEMUA tiket ke VALID dan kosongkan check-in.');
                                if (secret === null) return; // cancelled
                                if (secret !== 'JANGANLAKUKANINIDIHARIH') {
                                    setResetState({ running: false, message: '', error: 'Kode rahasia salah.' });
                                    return;
                                }
                                setResetState({ running: true, message: '', error: '' });
                                try {
                                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                                    const res = await fetch('/api/tickets/reset-all', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                            'X-Requested-With': 'XMLHttpRequest',
                                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                                        },
                                        credentials: 'same-origin',
                                        body: JSON.stringify({ secret })
                                    });
                                    const data = await res.json().catch(() => ({}));
                                    if (!res.ok || !data.success) {
                                        throw new Error(data?.message || 'Gagal reset tiket');
                                    }
                                    // Refetch tickets after reset
                                    try {
                                        setLoading(true);
                                        const listRes = await fetch('/api/tickets?per_page=10000', {
                                            method: 'GET',
                                            headers: {
                                                'Accept': 'application/json',
                                                'X-Requested-With': 'XMLHttpRequest',
                                            },
                                            credentials: 'same-origin',
                                        });
                                        const listData = await listRes.json().catch(() => ({}));
                                        if (listData?.success && listData?.data?.tickets) {
                                            const validTickets = listData.data.tickets.filter(t => t.status !== 'pending');
                                            setTickets(validTickets);
                                        } else {
                                            setTickets([]);
                                        }
                                    } finally {
                                        setLoading(false);
                                    }
                                    setResetState({ running: false, message: `Berhasil reset ${data?.data?.affected ?? 0} tiket.`, error: '' });
                                } catch (e) {
                                    setResetState({ running: false, message: '', error: e.message || 'Gagal reset tiket' });
                                }
                            }}
                            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${resetState.running ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
                            title="Reset semua tiket ke VALID dan kosongkan check-in (butuh kode rahasia)"
                            disabled={resetState.running}
                        >
                            {resetState.running ? 'Resetting…' : 'Reset Semua Ticket → Valid'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <span className="text-blue-600">🎫</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Active Tickets</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-400">Excludes pending</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                    <span className="text-green-600">✓</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Valid Tickets</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.valid}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                    <span className="text-purple-600">🎯</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Used Tickets</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.used}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                                    <span className="text-orange-600">📊</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Check-in Rate</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.checkInRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Tickets
                        </label>
                        <input
                            type="text"
                            placeholder="Search by ticket code or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC22F] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC22F] focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="valid">Valid</option>
                            <option value="used">Used</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-sm text-gray-500">
                            Showing {filteredTickets.length} of {tickets.length} active tickets
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportTicketsCsv}
                                className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-emerald-600 hover:bg-emerald-700"
                                title="Export current filtered tickets to CSV (Excel-compatible)"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={exportTicketsXlsx}
                                className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-teal-600 hover:bg-teal-700"
                                title="Export current filtered tickets to Excel (.xlsx)"
                            >
                                Export XLSX
                            </button>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'ticket_code' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('ticket_code')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Ticket Code</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('ticket_code')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('status')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Status</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('status')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('name')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Name</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('name')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'checked_in_at' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('checked_in_at')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Check-in Time</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('checked_in_at')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'scanned_by' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('scanned_by')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Scanned By</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('scanned_by')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Frames
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'actions' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('actions')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Actions</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('actions')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('email')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Email</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('email')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'order_id' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('order_id')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Order ID</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('order_id')}</span>
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-gray-500">Loading tickets...</td>
                                    </tr>
                                ) : paginatedTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {showCode[ticket.id] ? ticket.ticket_code : '••••••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setShowCode(prev => ({ ...prev, [ticket.id]: !prev[ticket.id] }))}
                                                className="ml-2 text-xs text-blue-500 underline focus:outline-none"
                                            >
                                                {showCode[ticket.id] ? 'Hide' : 'Show'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ticket.order?.buyer_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(ticket.checked_in_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {ticket.scanned_by ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    👤 {ticket.scanned_by}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderFramesCell(ticket)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                className={`px-3 py-1 rounded text-white text-xs font-semibold ${ticket.status === 'pending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
                                                disabled={ticket.status === 'pending'}
                                                title="Reset ticket ini ke VALID dan kosongkan check-in"
                                                onClick={async () => {
                                                    if (ticket.status === 'pending') return;
                                                    // Step 1: show confirmation with ticket info
                                                    const confirm1 = confirm(`Yakin reset ticket ${ticket.ticket_code}?\n\nAksi ini akan mengubah status menjadi VALID dan mengosongkan waktu check-in.`);
                                                    if (!confirm1) return;
                                                    // Step 2: require exact typing of ticket code
                                                    const typed = prompt('Ketik ulang KODE TICKET untuk konfirmasi:');
                                                    if (typed === null) return;
                                                    if ((typed || '').trim().toUpperCase() !== (ticket.ticket_code || '').toUpperCase()) {
                                                        alert('Konfirmasi gagal: kode ticket tidak cocok.');
                                                        return;
                                                    }
                                                    // Step 3: require secret
                                                    const secret = prompt('Masukkan kode rahasia untuk melanjutkan:');
                                                    if (secret === null) return;
                                                    if (secret !== 'JANGANLAKUKANINIDIHARIH') {
                                                        alert('Kode rahasia salah. Aksi dibatalkan.');
                                                        return;
                                                    }

                                                    try {
                                                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                                                        const res = await fetch(`/api/tickets/${encodeURIComponent(ticket.ticket_code)}/reset`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json',
                                                                'X-Requested-With': 'XMLHttpRequest',
                                                                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                                                            },
                                                            credentials: 'same-origin',
                                                            body: JSON.stringify({ secret, confirm_code: ticket.ticket_code })
                                                        });
                                                        const data = await res.json().catch(() => ({}));
                                                        if (!res.ok || !data.success) {
                                                            throw new Error(data?.message || 'Gagal reset ticket');
                                                        }
                                                        // Update the single row locally
                                                        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'valid', checked_in_at: null, scanned_by: null } : t));
                                                        alert('Ticket berhasil direset menjadi VALID.');
                                                    } catch (e) {
                                                        alert(e.message || 'Gagal reset ticket');
                                                    }
                                                }}
                                            >
                                                Reset Ticket
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ticket.order?.buyer_email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{ticket.order_id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white/70">
                        <div className="text-sm text-gray-600">
                            Showing {filteredTickets.length === 0 ? 0 : ((currentTablePage - 1) * pageSize + 1)}–
                            {Math.min(currentTablePage * pageSize, filteredTickets.length)} of {filteredTickets.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-3 py-1.5 rounded-lg border text-sm ${currentTablePage <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                disabled={currentTablePage <= 1}
                                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-600">Page {currentTablePage} of {totalPages}</span>
                            <button
                                className={`px-3 py-1.5 rounded-lg border text-sm ${currentTablePage >= totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                disabled={currentTablePage >= totalPages}
                                onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    {filteredTickets.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No active tickets found matching your criteria.</p>
                            <p className="text-xs text-gray-400 mt-1">Pending tickets are excluded from this view</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
