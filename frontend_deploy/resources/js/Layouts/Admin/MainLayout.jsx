import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminMainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();
    
    // Mock user data - will be replaced with actual auth data
    const user = {
        name: 'Admin User',
        role: 'Super Admin'
    };

    const dashboardNavigation = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: '📊',
            current: url === '/admin'
        }
    ];

    const paymentNavigation = [
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: '🛍️',
            current: url.startsWith('/admin/orders')
        },
        {
            name: 'Tickets',
            href: '/admin/tickets',
            icon: '🎫',
            current: url.startsWith('/admin/tickets')
        },
        {
            name: 'Referral Codes',
            href: '/admin/referral-codes',
            icon: '🎁',
            current: url.startsWith('/admin/referral-codes')
        },
        {
            name: 'Scanner',
            href: '/admin/scanner',
            icon: '📱',
            current: url.startsWith('/admin/scanner')
        }
    ];

    const layoutsNavigation = [
        {
            name: 'Guest Stars',
            href: '/admin/guest-stars',
            icon: '⭐',
            current: url.startsWith('/admin/guest-stars')
        },
        {
            name: 'Ticket Types',
            href: '/admin/ticket-types',
            icon: '🎟️',
            current: url.startsWith('/admin/ticket-types')
        },
        {
            name: 'Event Card',
            href: '/admin/merchandise',
            icon: '🛒',
            current: url.startsWith('/admin/merchandise')
        },
        {
            name: 'Countdown',
            href: '/admin/countdown',
            icon: '⏰',
            current: url.startsWith('/admin/countdown')
        },
        {
            name: 'Archive',
            href: '/admin/archive',
            icon: '📹',
            current: url.startsWith('/admin/archive')
        },
        {
            name: 'Hero Section',
            href: '/admin/hero-section',
            icon: '🖼️',
            current: url.startsWith('/admin/hero-section')
        },
        {
            name: 'Closing Section',
            href: '/admin/closing-section',
            icon: '🎯',
            current: url.startsWith('/admin/closing-section')
        },
        {
            name: 'About Divisions',
            href: '/admin/divisions',
            icon: '🏷️',
            current: url.startsWith('/admin/divisions')
        }
    ];

    const aiNavigation = [
        {
            name: 'Chatbot Training',
            href: '/admin/chatbot-training',
            icon: '🤖',
            current: url.startsWith('/admin/chatbot-training')
        }
    ];

    const settingsNavigation = [
        {
            name: 'Change Password',
            href: '/admin/change-password',
            icon: '🔐',
            current: url === '/admin/change-password'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Enhanced Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-white/20
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Enhanced Logo/Header */}
                    <div className="relative px-6 py-6 border-b border-slate-200/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 to-[#004E89]/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">U</span>
                                </div>
                                <div className="ml-3">
                                    <h1 className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#004E89] bg-clip-text text-transparent">
                                        UMN Festival
                                    </h1>
                                    <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
                                </div>
                            </div>
                            <button
                                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {/* Dashboard Section */}
                        {dashboardNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                            >
                                {item.current && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] opacity-90"></div>
                                )}
                                <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="relative font-semibold">{item.name}</span>
                                {item.current && (
                                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                            </Link>
                        ))}
                        
                        {/* Payment Section */}
                        <div className="pt-4 mt-4 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Payment</div>
                            {paymentNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                        ${item.current 
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                        }
                                    `}
                                >
                                    {item.current && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-90"></div>
                                    )}
                                    <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative font-semibold">{item.name}</span>
                                    {item.current && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                        
                        {/* Layouts Section */}
                        <div className="pt-4 mt-4 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Layouts</div>
                            {layoutsNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                        ${item.current 
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105' 
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                        }
                                    `}
                                >
                                    {item.current && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-90"></div>
                                    )}
                                    <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative font-semibold">{item.name}</span>
                                    {item.current && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                        
                        {/* AI Section */}
                        <div className="pt-4 mt-4 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">AI & Automation</div>
                            {aiNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                        ${item.current 
                                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                        }
                                    `}
                                >
                                    {item.current && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-90"></div>
                                    )}
                                    <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative font-semibold">{item.name}</span>
                                    {item.current && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                        
                        {/* Settings Section */}
                        <div className="pt-4 mt-4 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Settings</div>
                            {settingsNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                        ${item.current 
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                        }
                                    `}
                                >
                                    {item.current && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-90"></div>
                                    )}
                                    <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative font-semibold">{item.name}</span>
                                    {item.current && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Enhanced User Info */}
                    <div className="px-4 py-4 border-t border-slate-200/50">
                        <div className="flex items-center p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#004E89] rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-white text-sm font-bold">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{user.role}</p>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Enhanced Top bar */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div className="ml-4 lg:ml-0">
                                    <h1 className="text-xl font-bold text-slate-800">
                                        {[...dashboardNavigation, ...paymentNavigation, ...layoutsNavigation, ...aiNavigation, ...settingsNavigation].find(item => item.current)?.name || 'Admin Dashboard'}
                                    </h1>
                                    <p className="text-xs text-slate-500">UMN Festival 2025 Management</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v-10l-5 5 5 5v-10z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
