import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Countdown = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        event_key: '',
        name: '',
        target_date: '',
        bg_color: '#42B5B5',
        sort_order: '',
        is_active: true
    });

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/countdown-events');
            const data = await response.json();
            
            if (data.success) {
                // Get detailed event data for admin
                const adminEvents = [];
                for (let i = 0; i < data.data.length; i++) {
                    try {
                        const detailResponse = await fetch(`/api/countdown-events/${i + 1}`);
                        const detailData = await detailResponse.json();
                        if (detailData.success) {
                            adminEvents.push(detailData.data);
                        }
                    } catch (detailError) {
                        console.error(`Error fetching detail for event ${i + 1}:`, detailError);
                    }
                }
                setEvents(adminEvents);
            } else {
                console.error('Failed to fetch events:', data.message);
                alert('Failed to load events: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            alert('Error loading events. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingEvent 
                ? `/api/countdown-events/${editingEvent.id}`
                : '/api/countdown-events';
            
            const method = editingEvent ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert(editingEvent ? 'Countdown event updated successfully!' : 'Countdown event created successfully!');
                setShowForm(false);
                setEditingEvent(null);
                resetForm();
                fetchEvents();
            } else {
                alert('Error: ' + (data.message || 'Something went wrong'));
                if (data.errors) {
                    console.error('Validation errors:', data.errors);
                }
            }
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Error saving event');
        }
    };

    // Handle edit
    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            event_key: event.event_key,
            name: event.name,
            target_date: event.target_date ? new Date(event.target_date).toISOString().slice(0, 16) : '',
            bg_color: event.bg_color || '#42B5B5',
            sort_order: event.sort_order,
            is_active: event.is_active
        });
        setShowForm(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this countdown event?')) return;

        try {
            const response = await fetch(`/api/countdown-events/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('Countdown event deleted successfully!');
                fetchEvents();
            } else {
                alert('Error deleting countdown event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Error deleting countdown event');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            event_key: '',
            name: '',
            target_date: '',
            bg_color: '#42B5B5',
            sort_order: '',
            is_active: true
        });
    };

    // Handle add new
    const handleAddNew = () => {
        setEditingEvent(null);
        resetForm();
        // Auto-suggest next sort order
        const maxOrder = Math.max(...events.map(e => e.sort_order || 0), 0);
        setFormData(prev => ({ ...prev, sort_order: maxOrder + 1 }));
        setShowForm(true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Check if event has passed
    const hasEventPassed = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    if (loading) {
        return (
            <AdminLayout title="Countdown Management" subtitle="Manage countdown events for the home page">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading countdown events...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Countdown Management" subtitle="Manage countdown events for the home page">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Countdown Events Management</h1>
                        <p className="text-gray-600 mt-1">Manage countdown events displayed on the home page</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={fetchEvents}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                            disabled={loading}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Event
                        </button>
                    </div>
                </div>

                {/* Events Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {events.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No countdown events</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new countdown event.</p>
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNew}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Countdown Event
                                </button>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event) => (
                                    <tr key={event.id} className={hasEventPassed(event.target_date) ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {event.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                                <div className="text-sm text-gray-500">Key: {event.event_key}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className={hasEventPassed(event.target_date) ? 'text-red-600' : 'text-gray-900'}>
                                                    {formatDate(event.target_date)}
                                                </div>
                                                {hasEventPassed(event.target_date) && (
                                                    <div className="text-xs text-red-500">Passed</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div 
                                                    className="w-6 h-6 rounded border border-gray-300 mr-2"
                                                    style={{ backgroundColor: event.bg_color }}
                                                ></div>
                                                <span className="text-xs font-mono">{event.bg_color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                event.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {event.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingEvent ? 'Edit Countdown Event' : 'Add New Countdown Event'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Event Key</label>
                                            <input
                                                type="text"
                                                value={formData.event_key}
                                                onChange={(e) => setFormData({...formData, event_key: e.target.value})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="e.g., ucare, unveiling"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Unique identifier for the event</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.sort_order}
                                                onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Event Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., U Care 2025"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Target Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.target_date}
                                            onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Background Color</label>
                                        <div className="mt-1 flex items-center space-x-3">
                                            <input
                                                type="color"
                                                value={formData.bg_color}
                                                onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                                                className="h-10 w-20 border border-gray-300 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                value={formData.bg_color}
                                                onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                                                placeholder="#42B5B5"
                                                pattern="^#[0-9A-Fa-f]{6}$"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Hex color code for the countdown background</p>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active (show in countdown rotation)
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingEvent(null);
                                                resetForm();
                                            }}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            {editingEvent ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Countdown;