import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Archive = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        thumbnail_url: '',
        video_id: '',
        sort_order: '',
        is_active: true
    });

    // Fetch videos from API
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/archive-videos');
            const data = await response.json();
            
            if (data.success) {
                // Get detailed video data for admin
                const adminVideos = [];
                for (let i = 0; i < data.data.length; i++) {
                    try {
                        const detailResponse = await fetch(`/api/archive-videos/${i + 1}`);
                        const detailData = await detailResponse.json();
                        if (detailData.success) {
                            adminVideos.push(detailData.data);
                        }
                    } catch (detailError) {
                        console.error(`Error fetching detail for video ${i + 1}:`, detailError);
                    }
                }
                setVideos(adminVideos);
            } else {
                console.error('Failed to fetch videos:', data.message);
                alert('Failed to load videos: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            alert('Error loading videos. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingVideo 
                ? `/api/archive-videos/${editingVideo.id}`
                : '/api/archive-videos';
            
            const method = editingVideo ? 'PUT' : 'POST';
            
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
                alert(editingVideo ? 'Archive video updated successfully!' : 'Archive video created successfully!');
                setShowForm(false);
                setEditingVideo(null);
                resetForm();
                fetchVideos();
            } else {
                alert('Error: ' + (data.message || 'Something went wrong'));
                if (data.errors) {
                    console.error('Validation errors:', data.errors);
                }
            }
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Error saving video');
        }
    };

    // Handle edit
    const handleEdit = (video) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            thumbnail_url: video.thumbnail_url || '',
            video_id: video.video_id,
            sort_order: video.sort_order,
            is_active: video.is_active
        });
        setShowForm(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this archive video?')) return;

        try {
            const response = await fetch(`/api/archive-videos/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('Archive video deleted successfully!');
                fetchVideos();
            } else {
                alert('Error deleting archive video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting archive video');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            thumbnail_url: '',
            video_id: '',
            sort_order: '',
            is_active: true
        });
    };

    // Handle add new
    const handleAddNew = () => {
        setEditingVideo(null);
        resetForm();
        // Auto-suggest next sort order
        const maxOrder = Math.max(...videos.map(v => v.sort_order || 0), 0);
        setFormData(prev => ({ ...prev, sort_order: maxOrder + 1 }));
        setShowForm(true);
    };

    // Extract YouTube video ID from URL
    const extractVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : url;
    };

    // Handle video ID input change
    const handleVideoIdChange = (e) => {
        const value = e.target.value;
        const videoId = extractVideoId(value);
        setFormData({...formData, video_id: videoId});
    };

    if (loading) {
        return (
            <AdminLayout title="Archive Management" subtitle="Manage archive videos for the home page">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading archive videos...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Archive Management" subtitle="Manage archive videos for the home page">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Archive Videos Management</h1>
                        <p className="text-gray-600 mt-1">Manage archive videos displayed on the home page</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={fetchVideos}
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
                            Add New Video
                        </button>
                    </div>
                </div>

                {/* Videos Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {videos.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No archive videos</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new archive video.</p>
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNew}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Archive Video
                                </button>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YouTube ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {videos.map((video) => (
                                    <tr key={video.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {video.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{video.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img 
                                                    src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-16 h-9 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.src = `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`;
                                                    }}
                                                />
                                                <div className="ml-3">
                                                    <div className="text-xs text-gray-500">
                                                        {video.thumbnail_url ? 'Custom' : 'YouTube Auto'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">{video.video_id}</div>
                                            <a 
                                                href={`https://youtube.com/watch?v=${video.video_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                View on YouTube
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                video.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {video.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(video)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(video.id)}
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
                                    {editingVideo ? 'Edit Archive Video' : 'Add New Archive Video'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Video Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., OFFICIAL TRAILER E-ULYMPIC 2025"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">YouTube Video ID or URL</label>
                                        <input
                                            type="text"
                                            value={formData.video_id}
                                            onChange={handleVideoIdChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., BIz9MJIPdIg or https://youtube.com/watch?v=BIz9MJIPdIg"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">You can paste the full YouTube URL or just the video ID</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Custom Thumbnail URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={formData.thumbnail_url}
                                            onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="https://example.com/thumbnail.jpg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to use YouTube's auto-generated thumbnail</p>
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

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active (show on website)
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingVideo(null);
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
                                            {editingVideo ? 'Update' : 'Create'}
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

export default Archive;