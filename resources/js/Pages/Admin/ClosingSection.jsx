import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const ClosingSection = () => {
    const [closingSections, setClosingSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        image_url: 'https://umnfestival.com/uploads/eulympicpromotional.png',
        head_text: '',
        content_text: '',
        button1_text: '',
        button1_link: '',
        button2_text: '',
        button2_link: '',
        is_active: false
    });

    // Fetch closing sections from API
    const fetchClosingSections = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/closing-sections');
            const data = await response.json();
            
            if (data.success) {
                setClosingSections(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch closing sections');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClosingSections();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingId ? `/api/closing-section/${editingId}` : '/api/closing-section';
            const method = editingId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchClosingSections(); // Refresh the list
                resetForm();
                alert(editingId ? 'Closing section updated successfully!' : 'Closing section created successfully!');
            } else {
                throw new Error(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this closing section?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/closing-section/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchClosingSections(); // Refresh the list
                alert('Closing section deleted successfully!');
            } else {
                throw new Error(data.message || 'Delete failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle edit
    const handleEdit = (closingSection) => {
        setEditingId(closingSection.id);
        setFormData({
            image_url: closingSection.image_url || 'https://umnfestival.com/uploads/eulympicpromotional.png',
            head_text: closingSection.head_text || '',
            content_text: closingSection.content_text || '',
            button1_text: closingSection.button1_text || '',
            button1_link: closingSection.button1_link || '',
            button2_text: closingSection.button2_text || '',
            button2_link: closingSection.button2_link || '',
            is_active: closingSection.is_active || false
        });
    };

    // Reset form
    const resetForm = () => {
        setEditingId(null);
        setFormData({
            image_url: 'https://umnfestival.com/uploads/eulympicpromotional.png',
            head_text: '',
            content_text: '',
            button1_text: '',
            button1_link: '',
            button2_text: '',
            button2_link: '',
            is_active: false
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Closing Section Management" subtitle="Manage website closing section content">
                <Head title="Closing Section Management" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Closing Section Management" subtitle="Manage website closing section content">
            <Head title="Closing Section Management" />
            <div className="max-w-6xl mx-auto">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        Error: {error}
                    </div>
                )}

                {/* Add/Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Closing Section' : 'Add New Closing Section'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="https://umnfestival.com/uploads/eulympicpromotional.png"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Head Text
                                </label>
                                <input
                                    type="text"
                                    value={formData.head_text}
                                    onChange={(e) => setFormData({...formData, head_text: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="E-ULYMPIC 2025"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content Text (supports line breaks)
                            </label>
                            <textarea
                                value={formData.content_text}
                                onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                rows="6"
                                placeholder="E-Ulympic merupakan kegiatan yang bertujuan untuk memperluas dan mencari bakat mahasiswa/i UMN maupun di luar UMN dalam perlombaan cabang olahraga E-Sport.

Open Registration : 6 – 16 May 2025
Terbuka untuk 64 Teams Mahasiswa, SMA / Sederajat

Event Day : 19 – 23 May 2025
Venue : Lobby B, Universitas Multimedia Nusantara"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button 1 Text
                                </label>
                                <input
                                    type="text"
                                    value={formData.button1_text}
                                    onChange={(e) => setFormData({...formData, button1_text: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="Daftar Sekarang"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button 1 Link
                                </label>
                                <input
                                    type="text"
                                    value={formData.button1_link}
                                    onChange={(e) => setFormData({...formData, button1_link: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="#"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button 2 Text
                                </label>
                                <input
                                    type="text"
                                    value={formData.button2_text}
                                    onChange={(e) => setFormData({...formData, button2_text: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="Pelajari Lebih Lanjut"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button 2 Link
                                </label>
                                <input
                                    type="text"
                                    value={formData.button2_link}
                                    onChange={(e) => setFormData({...formData, button2_link: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="#"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Is Active (show this section on the website)
                            </label>
                        </div>
                        
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editingId ? 'Update' : 'Create'} Closing Section
                            </button>
                            
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Closing Sections List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Current Closing Sections</h2>
                    </div>
                    
                    {closingSections.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No closing sections found. Create one above.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Head Text
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Buttons
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {closingSections.map((section) => (
                                        <tr key={section.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {section.head_text}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    section.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {section.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div>1: {section.button1_text}</div>
                                                    <div>2: {section.button2_text}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(section.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(section)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(section.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
                    <ul className="text-blue-800 space-y-1">
                        <li>• Only one closing section can be active at a time</li>
                        <li>• Upload images manually to Hostinger, then paste the URL here</li>
                        <li>• Content text supports line breaks - just press Enter for new lines</li>
                        <li>• Button links can be internal (#section) or external (https://...)</li>
                        <li>• Images should be optimized for web (PNG/JPG, max 1MB)</li>
                        <li>• Default image: https://umnfestival.com/uploads/eulympicpromotional.png</li>
                        <li>• Remember to set "Is Active" to show the section on the website</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ClosingSection;