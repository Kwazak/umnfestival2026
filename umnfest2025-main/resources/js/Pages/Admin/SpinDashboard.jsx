import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const typeOptions = [
    { value: 'cashback', label: 'Cashback' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'discount', label: 'Discount' },
    { value: 'nothing', label: 'Nothing' },
];

const typeBadges = {
    cashback: 'bg-green-100 text-green-800 border border-green-200',
    merchandise: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    discount: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    nothing: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const formatOdds = (probability, totalWeight) => {
    const weight = Number(totalWeight) || 0;
    const prob = Number(probability) || 0;
    if (prob <= 0 || weight <= 0) {
        return '—';
    }
    const ratio = Math.max(1, Math.round(weight / prob));
    return `1 : ${ratio.toLocaleString('id-ID')}`;
};

const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (err) {
        return iso;
    }
};

export default function SpinDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [prizes, setPrizes] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [attemptMeta, setAttemptMeta] = useState(null);
    const [attemptLinks, setAttemptLinks] = useState(null);
    const [attemptLoading, setAttemptLoading] = useState(false);
    const [attemptError, setAttemptError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [pendingDeletionId, setPendingDeletionId] = useState(null);
    const [stats, setStats] = useState(null);
    const [savingPrizeId, setSavingPrizeId] = useState(null);

    const csrfToken = useMemo(() => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'), []);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async ({ refreshAttempts = true } = {}) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/admin/spin/dashboard', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load spin dashboard');
            }
            setStats(data.data.stats);
            setPrizes(
                data.data.prizes.map((prize) => ({
                    ...prize,
                    probability: prize.probability ?? 0,
                    stock: prize.stock ?? '',
                    value: prize.value ?? '',
                    display_text: prize.display_text ?? '',
                }))
            );
        } catch (err) {
            console.error('Spin dashboard load error:', err);
            setError(err.message || 'Failed to load spin dashboard');
        } finally {
            setLoading(false);
        }

        if (refreshAttempts) {
            await fetchAttempts({ page: 1, perPage, search: searchTerm });
        }
    };

    const activeWeight = useMemo(
        () => prizes.filter((p) => p.is_active).reduce((sum, prize) => sum + (Number(prize.probability) || 0), 0),
        [prizes]
    );

    const totalWeightLocal = useMemo(
        () => prizes.reduce((sum, prize) => sum + (Number(prize.probability) || 0), 0),
        [prizes]
    );

    const handleFieldChange = (id, field, value) => {
        setPrizes((prev) => prev.map((prize) => (prize.id === id ? { ...prize, [field]: value } : prize)));
    };

    const handleToggleActive = (id) => {
        setPrizes((prev) =>
            prev.map((prize) =>
                prize.id === id ? { ...prize, is_active: !prize.is_active } : prize
            )
        );
    };

    const handleSavePrize = async (prize) => {
        setSavingPrizeId(prize.id);
        setError('');
        setFeedback('');

        try {
            const payload = {
                name: prize.name?.trim() || '',
                type: prize.type,
                probability: Number(prize.probability) || 0,
                value: prize.value?.trim() || null,
                display_text: prize.display_text?.trim() || null,
                stock: prize.stock === '' ? null : Number(prize.stock),
                is_active: Boolean(prize.is_active),
            };

            if (!payload.name) {
                throw new Error('Prize name is required');
            }

            if (Number.isNaN(payload.probability) || payload.probability < 0) {
                throw new Error('Probability must be zero or a positive number');
            }

            if (payload.stock !== null && (Number.isNaN(payload.stock) || payload.stock < 0)) {
                throw new Error('Stock must be left blank or set to zero or a positive number');
            }

            const response = await fetch(`/api/admin/spin/prizes/${prize.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update prize');
            }

            setFeedback(`Prize "${data.data.name}" updated successfully.`);
            await fetchDashboard();
        } catch (err) {
            console.error('Update prize error:', err);
            setError(err.message || 'Failed to update prize');
        } finally {
            setSavingPrizeId(null);
            setTimeout(() => setFeedback(''), 4000);
        }
    };

    const handleRefresh = async () => {
        await fetchDashboard({ refreshAttempts: false });
        const currentPage = attemptMeta?.current_page ?? 1;
        fetchAttempts({ page: currentPage });
    };

    const fetchAttempts = async ({ page = 1, perPage: perPageParam = perPage, search = searchTerm } = {}) => {
        setAttemptLoading(true);
        setAttemptError('');

        try {
            const targetPage = Math.max(1, Number(page) || 1);
            const targetPerPage = Math.max(1, Math.min(100, Number(perPageParam) || perPage));
            const params = new URLSearchParams();
            params.append('page', targetPage);
            params.append('per_page', targetPerPage);
            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`/api/admin/spin/attempts?${params.toString()}`, {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load spin attempts');
            }

            setAttempts(data.data || []);
            setAttemptMeta(data.meta || null);
            setAttemptLinks(data.links || null);
        } catch (err) {
            console.error('Spin attempts load error:', err);
            setAttemptError(err.message || 'Failed to load spin attempts');
        } finally {
            setAttemptLoading(false);
        }
    };

    const handleChangePage = (newPage) => {
        if (!attemptMeta || newPage < 1 || newPage > attemptMeta.last_page) return;
        fetchAttempts({ page: newPage });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(searchInput.trim());
        fetchAttempts({ page: 1, search: searchInput.trim() });
    };

    const handleResetSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        fetchAttempts({ page: 1, search: '' });
    };

    const handleChangePerPage = (event) => {
        const value = Number(event.target.value) || 10;
        setPerPage(value);
        fetchAttempts({ page: 1, perPage: value });
    };

    const handleDeleteAttempt = async (attemptId) => {
        if (!attemptId || pendingDeletionId) {
            return;
        }

        const confirmed = window.confirm('Hapus spin attempt ini? Data tidak bisa dikembalikan.');
        if (!confirmed) {
            return;
        }

        setPendingDeletionId(attemptId);
        setAttemptError('');
        setFeedback('');

        try {
            const response = await fetch(`/api/admin/spin/attempts/${attemptId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Gagal menghapus spin attempt');
            }

        setFeedback('Spin attempt berhasil dihapus.');
    const currentPage = attemptMeta?.current_page ?? 1;
    await fetchAttempts({ page: currentPage });
        fetchDashboard({ refreshAttempts: false });
        } catch (err) {
            console.error('Delete spin attempt error:', err);
            setAttemptError(err.message || 'Gagal menghapus spin attempt');
        } finally {
            setPendingDeletionId(null);
            setTimeout(() => setFeedback(''), 4000);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Spin Manager</h1>
                        <p className="text-slate-500">Monitor prize distribution, adjust probabilities, and audit recent spins.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
                        >
                            <span className="text-lg">🔄</span> Refresh Data
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {feedback && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                        {feedback}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="h-16 w-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <section>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    label="Total Spins"
                                    value={stats?.total_spins ?? 0}
                                    description={`${stats?.spins_last_24h ?? 0} in last 24h`}
                                    icon="🎰"
                                />
                                <StatCard
                                    label="Unique Orders"
                                    value={stats?.unique_orders ?? 0}
                                    description="Distinct orders that attempted"
                                    icon="🧾"
                                />
                                <StatCard
                                    label="Winners"
                                    value={stats?.winner_count ?? 0}
                                    description={`${stats?.win_rate ?? 0}% win rate`}
                                    icon="🎉"
                                />
                                <StatCard
                                    label="Active Weight"
                                    value={activeWeight}
                                    description={`Total weight: ${totalWeightLocal}`}
                                    icon="⚖️"
                                />
                            </div>
                        </section>

                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Prize Configuration</h2>
                                    <p className="text-sm text-slate-500">Update probability weight, stock, and descriptions. Total weight determines odds.</p>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Active prizes: <span className="font-semibold text-slate-700">{prizes.filter((p) => p.is_active).length}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Prize</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Probability</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Odds</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Stock</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Text / Value</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Usage</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {prizes.map((prize) => (
                                            <tr key={prize.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 align-top">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={prize.name}
                                                            onChange={(e) => handleFieldChange(prize.id, 'name', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none"
                                                        />
                                                        <textarea
                                                            value={prize.display_text}
                                                            onChange={(e) => handleFieldChange(prize.id, 'display_text', e.target.value)}
                                                            placeholder="Display text shown to user"
                                                            rows={2}
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-slate-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <select
                                                        value={prize.type}
                                                        onChange={(e) => handleFieldChange(prize.id, 'type', e.target.value)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none bg-white"
                                                    >
                                                        {typeOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${typeBadges[prize.type] || 'bg-slate-100 text-slate-700'}`}>
                                                        {prize.type === 'cashback' && '💰'}
                                                        {prize.type === 'merchandise' && '🎁'}
                                                        {prize.type === 'discount' && '🏷️'}
                                                        {prize.type === 'nothing' && '🙂'}
                                                        <span className="uppercase tracking-wide">{prize.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={prize.probability}
                                                            onChange={(e) => handleFieldChange(prize.id, 'probability', e.target.value)}
                                                            className="w-24 rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none"
                                                        />
                                                        <p className="text-xs text-slate-500">
                                                            Weight units
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top text-slate-700 font-medium">
                                                    {prize.is_active
                                                        ? formatOdds(prize.probability, activeWeight)
                                                        : 'Paused'}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="∞"
                                                            value={prize.stock === '' || prize.stock === null ? '' : prize.stock}
                                                            onChange={(e) => handleFieldChange(prize.id, 'stock', e.target.value === '' ? '' : Number(e.target.value))}
                                                            className="w-24 rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none"
                                                        />
                                                        <p className="text-xs text-slate-500">
                                                            Leave blank = unlimited
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={prize.value}
                                                            placeholder={prize.type === 'cashback' ? 'e.g. 50000' : 'Optional'}
                                                            onChange={(e) => handleFieldChange(prize.id, 'value', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none"
                                                        />
                                                        <div className="text-xs text-slate-500">
                                                            Last update: {formatDateTime(prize.updated_at)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div><span className="font-semibold text-slate-800">Spins:</span> {prize.total_spins}</div>
                                                        <div><span className="font-semibold text-slate-800">Wins:</span> {prize.total_wins}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <button
                                                        onClick={() => handleToggleActive(prize.id)}
                                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                                            prize.is_active
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}
                                                    >
                                                        <span className="text-lg">{prize.is_active ? '✅' : '⏸️'}</span>
                                                        {prize.is_active ? 'Active' : 'Paused'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 align-top text-center">
                                                    <button
                                                        onClick={() => handleSavePrize(prize)}
                                                        disabled={savingPrizeId === prize.id}
                                                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {savingPrizeId === prize.id ? 'Saving…' : 'Save'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 space-y-4">
                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Spin Attempts</h2>
                                        <p className="text-sm text-slate-500">Riwayat lengkap spin attempt dengan pencarian dan kontrol.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-slate-500">
                                            Total data: <span className="font-semibold text-slate-700">{attemptMeta?.total ?? 0}</span>
                                        </div>
                                        <select
                                            value={perPage}
                                            onChange={handleChangePerPage}
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                                        >
                                            {[10, 25, 50, 100].map((option) => (
                                                <option key={option} value={option}>
                                                    {option} / halaman
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder="Cari order number, nama, email, prize, atau ID"
                                            className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-slate-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
                                        >
                                            🔍 Cari
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetSearch}
                                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
                                        >
                                            ❌ Reset
                                        </button>
                                    </div>
                                </form>
                                {attemptError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                        {attemptError}
                                    </div>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Time</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Order</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Buyer</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Prize</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Prize Value</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Email Used</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {attemptLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                                                    <div className="flex justify-center">
                                                        <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : attempts.length === 0 ? (
                                            <tr>
                                                <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                                                    Tidak ada data spin attempt.
                                                </td>
                                            </tr>
                                        ) : (
                                            attempts.map((attempt) => (
                                                <tr key={attempt.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-600">#{attempt.id}</td>
                                                    <td className="px-4 py-3 text-slate-600">{formatDateTime(attempt.spun_at)}</td>
                                                    <td className="px-4 py-3 text-slate-700 font-semibold">{attempt.order_number || '—'}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div>{attempt.buyer_name || '—'}</div>
                                                        <div className="text-xs text-slate-500">{attempt.buyer_email || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-800">{attempt.prize_name || '—'}</div>
                                                        <div className="text-xs text-slate-500 uppercase tracking-wide">{attempt.prize_type || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{attempt.prize_value || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{attempt.email_used || '—'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleDeleteAttempt(attempt.id)}
                                                            disabled={pendingDeletionId === attempt.id}
                                                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {pendingDeletionId === attempt.id ? 'Deleting…' : 'Delete'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {attemptMeta && attempts.length > 0 && (
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                                    <div className="text-xs text-slate-500">
                                        Menampilkan {attemptMeta.from} - {attemptMeta.to} dari {attemptMeta.total}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleChangePage(attemptMeta.current_page - 1)}
                                            disabled={!attemptLinks?.prev}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ◀ Prev
                                        </button>
                                        <div className="text-sm text-slate-600">
                                            Page {attemptMeta.current_page} of {attemptMeta.last_page}
                                        </div>
                                        <button
                                            onClick={() => handleChangePage(attemptMeta.current_page + 1)}
                                            disabled={!attemptLinks?.next}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next ▶
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, description, icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{value?.toLocaleString?.('id-ID') ?? value}</div>
                    {description && <div className="mt-1 text-xs text-slate-500">{description}</div>}
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </div>
    );
}
