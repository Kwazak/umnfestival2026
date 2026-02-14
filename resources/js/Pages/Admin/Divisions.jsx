import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function AdminDivisions({ auth }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  // Disable create: form requires choosing an existing item to edit
  const [form, setForm] = useState({
    sort_order: 0,
    name: '',
    title: '',
    image: '',
    description1: '',
    description2: '',
    is_active: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/divisions', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
      setItems(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ sort_order: 0, name: '', title: '', image: '', description1: '', description2: '', is_active: true });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      if (!editingId) {
        setError('Pilih item dari list untuk diedit. Fitur create dimatikan.');
        setSaving(false);
        return;
      }
      const url = `/api/admin/divisions/${editingId}`;
      const method = 'PUT';
      const res = await fetch(url, {
        method,
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
        if (res.status === 422 && data.errors) {
          throw new Error(Object.values(data.errors).flat()[0] || 'Validation error');
        }
        throw new Error(data.message || 'Failed to save');
      }
      await fetchItems();
      resetForm();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      sort_order: item.sort_order ?? 0,
      name: item.name ?? '',
      title: item.title ?? '',
      image: item.image ?? '',
      description1: item.description1 ?? '',
      description2: item.description2 ?? '',
      is_active: Boolean(item.is_active),
    });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this division?')) return;
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(`/api/admin/divisions/${id}`, {
        method: 'DELETE',
        headers: { ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to delete');
      await fetchItems();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout title="Divisions" subtitle="Manage About Us Divisions" auth={auth}>
      <div className="space-y-6 p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Divisions</h2>
            <p className="text-gray-600">Create, edit, and order About Us divisions</p>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 pt-5 pb-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Edit Division</h3>
              </div>
              <div className="px-5 pb-5 space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input type="number" name="sort_order" value={form.sort_order} onChange={onChange} min={0} className="w-full rounded-md border border-gray-300 p-2.5" required />
                  </div>
                  <div className="flex items-center gap-3">
                    <input id="is_active" type="checkbox" checked={form.is_active} onChange={(e)=>setForm(f=>({...f,is_active:e.target.checked}))} />
                    <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" value={form.name} onChange={onChange} className="w-full rounded-md border border-gray-300 p-2.5" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" value={form.title} onChange={onChange} className="w-full rounded-md border border-gray-300 p-2.5" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input name="image" value={form.image} onChange={onChange} placeholder="https://.../image.png" className="w-full rounded-md border border-gray-300 p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description 1</label>
                  <textarea name="description1" value={form.description1} onChange={onChange} rows={3} className="w-full rounded-md border border-gray-300 p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description 2</label>
                  <textarea name="description2" value={form.description2} onChange={onChange} rows={3} className="w-full rounded-md border border-gray-300 p-2.5" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving || !editingId} className="px-4 py-2 rounded-md bg-[#FFC22F] hover:bg-[#E6A826] text-white disabled:opacity-60">{saving ? 'Saving...' : 'Update'}</button>
                  {/* No create, no cancel */}
                </div>
              </div>
            </form>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Current Divisions</h3>
              </div>
              <div className="divide-y">
                {items.length === 0 ? (
                  <div className="p-5 text-gray-500">No divisions yet.</div>
                ) : items.map((it) => (
                  <div key={it.id} className="p-5 flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border {it.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}">
                          {it.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">Order: {it.sort_order}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{it.name}</h4>
                      <div className="text-sm text-gray-600">{it.title}</div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{it.description1}</p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{it.description2}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => onEdit(it)} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}