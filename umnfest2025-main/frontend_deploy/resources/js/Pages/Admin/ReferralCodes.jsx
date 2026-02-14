import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import ReferralCodeModal from '../../Components/Admin/ReferralCodeModal';

export default function AdminReferralCodes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [referralCodes, setReferralCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncingUses, setSyncingUses] = useState(false);
    // Client-side pagination + sorting
    const [tablePage, setTablePage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const pageSize = 30;

    // CSRF helpers
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
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
            ...extra,
        };
    };

    const fetchReferralCodes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/referral-codes', {
                headers: { Accept: 'application/json' },
                credentials: 'include',
            });
            const data = await res.json();
            if (data?.success && data?.data?.referral_codes) {
                setReferralCodes(data.data.referral_codes);
            } else {
                setReferralCodes([]);
            }
        } catch (err) {
            console.error('API /api/referral-codes error:', err);
            setReferralCodes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralCodes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return String(dateString);
        }
    };

    const getStatusBadge = (isActive) => (
        <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );

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

    // Modal handlers
    const handleCreateCode = () => {
        setSelectedCode(null);
        setShowCreateModal(true);
        setShowEditModal(false);
    };

    const handleEditCode = (code) => {
        setSelectedCode(code);
        setShowEditModal(true);
        setShowCreateModal(false);
    };

    const handleModalSubmit = async (codeData) => {
        if (showEditModal && selectedCode) {
            // Edit mode
            try {
                const response = await fetch(`/api/referral-codes/${selectedCode.id}`, {
                    method: 'PUT',
                    headers: withCsrf(),
                    credentials: 'same-origin',
                    body: JSON.stringify(codeData),
                });
                const result = await response.json();
                if (result.success && result.data && result.data.referral_code) {
                    setReferralCodes((prev) =>
                        prev.map((c) => (c.id === selectedCode.id ? result.data.referral_code : c))
                    );
                    handleModalClose();
                    return { success: true };
                }
                return { success: false, message: result.message || 'Failed to update referral code.' };
            } catch (err) {
                return { success: false, message: 'Error updating referral code.' };
            }
        } else {
            // Create mode
            try {
                const response = await fetch('/api/referral-codes', {
                    method: 'POST',
                    headers: withCsrf(),
                    credentials: 'same-origin',
                    body: JSON.stringify(codeData),
                });
                const result = await response.json();
                if (result.success && result.data && result.data.referral_code) {
                    setReferralCodes((prev) => [result.data.referral_code, ...prev]);
                    handleModalClose();
                    return { success: true };
                }
                return { success: false, message: result.message || 'Failed to create referral code.' };
            } catch (err) {
                return { success: false, message: 'Error creating referral code.' };
            }
        }
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedCode(null);
    };

    const handleDeleteCode = async (codeId) => {
        if (!window.confirm('Are you sure you want to delete this referral code?')) return;
        try {
            const res = await fetch(`/api/referral-codes/${codeId}`, {
                method: 'DELETE',
                headers: withCsrf({ Accept: 'application/json' }),
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.success) {
                setReferralCodes((codes) => codes.filter((code) => code.id !== codeId));
            } else {
                alert(data.message || 'Failed to delete code');
            }
        } catch (e) {
            alert('Error deleting code');
        }
    };

    const handleToggleStatus = async (codeId) => {
        const code = referralCodes.find((c) => c.id === codeId);
        if (!code) return;
        try {
            const res = await fetch(`/api/referral-codes/${codeId}`, {
                method: 'PUT',
                headers: withCsrf(),
                credentials: 'same-origin',
                body: JSON.stringify({ ...code, is_active: !code.is_active }),
            });
            const data = await res.json();
            if (data.success && data.data?.referral_code) {
                setReferralCodes((codes) =>
                    codes.map((c) => (c.id === codeId ? data.data.referral_code : c))
                );
            }
        } catch (e) {
            console.error('Toggle status failed', e);
        }
    };

    const handleSyncUses = async () => {
        if (syncingUses) return;
        setSyncingUses(true);
        const prevLoading = loading;
        try {
            setLoading(true);
            const res = await fetch('/api/referral-codes/sync-uses', {
                method: 'POST',
                headers: withCsrf(),
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                const msg = data?.message || 'Failed to sync uses';
                throw new Error(msg);
            }
            await fetchReferralCodes();
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to sync referral uses');
        } finally {
            setSyncingUses(false);
            setLoading(prevLoading);
        }
    };

    const filteredCodes = referralCodes.filter((code) =>
        (code.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (code.panitia_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const referralSortAccessors = useMemo(() => ({
        code: (c) => (c?.code ?? '').toString().toLowerCase(),
        panitia_name: (c) => (c?.panitia_name ?? '').toString().toLowerCase(),
        uses: (c) => Number(c?.uses ?? 0) || 0,
        is_active: (c) => (c?.is_active ? 1 : 0),
        created_at: (c) => {
            const value = c?.created_at;
            const time = value ? new Date(value).getTime() : 0;
            return Number.isFinite(time) ? time : 0;
        },
        actions: (c) => (c?.code ?? '').toString().toLowerCase(),
    }), []);

    const sortedCodes = useMemo(() => {
        const { key, direction } = sortConfig;
        if (!key || !referralSortAccessors[key]) return filteredCodes;
        const sorted = [...filteredCodes].sort((a, b) => {
            const valueA = referralSortAccessors[key](a);
            const valueB = referralSortAccessors[key](b);
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
    }, [filteredCodes, sortConfig, referralSortAccessors]);

    // Derived pagination values
    const totalPages = Math.max(1, Math.ceil(sortedCodes.length / pageSize));
    const currentTablePage = Math.min(tablePage, totalPages);
    const paginatedCodes = sortedCodes.slice((currentTablePage - 1) * pageSize, currentTablePage * pageSize);

    // Reset to first page when filters/data change
    useEffect(() => { setTablePage(1); }, [searchTerm, referralCodes, sortConfig.key, sortConfig.direction]);

    const stats = {
        total: referralCodes.length,
        active: referralCodes.filter((c) => c.is_active).length,
        totalUses: referralCodes.reduce((sum, c) => sum + (Number(c.uses) || 0), 0),
    };

    // CSV helpers and export (Excel-compatible)
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

    const exportReferralCodesCsv = () => {
        const header = [
            'code',
            'panitia_name',
            'is_active',
            'uses',
            'created_at'
        ];
        const rows = filteredCodes.map(c => [
            c.code || '',
            c.panitia_name || '',
            c.is_active ? '1' : '0',
            Number(c.uses ?? 0),
            c.created_at || ''
        ]);
        downloadCsv(`referral_codes_export_${new Date().toISOString().slice(0,10)}.csv`, [header, ...rows]);
    };

    // XLSX export (Excel)
    const exportReferralCodesXlsx = async () => {
        const XLSX = await import('xlsx');
        const header = [
            'code',
            'panitia_name',
            'is_active',
            'uses',
            'created_at'
        ];
        const rows = filteredCodes.map(c => [
            c.code || '',
            c.panitia_name || '',
            c.is_active ? 1 : 0,
            Number(c.uses ?? 0),
            c.created_at || ''
        ]);
        const aoa = [header, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Referral Codes');
        XLSX.writeFile(wb, `referral_codes_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <AdminLayout title="Referral Codes" subtitle="Manage promotional codes">
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Referral Codes Management</h2>
                        <p className="text-gray-600">Manage promotional codes for committee members</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={handleCreateCode}
                            className="bg-[#FFC22F] text-white px-4 py-2 rounded-md hover:bg-[#E6A826] transition-colors"
                        >
                            Create New Code
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <span className="text-blue-600">🎁</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Codes</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
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
                                <p className="text-sm font-medium text-gray-500">Active Codes</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                    <span className="text-purple-600">📊</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Uses</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.totalUses}</p>
                            </div>
                        </div>
                    </div>

                    {/* Removed Avg. Discount card */}
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by code or committee member name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC22F] focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <p className="text-sm text-gray-500">
                                Showing {filteredCodes.length} of {referralCodes.length} codes
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportReferralCodesCsv}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                                    disabled={loading}
                                    title="Export current filtered referral codes to CSV (Excel-compatible)"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={exportReferralCodesXlsx}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-700 transition-all disabled:opacity-60"
                                    disabled={loading}
                                    title="Export current filtered referral codes to Excel (.xlsx)"
                                >
                                    Export XLSX
                                </button>
                                <button
                                    onClick={handleSyncUses}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-md font-semibold hover:shadow-md transition-all disabled:opacity-60"
                                    disabled={loading || syncingUses}
                                    title="Recalculate uses from paid orders"
                                >
                                    {syncingUses ? 'Syncing…' : 'Sync Uses'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Codes Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'code' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('code')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Code</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('code')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'panitia_name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('panitia_name')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Committee Member</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('panitia_name')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'uses' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('uses')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Uses</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('uses')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'is_active' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('is_active')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Status</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('is_active')}</span>
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        aria-sort={sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSort('created_at')}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider focus:outline-none"
                                        >
                                            <span>Created</span>
                                            <span className="text-[10px] text-gray-400">{getSortIcon('created_at')}</span>
                                        </button>
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCodes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                {code.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {code.panitia_name}
                                        </td>
                                        {/* Removed Discount column cell */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {code.uses}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(code.is_active)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(code.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEditCode(code)}
                                                className="text-[#FFC22F] hover:text-[#E6A826]"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(code.id)}
                                                className={`${code.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                            >
                                                {code.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCode(code.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white/70">
                        <div className="text-sm text-gray-600">
                            Showing {sortedCodes.length === 0 ? 0 : ((currentTablePage - 1) * pageSize + 1)}–{Math.min(currentTablePage * pageSize, sortedCodes.length)} of {sortedCodes.length}
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

                    {filteredCodes.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No referral codes found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Code Modal */}
            <ReferralCodeModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onSave={handleModalSubmit}
                referralCode={null}
            />

            {/* Edit Code Modal */}
            <ReferralCodeModal
                isOpen={showEditModal}
                onClose={handleModalClose}
                onSave={handleModalSubmit}
                referralCode={selectedCode}
            />
        </AdminLayout>
    );
}
