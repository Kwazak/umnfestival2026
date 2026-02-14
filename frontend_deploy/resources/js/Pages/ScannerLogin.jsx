import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function ScannerLogin({ flash }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validasi format username (ORANG-1 sampai ORANG-50)
            const usernamePattern = /^ORANG-([1-9]|[1-4][0-9]|50)$/i;
            if (!usernamePattern.test(username.toUpperCase())) {
                setError('Username harus dalam format ORANG-1 sampai ORANG-50');
                setLoading(false);
                return;
            }

            // Validasi password sama dengan username
            if (password !== username) {
                setLoading(false);
                return;
            }

            // Submit login
            router.post('/admin/scanner/login', {
                username: username.toUpperCase(),
                password: password
            }, {
                onSuccess: () => {
                    // Redirect ke admin scanner page
                    router.visit('/admin/scanner');
                },
                onError: (errors) => {
                    setError(errors.message || 'Login gagal');
                    setLoading(false);
                }
            });
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Scanner Login - UMN Festival 2025" />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 pt-10 pb-10">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            🎫 Scanner Login
                        </h1>
                        <p className="text-gray-300 text-lg">
                            UMN Festival 2025
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Flash Message */}
                            {flash?.message && (
                                <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg text-sm">
                                    {flash.message}
                                </div>
                            )}

                            {/* Username Input */}
                            <div>
                                <label htmlFor="username" className="block text-white font-semibold mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                                    placeholder="ORANG-1"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg font-mono"
                                    required
                                    autoFocus
                                    autoComplete="off"
                                />
                                <p className="mt-2 text-xs text-gray-300">
                                    Format: ORANG-1 sampai ORANG-50
                                </p>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-white font-semibold mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Sama dengan username"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg font-mono"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    '🔓 Login & Start Scanning'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm">
                            © 2025 UMN Festival. Ticket Scanner System.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
