import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const TicketTypes = ({ auth }) => {
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        sort_order: '',
        type: '',
        header: '',
        price: '',
        button_text: 'COMING SOON',
        is_disabled: true,
        is_available: false,
        background_color: '#0E4280'
    });

    // Predefined color options
    const colorOptions = [
        { name: 'Blue', value: '#0E4280' },
        { name: 'Yellow', value: '#F3C019' },
        { name: 'Red', value: '#A42128' },
        { name: 'Teal', value: '#42B5B5' },
        { name: 'Orange', value: '#E34921' },
        { name: 'Purple', value: '#6B46C1' },
        { name: 'Green', value: '#059669' },
        { name: 'Pink', value: '#DB2777' },
    ];

    // Get next available sort order
    const getNextSortOrder = () => {
        const usedOrders = ticketTypes.map(t => t.sort_order);
        for (let i = 1; i <= 5; i++) {
            if (!usedOrders.includes(i)) {
                return i;
            }
        }
        return 1; // fallback
    };

    // Fetch ticket types from API
    const fetchTicketTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ticket-types');
            const data = await response.json();
            
            if (data.success) {
                setTicketTypes(data.data);
            } else {
                throw new Error('Failed to fetch ticket types');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketTypes();
    }, []);

    // Initialize form with next available sort order when data is loaded
    useEffect(() => {
        if (ticketTypes.length > 0 && !editingId && formData.sort_order === '') {
            setFormData(prev => ({
                ...prev,
                sort_order: getNextSortOrder()
            }));
        }
    }, [ticketTypes, editingId, formData.sort_order]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingId ? `/api/ticket-types/${editingId}` : '/api/ticket-types';
            const method = editingId ? 'PUT' : 'POST';
            
            // Prepare data - convert price to number if provided
            const submitData = {
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null
            };
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(submitData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchTicketTypes(); // Refresh the list
                resetForm();
                alert(editingId ? 'Ticket type updated successfully!' : 'Ticket type created successfully!');
            } else {
                throw new Error(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ticket type?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/ticket-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchTicketTypes(); // Refresh the list
                alert('Ticket type deleted successfully!');
            } else {
                throw new Error(data.message || 'Delete failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Handle edit - semua field akan terisi otomatis dengan data yang ada
    const handleEdit = (ticketType) => {
        setEditingId(ticketType.id);
        setFormData({
            sort_order: ticketType.sort_order,
            type: ticketType.type,
            header: ticketType.header,
            price: ticketType.price || '',
            button_text: ticketType.button_text,
            is_disabled: ticketType.is_disabled,
            is_available: ticketType.is_available,
            background_color: ticketType.background_color
        });
    };

    // Reset form - untuk add new dengan order otomatis
    const resetForm = () => {
        setEditingId(null);
        setFormData({
            sort_order: getNextSortOrder(),
            type: '',
            header: '',
            price: '',
            button_text: 'COMING SOON',
            is_disabled: true,
            is_available: false,
            background_color: '#0E4280'
        });
    };

    // Format price for display
    const formatPrice = (price) => {
        if (!price) return '-';
        return price;
    };

    if (loading) {
        return (
            <AdminLayout title="Ticket Types Management" auth={auth}>
                <Head title="Ticket Types Management" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Ticket Types Management" auth={auth}>
            <Head title="Ticket Types Management" />
            <div className="max-w-6xl mx-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        Error: {error}
                    </div>
                )}

                {/* Add/Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Ticket Type' : 'Add New Ticket Type'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort Order (1-5)
                                </label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                    max="5"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type (Unique ID)
                                </label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="e.g., early-bird"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.header}
                                    onChange={(e) => setFormData({...formData, header: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="e.g., Early Bird"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (IDR) - Leave empty for "Coming Soon"
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="1000"
                                    placeholder="e.g., 59000"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Text
                                </label>
                                <select
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="BUY TICKET">BUY TICKET</option>
                                    <option value="SOLD OUT">SOLD OUT</option>
                                    <option value="COMING SOON">COMING SOON</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Background Color
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({...formData, background_color: color.value})}
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            formData.background_color === color.value 
                                                ? 'border-gray-800' 
                                                : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={formData.background_color}
                                onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                                className="w-20 h-10 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_disabled"
                                    checked={formData.is_disabled}
                                    onChange={(e) => setFormData({...formData, is_disabled: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_disabled" className="ml-2 block text-sm text-gray-900">
                                    Is Disabled (button cannot be clicked)
                                </label>
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                                    Is Available (for purchase)
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editingId ? 'Update' : 'Create'} Ticket Type
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

                {/* Ticket Types List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Current Ticket Types</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type / Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Button
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Color
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ticketTypes.map((ticketType) => (
                                    <tr key={ticketType.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {ticketType.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{ticketType.header}</div>
                                            <div className="text-sm text-gray-500">{ticketType.type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatPrice(ticketType.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ticketType.button_text}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    ticketType.is_available 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {ticketType.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                                <br />
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    ticketType.is_disabled 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {ticketType.is_disabled ? 'Disabled' : 'Enabled'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div 
                                                    className="w-6 h-6 rounded border border-gray-300"
                                                    style={{ backgroundColor: ticketType.background_color }}
                                                />
                                                <span className="text-xs text-gray-500">{ticketType.background_color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(ticketType)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ticketType.id)}
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
                        <li>• Maximum 5 ticket types allowed (sort order 1-5)</li>
                        <li>• Type must be unique (used for internal identification)</li>
                        <li>• Price should be in IDR (Indonesian Rupiah)</li>
                        <li>• Leave price empty for "Coming Soon" tickets</li>
                        <li>• "Is Disabled" prevents button clicks</li>
                        <li>• "Is Available" controls purchase availability</li>
                        <li>• Background color affects the ticket card appearance</li>
                        <li>• Changes appear immediately on the public ticket page</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TicketTypes;