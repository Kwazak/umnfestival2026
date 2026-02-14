import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const GuestStars = () => {
    const [guestStars, setGuestStars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        sort_order: '',
        name: '',
        image: '',
        below_image: '',
        is_revealed: false
    });

    // Fetch guest stars from API
    const fetchGuestStars = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/guest-stars');
            const data = await response.json();
            
            if (data.success) {
                setGuestStars(data.data);
            } else {
                throw new Error('Failed to fetch guest stars');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuestStars();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingId ? `/api/guest-stars/${editingId}` : '/api/guest-stars';
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
                await fetchGuestStars(); // Refresh the list
                resetForm();
                alert(editingId ? 'Guest star updated successfully!' : 'Guest star created successfully!');
            } else {
                throw new Error(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this guest star?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/guest-stars/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchGuestStars(); // Refresh the list
                alert('Guest star deleted successfully!');
            } else {
                throw new Error(data.message || 'Delete failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle edit
    const handleEdit = (guestStar) => {
        setEditingId(guestStar.id);
        setFormData({
            sort_order: guestStar.sort_order,
            name: guestStar.name,
            image: guestStar.image || '',
            below_image: guestStar.below_image || '',
            is_revealed: guestStar.is_revealed
        });
    };

    // Reset form
    const resetForm = () => {
        setEditingId(null);
        setFormData({
            sort_order: '',
            name: '',
            image: '',
            below_image: '',
            is_revealed: false
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Guest Stars Management" subtitle="Manage festival guest stars and artists">
                <Head title="Guest Stars Management" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Guest Stars Management" subtitle="Manage festival guest stars and artists">
            <Head title="Guest Stars Management" />
            <div className="max-w-6xl mx-auto">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        Error: {error}
                    </div>
                )}

                {/* Add/Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Guest Star' : 'Add New Guest Star'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                    max="3"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Main Image URL (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://umnfestival.com/uploads/guest-stars/artist-name.png"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Below Image URL (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.below_image}
                                onChange={(e) => setFormData({...formData, below_image: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://umnfestival.com/uploads/guest-stars/artist-text.png"
                            />
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_revealed"
                                checked={formData.is_revealed}
                                onChange={(e) => setFormData({...formData, is_revealed: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_revealed" className="ml-2 block text-sm text-gray-900">
                                Is Revealed (show the guest star publicly)
                            </label>
                        </div>
                        
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editingId ? 'Update' : 'Create'} Guest Star
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

                {/* Guest Stars List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Current Guest Stars</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Images
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guestStars.map((guestStar) => (
                                    <tr key={guestStar.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {guestStar.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {guestStar.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                guestStar.is_revealed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {guestStar.is_revealed ? 'Revealed' : 'Coming Soon'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div>Main: {guestStar.image ? '✓' : '✗'}</div>
                                                <div>Below: {guestStar.below_image ? '✓' : '✗'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(guestStar)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(guestStar.id)}
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
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
                    <ul className="text-blue-800 space-y-1">
                        <li>• Maximum 3 guest stars allowed (sort order 1-3)</li>
                        <li>• Upload images manually to Hostinger, then paste the URL here</li>
                        <li>• Main image appears in the circular area when revealed</li>
                        <li>• Below image appears as text/logo below the circle</li>
                        <li>• Use "Coming Soon" for unrevealed guest stars</li>
                        <li>• Images should be optimized for web (PNG/JPG, max 1MB)</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default GuestStars;