import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function AdminHeroSection({ auth }) {
  const [form, setForm] = useState({
    title_text: '',
    event_text_line1: '',
    event_text_line2: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/hero-section', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
        if (!isMounted) return;
        setForm({
          title_text: data.data.title_text || '',
          event_text_line1: data.data.event_text_line1 || '',
          event_text_line2: data.data.event_text_line2 || '',
          is_active: Boolean(data.data.is_active),
        });
  setValidation({});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    setValidation({});
    try {
      // Get CSRF token from meta tag (required for routes protected by web middleware)
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch('/api/admin/hero-section', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        // Laravel validation 422 support
        if (res.status === 422 && data.errors) {
          setValidation(data.errors);
          throw new Error('Please correct the highlighted fields.');
        }
        throw new Error(data.message || 'Failed to save');
      }
      setMessage('Saved');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Hero Section" subtitle="Manage hero texts for the home page" auth={auth}>
      <div className="space-y-6 p-6">
        {/* Page header (aligned with other admin pages) */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hero Section</h2>
            <p className="text-gray-600">Update the texts displayed under the hero image</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-64 bg-gray-100 rounded mb-6" />
              <div className="h-10 bg-gray-100 rounded mb-4" />
              <div className="h-10 bg-gray-100 rounded mb-4" />
              <div className="h-10 bg-gray-100 rounded mb-6" />
              <div className="h-9 w-28 bg-gray-200 rounded" />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-64 bg-gray-100 rounded mb-6" />
              <div className="h-40 bg-gray-100 rounded" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Card */}
            <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 pt-5 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🖊️</span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Hero Content</h3>
                    <p className="text-xs text-gray-500">Texts shown below the hero image on the home page</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-5">
                {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
                {message && <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title Text</label>
                  <input
                    name="title_text"
                    value={form.title_text}
                    onChange={onChange}
                    className={`w-full rounded-md bg-white border ${validation.title_text ? 'border-red-500' : 'border-gray-300'} p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition`}
                    maxLength={255}
                    placeholder="e.g., UPCOMING EVENT U-CARE"
                    required
                  />
                  {validation.title_text && <p className="mt-1 text-xs text-red-600">{validation.title_text?.[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Text Line 1</label>
                  <input
                    name="event_text_line1"
                    value={form.event_text_line1}
                    onChange={onChange}
                    className={`w-full rounded-md bg-white border ${validation.event_text_line1 ? 'border-red-500' : 'border-gray-300'} p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition`}
                    maxLength={255}
                    placeholder="e.g., Event at 27 September 2025 Lobby B,"
                    required
                  />
                  {validation.event_text_line1 && <p className="mt-1 text-xs text-red-600">{validation.event_text_line1?.[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Text Line 2</label>
                  <input
                    name="event_text_line2"
                    value={form.event_text_line2}
                    onChange={onChange}
                    className={`w-full rounded-md bg-white border ${validation.event_text_line2 ? 'border-red-500' : 'border-gray-300'} p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition`}
                    maxLength={255}
                    placeholder="e.g., Universitas Multimedia Nusantara"
                    required
                  />
                  {validation.event_text_line2 && <p className="mt-1 text-xs text-red-600">{validation.event_text_line2?.[0]}</p>}
                </div>

                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Active</p>
                    <p className="text-xs text-gray-500">Show or hide texts on the home page</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={form.is_active} onChange={() => setForm(f => ({ ...f, is_active: !f.is_active }))} />
                    <div className={`w-11 h-6 bg-gray-300 rounded-full p-1 transition ${form.is_active ? '!bg-green-500' : ''}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${form.is_active ? 'translate-x-5' : ''}`} />
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-[#FFC22F] hover:bg-[#E6A826] text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f }))}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            {/* Preview Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 pt-5 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👁️</span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Live Preview</h3>
                    <p className="text-xs text-gray-500">How the hero texts will appear</p>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm select-none">
                    Hero Image (preview)
                  </div>
                  <div className="p-4">
                    {form.is_active ? (
                      <h3 className="text-center text-[#0E0070] font-bold text-lg md:text-2xl lg:text-3xl leading-snug">
                        {form.title_text || 'UPCOMING EVENT U-CARE'}<br />
                        {form.event_text_line1 || 'Event at 27 September 2025 Lobby B,'}<br />
                        {form.event_text_line2 || 'Universitas Multimedia Nusantara'}
                      </h3>
                    ) : (
                      <p className="text-center text-gray-500">Texts hidden (inactive)</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                  Note: This editor controls texts only. The hero image is static and optimized separately.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
