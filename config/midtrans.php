<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing the configuration for Midtrans payment gateway.
    |
    */

    // Midtrans API credentials
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', 'G390284778'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'Mid-client-P05vgt6pd_PP81ec'),
    'server_key' => env('MIDTRANS_SERVER_KEY', 'Mid-server-u0rGNmRtBHVkQ-mVTSTOAKRA'),
    
    // Environment settings
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => true,
    'is_3ds' => true,
    
    // URLs - All redirect to the same handler to prevent external navigation
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', env('APP_URL', 'http://localhost') . '/payment/notification'),
    'finish_url' => env('MIDTRANS_FINISH_URL', env('APP_URL', 'http://localhost') . '/payment-status'),
    'unfinish_url' => env('MIDTRANS_UNFINISH_URL', env('APP_URL', 'http://localhost') . '/payment-status'),
    'error_url' => env('MIDTRANS_ERROR_URL', env('APP_URL', 'http://localhost') . '/payment-status'),
    
    // API endpoints
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false) 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
    'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://api.midtrans.com/v2'
        : 'https://api.sandbox.midtrans.com/v2',
];