import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function DiscountCodes() {
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_percentage: 15,
        quota: 100,
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDiscountCodes();
    }, []);

    const fetchDiscountCodes = async () => {
        try {
            const response = await fetch('/api/discount-codes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            console.log('API Response:', data); // Debug log
            if (data.success && data.data && Array.isArray(data.data.discount_codes)) {
                setDiscountCodes(data.data.discount_codes);
            } else {
                console.error('Invalid response format:', data);
                setDiscountCodes([]);
            }
        } catch (error) {
            console.error('Error fetching discount codes:', error);
            setDiscountCodes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const url = editingCode 
                ? `/api/discount-codes/${editingCode.id}`
                : '/api/discount-codes';
            
            const method = editingCode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchDiscountCodes();
                setShowModal(false);
                setEditingCode(null);
                setFormData({
                    code: '',
                    discount_percentage: 15,
                    quota: 100,
                    is_active: true
                });
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    alert(data.message || 'Error saving discount code');
                }
            }
        } catch (error) {
            console.error('Error saving discount code:', error);
            alert('Error saving discount code');
        }
    };

    const handleEdit = (code) => {
        setEditingCode(code);
        setFormData({
            code: code.code,
            discount_percentage: code.discount_percentage,
            quota: code.quota,
            is_active: code.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this discount code?')) {
            return;
        }

        try {
            const response = await fetch(`/api/discount-codes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });

            const data = await response.json();

            if (data.success) {
                await fetchDiscountCodes();
            } else {
                alert(data.message || 'Error deleting discount code');
            }
        } catch (error) {
            console.error('Error deleting discount code:', error);
            alert('Error deleting discount code');
        }
    };

    const handleRecalculateUsage = async (id) => {
        try {
            const response = await fetch(`/api/discount-codes/recalculate-usage`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });

            const data = await response.json();

            if (data.success) {
                await fetchDiscountCodes();
                alert('Usage count recalculated successfully');
            } else {
                alert(data.message || 'Error recalculating usage');
            }
        } catch (error) {
            console.error('Error recalculating usage:', error);
            alert('Error recalculating usage');
        }
    };

    const openCreateModal = () => {
        setEditingCode(null);
        setFormData({
            code: '',
            discount_percentage: 15,
            quota: 100,
            is_active: true
        });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCode(null);
        setErrors({});
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Discount Code Management</h1>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Create New Code
                    </button>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount %
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
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
                                {Array.isArray(discountCodes) && discountCodes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {code.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {code.discount_percentage}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {code.used_count} / {code.quota}
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${Math.min((code.used_count / code.quota) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                code.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {code.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(code.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(code)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRecalculateUsage(code.id)}
                                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                            >
                                                Recalc
                                            </button>
                                            <button
                                                onClick={() => handleDelete(code.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                disabled={code.used_count > 0}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {discountCodes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">No discount codes found</div>
                            <button
                                onClick={openCreateModal}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Create Your First Code
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingCode ? 'Edit Discount Code' : 'Create New Discount Code'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.code ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="e.g., SAVE15"
                                        />
                                        {errors.code && (
                                            <p className="text-red-500 text-sm mt-1">{errors.code[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Percentage *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="0.01"
                                            value={formData.discount_percentage}
                                            onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value)})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.discount_percentage && (
                                            <p className="text-red-500 text-sm mt-1">{errors.discount_percentage[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quota *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quota}
                                            onChange={(e) => setFormData({...formData, quota: parseInt(e.target.value)})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.quota ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.quota && (
                                            <p className="text-red-500 text-sm mt-1">{errors.quota[0]}</p>
                                        )}
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
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            {editingCode ? 'Update' : 'Create'}
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
}