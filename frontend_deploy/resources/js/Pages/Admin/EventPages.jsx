import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function AdminEventPages({ auth }) {
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('unveiling');

  const pageNames = ['unveiling', 'eulympic', 'ucare', 'ulympic', 'unify'];
  const pageLabels = {
    unveiling: 'Unveiling',
    eulympic: 'E-Ulympic',
    ucare: 'U-Care',
    ulympic: 'U-lympic',
    unify: 'Unify'
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/event-pages', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
        if (!isMounted) return;
        setPages(data.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const updatePage = (pageName, field, value) => {
    setPages(prev => ({
      ...prev,
      [pageName]: {
        ...prev[pageName],
        [field]: value
      }
    }));
  };

  const updateImageArray = (pageName, index, value) => {
    setPages(prev => {
      const newImages = [...(prev[pageName]?.unveiling_images || [])];
      newImages[index] = value;
      return {
        ...prev,
        [pageName]: {
          ...prev[pageName],
          unveiling_images: newImages
        }
      };
    });
  };

  const addImage = (pageName) => {
    setPages(prev => ({
      ...prev,
      [pageName]: {
        ...prev[pageName],
        unveiling_images: [...(prev[pageName]?.unveiling_images || []), '']
      }
    }));
  };

  const removeImage = (pageName, index) => {
    setPages(prev => {
      const newImages = [...(prev[pageName]?.unveiling_images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        [pageName]: {
          ...prev[pageName],
          unveiling_images: newImages
        }
      };
    });
  };

  const onSubmit = async (e, pageName) => {
    e.preventDefault();
    setSaving(prev => ({ ...prev, [pageName]: true }));
    setError('');
    setMessage('');
    
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(`/api/admin/event-pages/${pageName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(pages[pageName]),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to save');
      }
      setMessage(`${pageLabels[pageName]} page updated successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(prev => ({ ...prev, [pageName]: false }));
    }
  };

  const renderPageForm = (pageName) => {
    const page = pages[pageName] || {};
    const images = page.unveiling_images || [];

    return (
      <form onSubmit={(e) => onSubmit(e, pageName)} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 pt-5 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎪</span>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{pageLabels[pageName]} Event Page</h3>
              <p className="text-xs text-gray-500">Configure content and settings for the {pageLabels[pageName]} event page</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5">
          {/* Active Status */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
            <div>
              <p className="text-sm text-gray-900 font-medium">Page Active</p>
              <p className="text-xs text-gray-500">Show page content or display under construction</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={page.is_active || false} 
                onChange={(e) => updatePage(pageName, 'is_active', e.target.checked)} 
              />
              <div className={`w-11 h-6 bg-gray-300 rounded-full p-1 transition ${page.is_active ? '!bg-green-500' : ''}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${page.is_active ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={page.bg_color || '#FFC22F'}
                onChange={(e) => updatePage(pageName, 'bg_color', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={page.bg_color || '#FFC22F'}
                onChange={(e) => updatePage(pageName, 'bg_color', e.target.value)}
                className="flex-1 rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
                placeholder="#FFC22F"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
            <input
              type="text"
              value={page.hero_src || ''}
              onChange={(e) => updatePage(pageName, 'hero_src', e.target.value)}
              className="w-full rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
              placeholder="Any format: URL, path, or text"
            />
          </div>

          {/* Paper Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Description Image URL</label>
            <input
              type="text"
              value={page.paper_src || ''}
              onChange={(e) => updatePage(pageName, 'paper_src', e.target.value)}
              className="w-full rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
              placeholder="Any format: URL, path, or text"
            />
          </div>

          {/* Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
              <button
                type="button"
                onClick={() => addImage(pageName)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Image
              </button>
            </div>
            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => updateImageArray(pageName, index, e.target.value)}
                    className="flex-1 rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
                    placeholder="Any format: URL, path, or text"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(pageName, index)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Image Section Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Section Background</label>
            <input
              type="text"
              value={page.image_section_bg || ''}
              onChange={(e) => updatePage(pageName, 'image_section_bg', e.target.value)}
              className="w-full rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
              placeholder="Any format: URL, path, color, or text"
            />
            <p className="text-xs text-gray-500 mt-1">Background for the image gallery section. Can be image URL, color code, or any CSS background value.</p>
          </div>

          
          {/* Sponsor Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor Image URL</label>
            <input
              type="text"
              value={page.sponsor_src || ''}
              onChange={(e) => updatePage(pageName, 'sponsor_src', e.target.value)}
              className="w-full rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
              placeholder="Any format: URL, path, or text"
            />
          </div>

          {/* Medpar Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Partner Image URL</label>
            <input
              type="text"
              value={page.medpar_src || ''}
              onChange={(e) => updatePage(pageName, 'medpar_src', e.target.value)}
              className="w-full rounded-md bg-white border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] transition"
              placeholder="Any format: URL, path, or text"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving[pageName]}
              className="px-4 py-2 rounded-md bg-[#FFC22F] hover:bg-[#E6A826] text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {saving[pageName] ? 'Saving...' : `Save ${pageLabels[pageName]}`}
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <AdminLayout title="Event Pages" subtitle="Manage content for all event pages" auth={auth}>
      <div className="space-y-6 p-6">
        {/* Page header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Pages Management</h2>
            <p className="text-gray-600">Configure content and settings for all event pages</p>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
        {message && <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-64 bg-gray-100 rounded mb-6" />
            <div className="h-10 bg-gray-100 rounded mb-4" />
            <div className="h-10 bg-gray-100 rounded mb-4" />
            <div className="h-10 bg-gray-100 rounded mb-6" />
            <div className="h-9 w-28 bg-gray-200 rounded" />
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {pageNames.map((pageName) => (
                  <button
                    key={pageName}
                    onClick={() => setActiveTab(pageName)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === pageName
                        ? 'border-[#FFC22F] text-[#FFC22F]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {pageLabels[pageName]}
                    {pages[pageName] && !pages[pageName].is_active && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Active Tab Content */}
            <div className="mt-6">
              {renderPageForm(activeTab)}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}