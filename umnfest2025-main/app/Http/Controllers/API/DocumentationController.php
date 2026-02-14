<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DocumentationController extends Controller
{
    /**
     * Get API documentation
     */
    public function index()
    {
        $documentation = [
            'title' => 'UMN Festival 2025 API',
            'version' => '1.0.0',
            'description' => 'Comprehensive ticketing API with Midtrans payment integration',
            'base_url' => url('/api'),
            'authentication' => [
                'type' => 'Bearer Token',
                'description' => 'Use the token received from login endpoint',
                'header' => 'Authorization: Bearer {token}'
            ],
            'endpoints' => [
                'authentication' => [
                    'login' => [
                        'method' => 'POST',
                        'path' => '/auth/login',
                        'description' => 'Login user and get API token',
                        'body' => [
                            'email' => 'admin@umnfest.com',
                            'password' => 'password'
                        ],
                        'response' => [
                            'success' => true,
                            'message' => 'Login successful',
                            'data' => [
                                'user' => 'User object',
                                'token' => 'API token string'
                            ]
                        ]
                    ],
                    'logout' => [
                        'method' => 'POST',
                        'path' => '/auth/logout',
                        'description' => 'Logout user and revoke token',
                        'auth_required' => true
                    ],
                    'me' => [
                        'method' => 'GET',
                        'path' => '/auth/me',
                        'description' => 'Get current user information',
                        'auth_required' => true
                    ]
                ],
                'orders' => [
                    'create' => [
                        'method' => 'POST',
                        'path' => '/orders',
                        'description' => 'Create new ticket order',
                        'auth_required' => true,
                        'body' => [
                            'buyer_name' => 'John Doe',
                            'buyer_email' => 'john@example.com',
                            'buyer_phone' => '081234567890',
                            'quantity' => 2,
                            'category' => 'internal or external',
                            'referral_code' => 'PANITIA001 (optional)'
                        ]
                    ],
                    'show' => [
                        'method' => 'GET',
                        'path' => '/orders/{orderNumber}',
                        'description' => 'Get order details',
                        'auth_required' => true
                    ],
                    'index' => [
                        'method' => 'GET',
                        'path' => '/orders',
                        'description' => 'Get all orders (admin only)',
                        'auth_required' => true,
                        'admin_only' => true
                    ]
                ],
                'payment' => [
                    'create' => [
                        'method' => 'GET',
                        'path' => '/payment/{orderNumber}/create',
                        'description' => 'Generate Midtrans payment token',
                        'auth_required' => true
                    ],
                    'status' => [
                        'method' => 'GET',
                        'path' => '/payment/{orderNumber}/status',
                        'description' => 'Check payment status',
                        'auth_required' => true
                    ],
                    'notification' => [
                        'method' => 'POST',
                        'path' => '/payment/notification',
                        'description' => 'Midtrans webhook (public)',
                        'auth_required' => false
                    ]
                ],
                'referral_codes' => [
                    'validate' => [
                        'method' => 'POST',
                        'path' => '/referral-codes/validate',
                        'description' => 'Validate referral code',
                        'auth_required' => false,
                        'body' => [
                            'code' => 'PANITIA001'
                        ]
                    ],
                    'index' => [
                        'method' => 'GET',
                        'path' => '/referral-codes',
                        'description' => 'Get all referral codes (admin only)',
                        'auth_required' => true,
                        'admin_only' => true
                    ],
                    'store' => [
                        'method' => 'POST',
                        'path' => '/referral-codes',
                        'description' => 'Create new referral code (admin only)',
                        'auth_required' => true,
                        'admin_only' => true
                    ]
                ]
            ],
            'database_structure' => [
                'users' => ['id', 'name', 'email', 'password', 'role', 'timestamps'],
                'orders' => ['id', 'buyer_name', 'buyer_email', 'buyer_phone', 'category', 'ticket_quantity', 'amount', 'referral_code_id', 'order_number', 'midtrans_transaction_id', 'status', 'paid_at', 'timestamps'],
                'tickets' => ['id', 'order_id', 'ticket_code', 'status', 'checked_in_at', 'timestamps'],
                'referral_codes' => ['id', 'code', 'panitia_name', 'discount_value', 'uses', 'is_active', 'timestamps']
            ],
            'payment_flow' => [
                '1. Create Order' => 'POST /orders',
                '2. Generate Payment Token' => 'GET /payment/{orderNumber}/create',
                '3. Process Payment' => 'Use Midtrans Snap on frontend',
                '4. Webhook Notification' => 'Midtrans calls POST /payment/notification',
                '5. Verify Payment' => 'GET /payment/{orderNumber}/status'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $documentation
        ], 200);
    }
}
