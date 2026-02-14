import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const emptyAgendaRow = () => ({ time: '', title: '', description: '' });
const emptyCustomSection = () => ({ heading: '', content: '' });

export default function EmailBlastPage() {
    const [form, setForm] = useState({
        subject: '',
        preheader: '',
        hero_title: '',
        hero_subtitle: '',
        intro_paragraph: '',
        event_date: '',
        event_venue: '',
        agenda: [emptyAgendaRow()],
        custom_sections: [],
        closing_remark: '',
        contact_email: '',
        contact_phone: '',
        footer_note: '',
        hero_image_url: '',
        socials: [],
    });
    const [trialRecipients, setTrialRecipients] = useState([]);
    const [allowProduction, setAllowProduction] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const response = await window.axios.get('/api/admin/email-blast/template');
            setForm((prev) => ({ ...prev, ...response.data.data }));
            setTrialRecipients(response.data.trialRecipients || []);
            setAllowProduction(Boolean(response.data.allowProduction));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load template' });
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await window.axios.get('/api/admin/email-blast/logs');
            setLogs(response.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTemplate();
        fetchLogs();
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateAgenda = (index, key, value) => {
        setForm((prev) => {
            const nextAgenda = prev.agenda.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));
            return { ...prev, agenda: nextAgenda };
        });
    };

    const addAgendaRow = () => {
        setForm((prev) => ({ ...prev, agenda: [...prev.agenda, emptyAgendaRow()] }));
    };

    const removeAgendaRow = (index) => {
        setForm((prev) => {
            if (prev.agenda.length === 1) return prev;
            return { ...prev, agenda: prev.agenda.filter((_, idx) => idx !== index) };
        });
    };

    const updateHighlight = (index, key, value) => {
        setForm((prev) => {
            const sections = [...(prev.custom_sections || [])];
            sections[index] = { ...sections[index], [key]: value };
            return { ...prev, custom_sections: sections };
        });
    };

    const addHighlight = () => {
        setForm((prev) => ({ ...prev, custom_sections: [...(prev.custom_sections || []), emptyCustomSection()] }));
    };

    const removeHighlight = (index) => {
        setForm((prev) => ({
            ...prev,
            custom_sections: (prev.custom_sections || []).filter((_, idx) => idx !== index),
        }));
    };

    const handleSaveTemplate = async () => {
        try {
            setSaving(true);
            const response = await window.axios.post('/api/admin/email-blast/template', form);
            setForm(response.data.data);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save template' });
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        try {
            const response = await window.axios.post('/api/admin/email-blast/preview', form);
            setPreviewHtml(response.data.html);
            setMessage({ type: 'success', text: 'Preview refreshed.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to render preview' });
        }
    };

    const handleSend = async (mode = 'trial') => {
        try {
            setSending(true);
            const response = await window.axios.post('/api/admin/email-blast/send', { ...form, mode });
            setMessage({ type: response.data.success ? 'success' : 'error', text: response.data.message });
            await fetchLogs();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send email blast' });
        } finally {
            setSending(false);
        }
    };

    const highlightColor = message.type === 'error' ? 'bg-red-500/15 text-red-600 border border-red-500/40' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-400/50';

    return (
        <div className="space-y-6">
            {message.text && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${highlightColor}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 xl:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="bg-white/95 rounded-3xl shadow-xl border border-slate-100 p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Email Content</h2>
                            <p className="text-sm text-slate-500">Customize the UNIFY 2025 blast template.</p>
                        </div>
                        <button
                            onClick={handleSaveTemplate}
                            disabled={saving || loading}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-40"
                        >
                            {saving ? 'Saving…' : 'Save Template'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="text-sm font-semibold text-slate-600">
                                Subject
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.subject}
                                    onChange={(e) => updateField('subject', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-600">
                                Preheader
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.preheader}
                                    onChange={(e) => updateField('preheader', e.target.value)}
                                />
                            </label>
                        </div>
                        <label className="text-sm font-semibold text-slate-600">
                            Hero Image URL
                            <input
                                type="text"
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                value={form.hero_image_url}
                                onChange={(e) => updateField('hero_image_url', e.target.value)}
                            />
                        </label>
                        <label className="text-sm font-semibold text-slate-600">
                            Hero Title
                            <input
                                type="text"
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                value={form.hero_title}
                                onChange={(e) => updateField('hero_title', e.target.value)}
                            />
                        </label>
                        <label className="text-sm font-semibold text-slate-600">
                            Hero Subtitle
                            <textarea
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
                                rows={2}
                                value={form.hero_subtitle}
                                onChange={(e) => updateField('hero_subtitle', e.target.value)}
                            />
                        </label>
                        <label className="text-sm font-semibold text-slate-600">
                            Intro Paragraph
                            <textarea
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3"
                                rows={3}
                                value={form.intro_paragraph}
                                onChange={(e) => updateField('intro_paragraph', e.target.value)}
                            />
                        </label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="text-sm font-semibold text-slate-600">
                                Event Date & Timing
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.event_date}
                                    onChange={(e) => updateField('event_date', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-600">
                                Venue
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.event_venue}
                                    onChange={(e) => updateField('event_venue', e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border rounded-2xl border-slate-200 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-700">Agenda Blocks</p>
                            <button className="text-sm font-semibold text-blue-600" onClick={addAgendaRow}>+ Add slot</button>
                        </div>
                        {form.agenda.map((slot, idx) => (
                            <div key={`agenda-${idx}`} className="grid md:grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-3">
                                <input
                                    type="text"
                                    placeholder="Time"
                                    className="rounded-xl border border-slate-200 px-3 py-2"
                                    value={slot.time}
                                    onChange={(e) => updateAgenda(idx, 'time', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="rounded-xl border border-slate-200 px-3 py-2 col-span-2"
                                    value={slot.title}
                                    onChange={(e) => updateAgenda(idx, 'title', e.target.value)}
                                />
                                <textarea
                                    placeholder="Description"
                                    className="md:col-span-3 rounded-2xl border border-slate-200 px-3 py-2"
                                    rows={2}
                                    value={slot.description}
                                    onChange={(e) => updateAgenda(idx, 'description', e.target.value)}
                                />
                                {form.agenda.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 font-semibold"
                                        onClick={() => removeAgendaRow(idx)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="border rounded-2xl border-slate-200 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-slate-700">Custom Sections</p>
                                <button className="text-sm font-semibold text-blue-600" onClick={addHighlight}>+ Add section</button>
                            </div>
                            {(form.custom_sections || []).map((section, idx) => (
                                <div key={`section-${idx}`} className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Heading (opsional)"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2"
                                        value={section.heading || ''}
                                        onChange={(e) => updateHighlight(idx, 'heading', e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Content (bisa multiline, pakai • untuk bullet points)"
                                        className="w-full rounded-2xl border border-slate-200 px-3 py-2"
                                        rows={4}
                                        value={section.content || ''}
                                        onChange={(e) => updateHighlight(idx, 'content', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 font-semibold"
                                        onClick={() => removeHighlight(idx)}
                                    >
                                        Remove section
                                    </button>
                                </div>
                            ))}
                            {(!form.custom_sections || form.custom_sections.length === 0) && (
                                <p className="text-xs text-slate-500">Belum ada custom section. Klik "+ Add section" untuk menambah konten bebas.</p>
                            )}
                        </div>
                        <label className="text-sm font-semibold text-slate-600">
                            Closing Remark (opsional)
                            <textarea
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3"
                                rows={3}
                                value={form.closing_remark}
                                onChange={(e) => updateField('closing_remark', e.target.value)}
                            />
                        </label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="text-sm font-semibold text-slate-600">
                                Contact Email (opsional)
                                <input
                                    type="email"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.contact_email}
                                    onChange={(e) => updateField('contact_email', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-600">
                                Contact Phone (opsional)
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={form.contact_phone}
                                    onChange={(e) => updateField('contact_phone', e.target.value)}
                                />
                            </label>
                        </div>
                        <label className="text-sm font-semibold text-slate-600">
                            Footer Note (opsional)
                            <textarea
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
                                rows={2}
                                value={form.footer_note}
                                onChange={(e) => updateField('footer_note', e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                <div className="space-y-6 lg:space-y-8">
                    <div className="bg-white/95 rounded-3xl shadow-xl border border-slate-100 p-6 space-y-4 lg:sticky lg:top-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
                                <p className="text-sm text-slate-500">Render langsung dari template Blade.</p>
                            </div>
                            <button
                                onClick={handlePreview}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                            >
                                Refresh Preview
                            </button>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 min-h-[360px] h-[65vh] md:h-[70vh] lg:h-[720px] max-h-[80vh]">
                            {previewHtml ? (
                                <iframe
                                    title="Email Preview"
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-0 bg-white"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full px-6 text-center text-slate-500 text-sm">
                                    Klik "Refresh Preview" untuk melihat tampilan email.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/95 rounded-3xl shadow-xl border border-amber-200 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Trial Blast</h2>
                                <p className="text-sm text-slate-500">Email hanya dikirim ke daftar peninjau.</p>
                            </div>
                            <button
                                onClick={() => handleSend('trial')}
                                disabled={sending}
                                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50"
                            >
                                {sending ? 'Sending…' : 'Send Trial'}
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                            {trialRecipients.map((recipient) => (
                                <li key={recipient.email} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span>{recipient.name}</span>
                                    <span className="text-slate-400">·</span>
                                    <span className="font-mono text-xs">{recipient.email}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
                            Production mode currently <strong>{allowProduction ? 'UNLOCKED' : 'LOCKED'}</strong>. Ubah env <code>EMAIL_BLAST_ALLOW_PRODUCTION</code> untuk membuka.
                        </div>
                        <button
                            disabled
                            className="w-full text-center px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-400 cursor-not-allowed"
                        >
                            Full Send (Locked)
                        </button>
                    </div>

                    <div className="bg-white/95 rounded-3xl shadow-xl border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Blast Logs</h2>
                            <button className="text-sm text-blue-600" onClick={fetchLogs}>Refresh</button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {logs.map((log) => (
                                <div key={log.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-slate-800">{log.subject}</div>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-wide">
                                            {log.mode}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {new Date(log.created_at).toLocaleString('id-ID')} · {log.sent_count}/{log.intended_recipients} sent · {log.status}
                                    </div>
                                    {log.error_message && (
                                        <pre className="mt-2 text-xs text-red-500 whitespace-pre-wrap bg-red-50 rounded-xl p-2">{log.error_message}</pre>
                                    )}
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-sm text-slate-500">Belum ada log pengiriman.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

EmailBlastPage.layout = (page) => (
    <AdminLayout title="Email Blast" subtitle="Compose and review the UNIFY 2025 announcement.">
        {page}
    </AdminLayout>
);
