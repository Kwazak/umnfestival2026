import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import './../../css/AdminLayout.css';

// Separate Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
    const { url, props } = usePage();
    
    // Get user data from Laravel session
    const user = props.auth?.user || {
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
            name: 'Discount Codes',
            href: '/admin/discount-codes',
            icon: '🏷️',
            current: url.startsWith('/admin/discount-codes')
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
        },
        {
            name: 'Event Pages',
            href: '/admin/event-pages',
            icon: '🎪',
            current: url.startsWith('/admin/event-pages')
        }
    ];

    const communicationsNavigation = [
        {
            name: 'Email Blast',
            href: '/admin/email-blast',
            icon: '📧',
            current: url.startsWith('/admin/email-blast')
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
        <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="flex flex-col h-full">
                {/* Enhanced Logo/Header */}
                <div className="relative px-6 py-6 border-b border-slate-200/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 to-[#004E89]/10"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">U</span>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#004E89] bg-clip-text text-transparent">
                                    UMN Festival
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            onClick={onClose}
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
                        <a
                            key={item.name}
                            href={item.href}
                            className={`
                                group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                ${item.current 
                                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFC22F] text-white shadow-lg transform scale-105' 
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                }
                            `}
                            onClick={onClose}
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
                        </a>
                    ))}
                    
                    {/* Payment Section */}
                    <div className="pt-4 mt-4 border-t border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Payment</div>
                        {paymentNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                                onClick={onClose}
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
                            </a>
                        ))}
                    </div>
                    
                    {/* Communications Section */}
                    <div className="pt-4 mt-4 border-t border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Communications</div>
                        {communicationsNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                                onClick={onClose}
                            >
                                {item.current && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-90"></div>
                                )}
                                <span className={`relative text-xl mr-3 transition-transform group-hover:scale-110 ${item.current ? 'animate-pulse' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="relative font-semibold">{item.name}</span>
                                {item.current && (
                                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                            </a>
                        ))}
                    </div>
                    
                    {/* Layouts Section */}
                    <div className="pt-4 mt-4 border-t border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Layouts</div>
                        {layoutsNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                                onClick={onClose}
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
                            </a>
                        ))}
                    </div>
                    
                    {/* AI & Automation Section */}
                    <div className="pt-4 mt-4 border-t border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">AI & Automation</div>
                        {aiNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                                onClick={onClose}
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
                            </a>
                        ))}
                    </div>
                    
                    {/* Settings Section */}
                    <div className="pt-4 mt-4 border-t border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Settings</div>
                        {settingsNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${item.current 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-102'
                                    }
                                `}
                                onClick={onClose}
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
                            </a>
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
                        <button 
                            onClick={() => {
                                router.post('/admin/logout');
                            }}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Separate PageHeader Component
const PageHeader = ({ title, subtitle, onMenuClick }) => {
    return (
        <div className="admin-header">
            <div className="flex items-center">
                <button
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="ml-4 lg:ml-0">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {title || 'Admin Dashboard'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {subtitle || 'UMN Festival 2025 Management'}
                    </p>
                </div>
            </div>
            

        </div>
    );
};

// Main AdminLayout Component
export default function AdminLayout({ children, title, subtitle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [sidebarOpen]);

    const handleMenuClick = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleOverlayClick = () => {
        setSidebarOpen(false);
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="admin-layout">
            {/* Mobile Overlay */}
            <div 
                className={`admin-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={handleOverlayClick}
            />

            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={handleSidebarClose}
            />

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Page Header */}
                <PageHeader 
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={handleMenuClick}
                />

                {/* Page Content */}
                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}