import React, { useState, useEffect } from 'react';

export default function ReferralCodeModal({ isOpen, onClose, referralCode = null, onSave }) {
    const [formData, setFormData] = useState({
        code: '',
        panitia_name: '',
        is_active: true
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (referralCode) {
                // Edit mode - populate with existing data
                setFormData({
                    code: referralCode.code,
                    panitia_name: referralCode.panitia_name,
                    is_active: referralCode.is_active
                });
            } else {
                // Create mode - empty code, user must input
                setFormData({
                    code: '',
                    panitia_name: '',
                    is_active: true
                });
            }
            setErrors({});
        }
    }, [isOpen, referralCode]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Referral code is required';
        } else if (formData.code.trim().length < 4) {
            newErrors.code = 'Referral code must be at least 4 characters';
        }
        if (!formData.panitia_name.trim()) {
            newErrors.panitia_name = 'Panitia name is required';
        } else if (formData.panitia_name.trim().length < 2) {
            newErrors.panitia_name = 'Panitia name must be at least 2 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
            };
            const result = await onSave(submitData);
            if (result && result.success) {
                onClose();
            } else if (result && result.message) {
                setErrors(prev => ({ ...prev, form: result.message }));
            } else {
                setErrors(prev => ({ ...prev, form: 'Unknown error occurred.' }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, form: 'Error saving referral code.' }));
            console.error('Error saving referral code:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-lg w-full shadow-2xl border border-white/20">
                {/* Modal Header */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] via-[#FFC22F] to-[#004E89] rounded-t-2xl opacity-10"></div>
                    <div className="relative px-8 py-6 border-b border-slate-200/50 flex justify-between items-center">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#004E89] bg-clip-text text-transparent">
                            {referralCode ? 'Edit Referral Code' : 'Create New Referral Code'}
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="w-8 h-8 bg-slate-100 hover:bg-red-100 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                    {errors.form && (
                        <div className="mb-4 text-red-600 text-sm font-semibold flex items-center">
                            <span className="mr-2">⚠️</span>{errors.form}
                        </div>
                    )}
                    {/* Editable Code */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Referral Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={e => handleInputChange('code', e.target.value)}
                            placeholder="Enter unique referral code"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 font-mono font-bold ${errors.code ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                            disabled={isSubmitting}
                        />
                        {errors.code && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.code}
                            </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Code must be unique and at least 4 characters</p>
                    </div>

                    {/* Panitia Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Panitia Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.panitia_name}
                            onChange={(e) => handleInputChange('panitia_name', e.target.value)}
                            placeholder="Enter panitia name"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#FFC22F] focus:border-[#FFC22F] text-slate-800 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 ${
                                errors.panitia_name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.panitia_name && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.panitia_name}
                            </p>
                        )}
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="w-5 h-5 text-[#FFC22F] border-slate-300 rounded focus:ring-[#FFC22F] focus:ring-2"
                                disabled={isSubmitting}
                            />
                            <div>
                                <span className="text-sm font-semibold text-slate-700">Active Status</span>
                                <p className="text-xs text-slate-500">Enable this referral code for use</p>
                            </div>
                        </label>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="px-8 py-6 border-t border-slate-200/50 flex justify-end space-x-4 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 text-slate-700 bg-white hover:bg-slate-100 rounded-xl font-semibold border border-slate-200 transition-all duration-200 hover:shadow-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center"
                    >
                        {isSubmitting && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        )}
                        {isSubmitting ? 'Saving...' : (referralCode ? 'Update Code' : 'Create Code')}
                    </button>
                </div>
            </div>
        </div>
    );
}
