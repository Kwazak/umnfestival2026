import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const emptyAgendaRow = () => ({ time: '', title: '', description: '' });
const emptyCustomSection = () => ({ heading: '', content: '' });

// Reusable Components
const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon, title, action }) => (
    <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span>{title}</span>
        </h3>
        {action}
    </div>
);

const SectionBody = ({ children, className = '' }) => (
    <div className={`p-5 ${className}`}>
        {children}
    </div>
);

const InputLabel = ({ children, required }) => (
    <label className="block text-sm font-semibold text-slate-700 mb-2">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const TextInput = ({ value, onChange, placeholder, className = '' }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition ${className}`}
    />
);

const TextArea = ({ value, onChange, placeholder, rows = 3, className = '' }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none ${className}`}
    />
);

const Button = ({ onClick, disabled, variant = 'primary', children, className = '' }) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
        outline: 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

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
    const [productionRecipients, setProductionRecipients] = useState([]);
    const [allowProduction, setAllowProduction] = useState(false);
    const [productionCount, setProductionCount] = useState(0);
    const [previewHtml, setPreviewHtml] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showTrialList, setShowTrialList] = useState(false);
    const [showProductionWarning, setShowProductionWarning] = useState(false);
    const [loadingProductionList, setLoadingProductionList] = useState(false);
    const [lastSentRecipients, setLastSentRecipients] = useState([]);
    const [showScheduleSection, setShowScheduleSection] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState({});
    const [confirmationCode, setConfirmationCode] = useState('');

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const response = await window.axios.get('/api/admin/email-blast/template');
            const data = response.data.data;
            const hasAgenda = data.agenda && data.agenda.length > 0 && data.agenda.some(a => a.time || a.title || a.description);
            setShowScheduleSection(hasAgenda);
            setForm((prev) => ({ 
                ...prev, 
                subject: data.subject || '',
                preheader: data.preheader || '',
                hero_title: data.hero_title || '',
                hero_subtitle: data.hero_subtitle || '',
                intro_paragraph: data.intro_paragraph || '',
                event_date: data.event_date || '',
                event_venue: data.event_venue || '',
                agenda: hasAgenda ? data.agenda : [],
                custom_sections: data.custom_sections || [],
                closing_remark: data.closing_remark || '',
                contact_email: data.contact_email || '',
                contact_phone: data.contact_phone || '',
                footer_note: data.footer_note || '',
                hero_image_url: data.hero_image_url || '',
                socials: data.socials || [],
            }));
            setTrialRecipients(response.data.trialRecipients || []);
            setAllowProduction(Boolean(response.data.allowProduction));
            setProductionCount(response.data.productionCount || 0);
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

    // Auto-refresh preview on form changes (debounced)
    useEffect(() => {
        if (loading) return; // Don't run on initial load
        
        const timeoutId = setTimeout(() => {
            handleGeneratePreview();
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [form, loading]);

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
            setMessage({ type: '', text: '' });
            await window.axios.post('/api/admin/email-blast/template', form);
            setMessage({ type: 'success', text: 'Template saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save template' });
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePreview = async () => {
        try {
            setMessage({ type: '', text: '' });
            const response = await window.axios.post('/api/admin/email-blast/preview', form);
            setPreviewHtml(response.data.html || '');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate preview' });
        }
    };

    const handleSendTrial = async () => {
        try {
            setSending(true);
            setMessage({ type: '', text: '' });
            const response = await window.axios.post('/api/admin/email-blast/send', { 
                mode: 'trial',
                ...form 
            });
            setLastSentRecipients(response.data.recipients || []);
            setMessage({ 
                type: 'success', 
                text: `${response.data.message} Check logs below to see recipients.`
            });
            fetchLogs();
            setShowTrialList(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send trial emails' });
        } finally {
            setSending(false);
        }
    };

    const handleSendProduction = async () => {
        // Validasi kode konfirmasi
        if (confirmationCode !== '22112025') {
            setMessage({ 
                type: 'error', 
                text: 'KODE KONFIRMASI SALAH! Periksa kembali kode yang Anda masukkan.' 
            });
            return;
        }

        try {
            setSending(true);
            setMessage({ type: '', text: '' });
            const response = await window.axios.post('/api/admin/email-blast/send', { 
                mode: 'production',
                ...form
            });
            setLastSentRecipients(response.data.recipients || []);
            setMessage({ 
                type: 'success', 
                text: `${response.data.message} Sent to ${response.data.total_sent} buyers. Check logs below.`
            });
            fetchLogs();
            setShowProductionWarning(false);
            setConfirmationCode(''); // Reset kode setelah berhasil
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send production emails' });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Email Blast Campaign">
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <p className="text-slate-600 font-semibold text-lg">Loading Campaign...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Email Blast Campaign" subtitle="Create and manage email campaigns">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Status Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border-2 font-semibold flex items-start gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-50 border-green-300 text-green-800' 
                            : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                        <span className="text-xl">{message.type === 'success' ? '✓' : '⚠'}</span>
                        <span className="flex-1">{message.text}</span>
                        <button 
                            onClick={() => setMessage({ type: '', text: '' })}
                            className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* LEFT COLUMN - Form Editor (8 cols) */}
                    <div className="xl:col-span-8 space-y-5">
                        {/* Email Details */}
                        <SectionCard>
                            <SectionHeader icon="📧" title="Email Details" />
                            <SectionBody>
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel required>Subject Line</InputLabel>
                                        <TextInput
                                            value={form.subject}
                                            onChange={(e) => updateField('subject', e.target.value)}
                                            placeholder="Enter compelling subject line"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel>Preheader Text</InputLabel>
                                        <TextInput
                                            value={form.preheader}
                                            onChange={(e) => updateField('preheader', e.target.value)}
                                            placeholder="Preview text (appears after subject in inbox)"
                                        />
                                    </div>
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Hero Section */}
                        <SectionCard>
                            <SectionHeader icon="🎨" title="Hero Section" />
                            <SectionBody>
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel>Image URL</InputLabel>
                                        <TextInput
                                            value={form.hero_image_url}
                                            onChange={(e) => updateField('hero_image_url', e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel>Title</InputLabel>
                                        <TextInput
                                            value={form.hero_title}
                                            onChange={(e) => updateField('hero_title', e.target.value)}
                                            placeholder="Main headline"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel>Subtitle</InputLabel>
                                        <TextInput
                                            value={form.hero_subtitle}
                                            onChange={(e) => updateField('hero_subtitle', e.target.value)}
                                            placeholder="Supporting text"
                                        />
                                    </div>
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Introduction */}
                        <SectionCard>
                            <SectionHeader icon="📝" title="Introduction" />
                            <SectionBody>
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel>Opening Message</InputLabel>
                                        <TextArea
                                            value={form.intro_paragraph}
                                            onChange={(e) => updateField('intro_paragraph', e.target.value)}
                                            placeholder="Greeting and main message..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel>Event Date</InputLabel>
                                            <TextInput
                                                value={form.event_date}
                                                onChange={(e) => updateField('event_date', e.target.value)}
                                                placeholder="Saturday, 15 March 2025"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel>Venue</InputLabel>
                                            <TextInput
                                                value={form.event_venue}
                                                onChange={(e) => updateField('event_venue', e.target.value)}
                                                placeholder="UMN Campus, Tangerang"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Event Schedule */}
                        <SectionCard>
                            <SectionHeader 
                                icon="📅" 
                                title="Event Schedule"
                                action={
                                    <div className="flex items-center gap-2">
                                        {showScheduleSection && (
                                            <Button
                                                variant="success"
                                                onClick={addAgendaRow}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                + Add Slot
                                            </Button>
                                        )}
                                        <Button
                                            variant={showScheduleSection ? 'danger' : 'outline'}
                                            onClick={() => {
                                                if (showScheduleSection) {
                                                    setForm(prev => ({ ...prev, agenda: [] }));
                                                } else {
                                                    setForm(prev => ({ ...prev, agenda: [emptyAgendaRow()] }));
                                                }
                                                setShowScheduleSection(!showScheduleSection);
                                            }}
                                            className="text-xs px-3 py-1.5"
                                        >
                                            {showScheduleSection ? '✕ Remove Section' : '+ Add Section'}
                                        </Button>
                                    </div>
                                }
                            />
                            <SectionBody>
                                {!showScheduleSection ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <div className="text-4xl mb-3">📅</div>
                                        <p className="text-sm font-medium">Schedule section is disabled</p>
                                        <p className="text-xs mt-1">Click "Add Section" to enable</p>
                                    </div>
                                ) : form.agenda.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <div className="text-4xl mb-3">📋</div>
                                        <p className="text-sm font-medium">No schedule items yet</p>
                                        <Button
                                            variant="primary"
                                            onClick={addAgendaRow}
                                            className="mt-3 text-xs"
                                        >
                                            + Add First Slot
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.agenda.map((slot, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div className="col-span-1">
                                                        <TextInput
                                                            value={slot.time}
                                                            onChange={(e) => updateAgenda(idx, 'time', e.target.value)}
                                                            placeholder="16:00"
                                                            className="text-sm py-2"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <TextInput
                                                            value={slot.title}
                                                            onChange={(e) => updateAgenda(idx, 'title', e.target.value)}
                                                            placeholder="Activity Title"
                                                            className="text-sm py-2"
                                                        />
                                                    </div>
                                                </div>
                                                <TextArea
                                                    value={slot.description}
                                                    onChange={(e) => updateAgenda(idx, 'description', e.target.value)}
                                                    placeholder="Description (optional)"
                                                    rows={2}
                                                    className="text-sm py-2"
                                                />
                                                {form.agenda.length > 1 && (
                                                    <button
                                                        onClick={() => removeAgendaRow(idx)}
                                                        className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                                                    >
                                                        <span>🗑️</span> Remove Slot
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionBody>
                        </SectionCard>

                        {/* Custom Sections */}
                        <SectionCard>
                            <SectionHeader 
                                icon="📦" 
                                title="Custom Content Sections"
                                action={
                                    <Button
                                        variant="primary"
                                        onClick={addHighlight}
                                        className="text-xs px-3 py-1.5"
                                    >
                                        + Add Section
                                    </Button>
                                }
                            />
                            <SectionBody>
                                {(!form.custom_sections || form.custom_sections.length === 0) ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <div className="text-4xl mb-3">📦</div>
                                        <p className="text-sm font-medium">No custom sections yet</p>
                                        <p className="text-xs mt-1 mb-3">Add flexible content blocks</p>
                                        <Button
                                            variant="primary"
                                            onClick={addHighlight}
                                            className="text-xs"
                                        >
                                            + Add First Section
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.custom_sections.map((section, idx) => (
                                            <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                                <TextInput
                                                    value={section.heading || ''}
                                                    onChange={(e) => updateHighlight(idx, 'heading', e.target.value)}
                                                    placeholder="Section Heading (optional)"
                                                    className="text-sm py-2 bg-white"
                                                />
                                                <TextArea
                                                    value={section.content || ''}
                                                    onChange={(e) => updateHighlight(idx, 'content', e.target.value)}
                                                    placeholder="Content (use • for bullet points)"
                                                    rows={4}
                                                    className="text-sm py-2 bg-white"
                                                />
                                                <button
                                                    onClick={() => removeHighlight(idx)}
                                                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                                                >
                                                    <span>🗑️</span> Remove Section
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionBody>
                        </SectionCard>

                        {/* Closing & Contact */}
                        <SectionCard>
                            <SectionHeader icon="👋" title="Closing & Contact Info" />
                            <SectionBody>
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel>Closing Message</InputLabel>
                                        <TextArea
                                            value={form.closing_remark}
                                            onChange={(e) => updateField('closing_remark', e.target.value)}
                                            placeholder="Thank you message or call-to-action..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel>Contact Email</InputLabel>
                                            <TextInput
                                                value={form.contact_email}
                                                onChange={(e) => updateField('contact_email', e.target.value)}
                                                placeholder="support@umnfestival.com"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel>Contact Phone</InputLabel>
                                            <TextInput
                                                value={form.contact_phone}
                                                onChange={(e) => updateField('contact_phone', e.target.value)}
                                                placeholder="+62 812-xxxx-xxxx"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel>Footer Note</InputLabel>
                                        <TextArea
                                            value={form.footer_note}
                                            onChange={(e) => updateField('footer_note', e.target.value)}
                                            placeholder="Legal text or additional notes..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Save Button */}
                        <SectionCard className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
                            <SectionBody>
                                <div className="text-center space-y-3">
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveTemplate}
                                        disabled={saving}
                                        className="w-full py-3 text-base"
                                    >
                                        {saving ? '⏳ Saving Template...' : '💾 Save Template'}
                                    </Button>
                                    <p className="text-xs text-slate-600 flex items-center justify-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Preview auto-updates as you type
                                    </p>
                                </div>
                            </SectionBody>
                        </SectionCard>
                    </div>

                    {/* RIGHT COLUMN - Preview & Send (4 cols) */}
                    <div className="xl:col-span-4 space-y-5">
                        {/* Live Preview */}
                        <SectionCard>
                            <SectionHeader 
                                icon="👁" 
                                title="Live Preview"
                                action={
                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Auto-updating
                                    </span>
                                }
                            />
                            <SectionBody className="p-0">
                                <div className="bg-slate-50" style={{ height: '500px' }}>
                                    {previewHtml ? (
                                        <iframe
                                            srcDoc={previewHtml}
                                            className="w-full h-full"
                                            title="Email Preview"
                                            style={{ border: 'none' }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                            <div className="text-6xl mb-4">📧</div>
                                            <p className="text-sm font-semibold text-slate-500">Preview Loading...</p>
                                            <p className="text-xs mt-2 text-slate-400">Start editing to see changes</p>
                                        </div>
                                    )}
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Send Campaign */}
                        <SectionCard>
                            <SectionHeader icon="🚀" title="Send Campaign" />
                            <SectionBody>
                                <div className="space-y-3">
                                    {/* Trial Send */}
                                    <div>
                                        <Button
                                            variant="warning"
                                            onClick={() => setShowTrialList(!showTrialList)}
                                            className="w-full justify-between"
                                        >
                                            <span>🧪 Send Trial</span>
                                            <span className="bg-yellow-600 px-2.5 py-1 rounded-md text-xs font-bold">
                                                {trialRecipients.length}
                                            </span>
                                        </Button>
                                        
                                        {showTrialList && (
                                            <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                                <p className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                                                    <span>📋</span> Trial Recipients ({trialRecipients.length})
                                                </p>
                                                <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                                                    {trialRecipients.map((r, idx) => (
                                                        <div key={idx} className="text-xs bg-white px-3 py-2 rounded border border-yellow-200 flex items-start gap-2">
                                                            <span className="font-semibold text-yellow-700">{idx + 1}.</span>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-slate-700">{r.name}</div>
                                                                <div className="text-slate-500">{r.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="warning"
                                                        onClick={handleSendTrial}
                                                        disabled={sending}
                                                        className="flex-1 text-sm"
                                                    >
                                                        {sending ? '⏳ Sending...' : '✓ Confirm Send'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowTrialList(false)}
                                                        className="text-sm px-4"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Production Send */}
                                    {allowProduction && (
                                        <div>
                                            <Button
                                                variant="danger"
                                                onClick={async () => {
                                                    if (!showProductionWarning) {
                                                        setLoadingProductionList(true);
                                                        try {
                                                            const response = await window.axios.get('/api/admin/email-blast/production-recipients');
                                                            setProductionRecipients(response.data.data || []);
                                                        } catch (error) {
                                                            setMessage({ type: 'error', text: 'Failed to load production recipients' });
                                                        }
                                                        setLoadingProductionList(false);
                                                    }
                                                    setShowProductionWarning(!showProductionWarning);
                                                }}
                                                disabled={loadingProductionList}
                                                className="w-full justify-between"
                                            >
                                                <span>⚡ Send to ALL Buyers</span>
                                                <span className="bg-red-700 px-2.5 py-1 rounded-md text-xs font-bold">
                                                    {loadingProductionList ? '...' : productionCount}
                                                </span>
                                            </Button>
                                            
                                            {showProductionWarning && (
                                                <div className="mt-3 p-5 bg-red-50 border-4 border-red-500 rounded-lg shadow-lg">
                                                    {/* HEADER PERINGATAN BESAR */}
                                                    <div className="bg-red-600 text-white px-4 py-3 rounded-lg mb-4 text-center">
                                                        <p className="text-lg font-black mb-1 flex items-center justify-center gap-2">
                                                            <span className="text-2xl">🚨</span>
                                                            <span>PERINGATAN KRITIS!</span>
                                                            <span className="text-2xl">🚨</span>
                                                        </p>
                                                        <p className="text-sm font-bold">PRODUCTION MODE - TIDAK BISA DIBATALKAN!</p>
                                                    </div>

                                                    {/* INFORMASI DETAIL */}
                                                    <div className="bg-white border-2 border-red-400 rounded-lg p-4 mb-4">
                                                        <p className="text-sm font-bold text-red-900 mb-3">
                                                            ⚠️ Anda akan mengirim email ke:
                                                        </p>
                                                        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 mb-3">
                                                            <p className="text-2xl font-black text-red-800 text-center">
                                                                {productionRecipients.length} PEMBELI TIKET
                                                            </p>
                                                        </div>
                                                        <ul className="text-xs text-red-800 space-y-1.5 ml-4 list-disc">
                                                            <li><strong>Email akan langsung terkirim ke SEMUA pembeli</strong></li>
                                                            <li><strong>TIDAK ADA cara untuk membatalkan setelah dikirim</strong></li>
                                                            <li><strong>Kesalahan konten akan dilihat semua orang</strong></li>
                                                            <li><strong>Pastikan Subject, Isi, dan Detail sudah 100% BENAR</strong></li>
                                                        </ul>
                                                    </div>
                                                    
                                                    {/* Recipient List */}
                                                    <div className="mb-4 max-h-40 overflow-y-auto bg-white border-2 border-red-300 rounded-lg p-3">
                                                        <p className="text-xs font-bold text-red-900 mb-2 sticky top-0 bg-white pb-2 border-b-2 border-red-200">
                                                            📋 Daftar Penerima ({productionRecipients.length}):
                                                        </p>
                                                        {productionRecipients.map((email, idx) => (
                                                            <div key={idx} className="text-xs text-slate-700 py-1.5 px-2 border-b border-red-100 last:border-0 flex gap-2 hover:bg-red-50">
                                                                <span className="text-red-600 font-bold">{idx + 1}.</span>
                                                                <span className="flex-1 font-medium">{email}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* KONFIRMASI KODE */}
                                                    <div className="bg-yellow-50 border-3 border-yellow-400 rounded-lg p-4 mb-4">
                                                        <p className="text-sm font-black text-yellow-900 mb-2 text-center">
                                                            🔐 MASUKKAN KODE KONFIRMASI
                                                        </p>
                                                        <p className="text-xs text-yellow-800 mb-3 text-center">
                                                            Untuk melanjutkan, ketik kode berikut:
                                                        </p>
                                                        <div className="bg-white border-2 border-yellow-500 rounded-lg p-3 mb-3">
                                                            <p className="text-2xl font-mono font-black text-center text-yellow-900 tracking-widest">
                                                                22112025
                                                            </p>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={confirmationCode}
                                                            onChange={(e) => setConfirmationCode(e.target.value)}
                                                            placeholder="Ketik kode konfirmasi di sini..."
                                                            className="w-full px-4 py-3 text-center text-lg font-mono font-bold border-3 border-yellow-400 rounded-lg focus:border-red-500 focus:ring-4 focus:ring-red-200 transition"
                                                            maxLength={8}
                                                        />
                                                        {confirmationCode && confirmationCode !== '22112025' && (
                                                            <p className="text-xs text-red-600 font-bold mt-2 text-center">
                                                                ❌ Kode salah! Periksa kembali.
                                                            </p>
                                                        )}
                                                        {confirmationCode === '22112025' && (
                                                            <p className="text-xs text-green-600 font-bold mt-2 text-center">
                                                                ✓ Kode benar! Anda dapat melanjutkan.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* TOMBOL AKSI */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="danger"
                                                            onClick={handleSendProduction}
                                                            disabled={sending || confirmationCode !== '22112025'}
                                                            className="flex-1 text-sm py-3 font-black"
                                                        >
                                                            {sending ? '⏳ MENGIRIM...' : '🚀 SAYA PAHAM RISIKONYA, KIRIM SEKARANG!'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowProductionWarning(false);
                                                                setConfirmationCode('');
                                                            }}
                                                            className="text-sm px-4 py-3 font-semibold"
                                                        >
                                                            ❌ Batal
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </SectionBody>
                        </SectionCard>

                        {/* Last Sent Recipients */}
                        {lastSentRecipients.length > 0 && (
                            <SectionCard className="bg-green-50 border-green-200">
                                <SectionHeader 
                                    icon="📬" 
                                    title={`Last Send (${lastSentRecipients.length} recipients)`}
                                />
                                <SectionBody>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {lastSentRecipients.map((email, idx) => (
                                            <div key={idx} className="text-xs bg-white px-3 py-2 rounded-lg border border-green-200 flex gap-2">
                                                <span className="font-semibold text-green-700">{idx + 1}.</span>
                                                <span className="flex-1 text-slate-700">{email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SectionBody>
                            </SectionCard>
                        )}

                        {/* Recent Sends Log */}
                        <SectionCard>
                            <SectionHeader icon="📜" title="Recent Sends" />
                            <SectionBody>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p className="text-sm font-medium">No sends yet</p>
                                            <p className="text-xs mt-1">History will appear here</p>
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm text-slate-800">{log.subject}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {log.mode === 'trial' ? '🧪 Trial' : '⚡ Production'} • 
                                                            {' '}{new Date(log.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        log.status === 'sent' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {log.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                                                    </span>
                                                </div>
                                                {log.intended_recipients && Array.isArray(log.intended_recipients) && log.intended_recipients.length > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: !prev[log.id] }))}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-2 flex items-center gap-1"
                                                        >
                                                            <span>{expandedLogs[log.id] ? '▼' : '▶'}</span>
                                                            <span>View {log.intended_recipients.length} recipients</span>
                                                        </button>
                                                        {expandedLogs[log.id] && (
                                                            <div className="mt-3 p-3 bg-white rounded border border-slate-200 max-h-40 overflow-y-auto">
                                                                {log.intended_recipients.map((email, idx) => (
                                                                    <div key={idx} className="text-xs text-slate-600 py-1.5 border-b border-slate-100 last:border-0">
                                                                        <span className="font-semibold text-slate-400">{idx + 1}.</span> {email}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </SectionBody>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
