import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const ChatbotTraining = ({ auth }) => {
    // Get CSRF token
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };
    const [activeTab, setActiveTab] = useState('knowledge');
    const [knowledge, setKnowledge] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Knowledge form state
    const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
    const [editingKnowledge, setEditingKnowledge] = useState(null);
    const [knowledgeForm, setKnowledgeForm] = useState({
        category: '',
        question_en: '',
        question_id: '',
        answer_en: '',
        answer_id: '',
        keywords: [],
        priority: 0,
        is_active: true
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        language: '',
        date_from: '',
        date_to: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1
    });

    // Test chatbot
    const [testMessage, setTestMessage] = useState('');
    const [testLanguage, setTestLanguage] = useState('en');
    const [testResponse, setTestResponse] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'knowledge') {
            loadKnowledge();
        } else if (activeTab === 'conversations') {
            loadConversations();
        } else if (activeTab === 'analytics') {
            loadAnalytics();
        }
    }, [activeTab, filters, pagination.current_page]);

    const loadInitialData = async () => {
        try {
            const response = await fetch('/api/admin/chatbot/categories', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadKnowledge = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters
            });

            const response = await fetch(`/api/admin/chatbot/knowledge?${params}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setKnowledge(data.data.data);
                setPagination({
                    current_page: data.data.current_page,
                    per_page: data.data.per_page,
                    total: data.data.total,
                    last_page: data.data.last_page
                });
            }
        } catch (error) {
            setError('Failed to load knowledge entries');
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters
            });

            const response = await fetch(`/api/admin/chatbot/conversations?${params}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setConversations(data.data.data);
                setPagination({
                    current_page: data.data.current_page,
                    per_page: data.data.per_page,
                    total: data.data.total,
                    last_page: data.data.last_page
                });
            }
        } catch (error) {
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/chatbot/analytics', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveKnowledge = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Clean up any unwanted prefixes before saving
            const cleanedForm = {
                ...knowledgeForm,
                question_id: knowledgeForm.question_id.replace(/^\[Terjemahan otomatis\]\s*/, ''),
                answer_id: knowledgeForm.answer_id.replace(/^\[Terjemahan otomatis\]\s*/, '')
            };
            
            const url = editingKnowledge 
                ? `/api/admin/chatbot/knowledge/${editingKnowledge.id}`
                : '/api/admin/chatbot/knowledge';
            
            const method = editingKnowledge ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(cleanedForm)
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess(editingKnowledge ? 'Knowledge updated successfully' : 'Knowledge created successfully');
                setShowKnowledgeForm(false);
                setEditingKnowledge(null);
                resetKnowledgeForm();
                loadKnowledge();
            } else {
                setError(data.message || 'Failed to save knowledge');
            }
        } catch (error) {
            setError('Failed to save knowledge');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKnowledge = async (id) => {
        if (!confirm('Are you sure you want to delete this knowledge entry?')) return;
        
        try {
            const response = await fetch(`/api/admin/chatbot/knowledge/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess('Knowledge deleted successfully');
                loadKnowledge();
            } else {
                setError(data.message || 'Failed to delete knowledge');
            }
        } catch (error) {
            setError('Failed to delete knowledge');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await fetch(`/api/admin/chatbot/knowledge/${id}/toggle`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess('Status updated successfully');
                loadKnowledge();
            } else {
                setError(data.message || 'Failed to update status');
            }
        } catch (error) {
            setError('Failed to update status');
        }
    };

    const handleTestChatbot = async () => {
        if (!testMessage.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/admin/chatbot/test', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    message: testMessage,
                    language: testLanguage
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setTestResponse(data.data);
            } else {
                setError(data.message || 'Failed to test chatbot');
            }
        } catch (error) {
            setError('Failed to test chatbot');
        } finally {
            setLoading(false);
        }
    };

    const resetKnowledgeForm = () => {
        setKnowledgeForm({
            category: '',
            question_en: '',
            question_id: '',
            answer_en: '',
            answer_id: '',
            keywords: [],
            priority: 0,
            is_active: true
        });
    };

    // ✅ IMPROVED Auto-translate function
    const handleAutoTranslate = async () => {
        if (!knowledgeForm.question_en.trim() || !knowledgeForm.answer_en.trim()) {
            setError('Please fill in English question and answer first');
            return;
        }

        setIsTranslating(true);
        setError(''); // Clear any previous errors
        
        try {
            const response = await fetch('/api/admin/chatbot/translate', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    question_en: knowledgeForm.question_en,
                    answer_en: knowledgeForm.answer_en
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // ✅ Clean up any unwanted prefixes from translation
                const cleanQuestionId = data.data.question_id.replace(/^\[Terjemahan otomatis\]\s*/, '');
                const cleanAnswerId = data.data.answer_id.replace(/^\[Terjemahan otomatis\]\s*/, '');
                
                setKnowledgeForm(prev => ({
                    ...prev,
                    question_id: cleanQuestionId,
                    answer_id: cleanAnswerId
                }));
                setSuccess('Translation completed successfully!');
            } else {
                setError(data.message || 'Failed to translate');
            }
        } catch (error) {
            setError('Failed to translate content. Please check your internet connection.');
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    // ✅ IMPROVED Auto-translate when English content changes (if enabled)
    useEffect(() => {
        if (autoTranslateEnabled && !editingKnowledge && knowledgeForm.question_en.trim() && knowledgeForm.answer_en.trim()) {
            const timeoutId = setTimeout(() => {
                // Only auto-translate if Indonesian fields are empty or contain auto-generated content
                if (!knowledgeForm.question_id.trim() || !knowledgeForm.answer_id.trim() || 
                    knowledgeForm.question_id.includes('[Terjemahan otomatis]') || 
                    knowledgeForm.answer_id.includes('[Terjemahan otomatis]')) {
                    handleAutoTranslate();
                }
            }, 2000); // Delay 2 seconds after user stops typing

            return () => clearTimeout(timeoutId);
        }
    }, [knowledgeForm.question_en, knowledgeForm.answer_en, autoTranslateEnabled, editingKnowledge]);

    const handleEditKnowledge = (item) => {
        setEditingKnowledge(item);
        setKnowledgeForm({
            category: item.category,
            question_en: item.question_en,
            question_id: item.question_id,
            answer_en: item.answer_en,
            answer_id: item.answer_id,
            keywords: item.keywords,
            priority: item.priority,
            is_active: item.is_active
        });
        setShowKnowledgeForm(true);
    };

    const addKeyword = () => {
        const keyword = prompt('Enter keyword:');
        if (keyword && keyword.trim()) {
            setKnowledgeForm(prev => ({
                ...prev,
                keywords: [...prev.keywords, keyword.trim()]
            }));
        }
    };

    const removeKeyword = (index) => {
        setKnowledgeForm(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, i) => i !== index)
        }));
    };

    return (
        <AdminLayout title="Chatbot Training" subtitle="Manage AI chatbot knowledge and training data">
            <Head title="Chatbot Training" />
            
            <div className="space-y-6">
                {/* Alert Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <button 
                            onClick={() => setError('')}
                            className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                        <button 
                            onClick={() => setSuccess('')}
                            className="absolute top-0 right-0 mt-2 mr-2 text-green-500 hover:text-green-700"
                        >
                            ×
                        </button>
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'knowledge', name: 'Knowledge Base', icon: '📚' },
                            { id: 'conversations', name: 'Conversations', icon: '💬' },
                            { id: 'analytics', name: 'Analytics', icon: '📊' },
                            { id: 'test', name: 'Test Chatbot', icon: '🧪' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Knowledge Base Tab */}
                {activeTab === 'knowledge' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Knowledge Base Management</h2>
                            <button
                                onClick={() => setShowKnowledgeForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Add New Knowledge
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <button
                                onClick={loadKnowledge}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            >
                                Apply Filters
                            </button>
                        </div>

                        {/* Knowledge List */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Question (EN)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Question (ID)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {knowledge.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {item.question_en}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {item.question_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.priority}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        item.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEditKnowledge(item)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKnowledge(item.id)}
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

                        {/* Pagination */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    disabled={pagination.current_page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conversations Tab */}
                {activeTab === 'conversations' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Conversation History</h2>
                        
                        {/* Conversation Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                            <select
                                value={filters.language}
                                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">All Languages</option>
                                <option value="en">English</option>
                                <option value="id">Indonesian</option>
                            </select>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                            <button
                                onClick={loadConversations}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            >
                                Apply Filters
                            </button>
                        </div>

                        {/* Conversations List */}
                        <div className="space-y-4">
                            {conversations.map((conv) => (
                                <div key={conv.id} className="bg-white p-4 rounded-lg shadow border">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                conv.language === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {conv.language.toUpperCase()}
                                            </span>
                                            {conv.matched_category && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {conv.matched_category}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-blue-50 p-3 rounded">
                                            <strong>User:</strong> {conv.user_message}
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <strong>Bot:</strong> {conv.bot_response}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Chatbot Analytics</h2>
                        
                        {analytics.overview && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-2xl font-bold text-blue-600">{analytics.overview.total_knowledge_entries}</div>
                                    <div className="text-sm text-gray-600">Total Knowledge Entries</div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-2xl font-bold text-green-600">{analytics.overview.active_knowledge_entries}</div>
                                    <div className="text-sm text-gray-600">Active Entries</div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-2xl font-bold text-purple-600">{analytics.overview.total_conversations}</div>
                                    <div className="text-sm text-gray-600">Total Conversations</div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-2xl font-bold text-orange-600">{analytics.overview.unique_sessions}</div>
                                    <div className="text-sm text-gray-600">Unique Sessions</div>
                                </div>
                            </div>
                        )}

                        {/* Category Distribution */}
                        {analytics.knowledge_by_category && (
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Knowledge by Category</h3>
                                <div className="space-y-2">
                                    {analytics.knowledge_by_category.map((item) => (
                                        <div key={item.category} className="flex justify-between items-center">
                                            <span className="font-medium">{item.category}</span>
                                            <span className="text-sm text-gray-600">
                                                {item.active_count}/{item.count} active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Test Chatbot Tab */}
                {activeTab === 'test' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Test Chatbot</h2>
                        
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Test Message
                                        </label>
                                        <textarea
                                            value={testMessage}
                                            onChange={(e) => setTestMessage(e.target.value)}
                                            placeholder="Enter a message to test the chatbot..."
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={testLanguage}
                                            onChange={(e) => setTestLanguage(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            <option value="en">English</option>
                                            <option value="id">Indonesian</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleTestChatbot}
                                    disabled={!testMessage.trim() || loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : 'Test Chatbot'}
                                </button>

                                {testResponse && (
                                    <div className="mt-6 space-y-4">
                                        <h3 className="text-lg font-semibold">Response:</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="space-y-2">
                                                <div><strong>Response:</strong> {testResponse.response}</div>
                                                <div><strong>Category:</strong> {testResponse.category}</div>
                                                {testResponse.suggestions && (
                                                    <div>
                                                        <strong>Suggestions:</strong>
                                                        <ul className="list-disc list-inside mt-1">
                                                            {testResponse.suggestions.map((suggestion, index) => (
                                                                <li key={index} className="text-sm">{suggestion}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ IMPROVED Knowledge Form Modal */}
                {showKnowledgeForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingKnowledge ? 'Edit Knowledge Entry' : 'Add New Knowledge Entry'}
                                </h3>
                                
                                <form onSubmit={handleSaveKnowledge} className="space-y-4">
                                    {/* ✅ IMPROVED Auto-translate Settings */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-900">🤖 AI Auto-Translation</h4>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Input in English - AI will automatically translate to Indonesian (clean translation without prefixes)
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="auto_translate"
                                                    checked={autoTranslateEnabled}
                                                    onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                                                    className="rounded"
                                                />
                                                <label htmlFor="auto_translate" className="text-sm text-blue-900">
                                                    Auto-translate
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleAutoTranslate}
                                                    disabled={isTranslating || !knowledgeForm.question_en || !knowledgeForm.answer_en}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {isTranslating ? '🔄 Translating...' : '🌐 Translate Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <input
                                                type="text"
                                                value={knowledgeForm.category}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="e.g., General, Tickets, Events"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority (0-10)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={knowledgeForm.priority}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    {/* English Input Section */}
                                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <h4 className="text-sm font-medium text-green-900">📝 English Input (Primary)</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question (English) *
                                            </label>
                                            <textarea
                                                value={knowledgeForm.question_en}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, question_en: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                                                placeholder="Enter the question in English..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Answer (English) *
                                            </label>
                                            <textarea
                                                value={knowledgeForm.answer_en}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, answer_en: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                                                placeholder="Enter the answer in English..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ✅ IMPROVED Indonesian Translation Section */}
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-700">🇮🇩 Indonesian Translation</h4>
                                            {isTranslating && (
                                                <div className="flex items-center text-blue-600 text-xs">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                                    Translating...
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Question (Indonesian)
                                            </label>
                                            <textarea
                                                value={knowledgeForm.question_id}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, question_id: e.target.value }))}
                                                className={`w-full border border-gray-300 rounded-md px-3 py-2 h-20 ${autoTranslateEnabled ? 'bg-gray-100' : 'bg-white'}`}
                                                placeholder="Indonesian translation will appear here..."
                                                readOnly={autoTranslateEnabled}
                                            />
                                            {autoTranslateEnabled && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    🤖 Auto-generated translation. Disable auto-translate to edit manually.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Answer (Indonesian)
                                            </label>
                                            <textarea
                                                value={knowledgeForm.answer_id}
                                                onChange={(e) => setKnowledgeForm(prev => ({ ...prev, answer_id: e.target.value }))}
                                                className={`w-full border border-gray-300 rounded-md px-3 py-2 h-32 ${autoTranslateEnabled ? 'bg-gray-100' : 'bg-white'}`}
                                                placeholder="Indonesian translation will appear here..."
                                                readOnly={autoTranslateEnabled}
                                            />
                                            {autoTranslateEnabled && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    🤖 Auto-generated translation. Disable auto-translate to edit manually.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Keywords
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {knowledgeForm.keywords.map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {keyword}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKeyword(index)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addKeyword}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            + Add Keyword
                                        </button>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={knowledgeForm.is_active}
                                            onChange={(e) => setKnowledgeForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowKnowledgeForm(false);
                                                setEditingKnowledge(null);
                                                resetKnowledgeForm();
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save'}
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

export default ChatbotTraining;