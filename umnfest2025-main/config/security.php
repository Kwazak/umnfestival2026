<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security-related configuration options for the
    | UMN Festival application.
    |
    */

    'admin' => [
        /*
        |--------------------------------------------------------------------------
        | Admin Login Security
        |--------------------------------------------------------------------------
        */
        'max_login_attempts' => env('ADMIN_MAX_LOGIN_ATTEMPTS', 5),
        'lockout_duration' => env('ADMIN_LOCKOUT_DURATION', 900), // 15 minutes
        'password_min_length' => env('ADMIN_PASSWORD_MIN_LENGTH', 16),
        'password_change_attempts' => env('ADMIN_PASSWORD_CHANGE_ATTEMPTS', 3),
        'password_change_lockout' => env('ADMIN_PASSWORD_CHANGE_LOCKOUT', 1800), // 30 minutes
        'session_timeout' => env('ADMIN_SESSION_TIMEOUT', 3600), // 1 hour
        'require_2fa' => env('ADMIN_REQUIRE_2FA', false),
    ],

    'api' => [
        /*
        |--------------------------------------------------------------------------
        | API Security
        |--------------------------------------------------------------------------
        */
        'rate_limits' => [
            'public' => env('API_RATE_LIMIT_PUBLIC', 30), // per minute
            'admin' => env('API_RATE_LIMIT_ADMIN', 60), // per minute
            'auth' => env('API_RATE_LIMIT_AUTH', 60), // per minute
            'payment' => env('API_RATE_LIMIT_PAYMENT', 20), // per minute
            'webhook' => env('API_RATE_LIMIT_WEBHOOK', 100), // per minute
            'scanner' => env('API_RATE_LIMIT_SCANNER', 100), // per minute
        ],
        'max_search_length' => env('API_MAX_SEARCH_LENGTH', 100),
        'max_request_size' => env('API_MAX_REQUEST_SIZE', 1024), // KB
    ],

    'validation' => [
        /*
        |--------------------------------------------------------------------------
        | Input Validation Rules
        |--------------------------------------------------------------------------
        */
        'buyer_name_regex' => '/^[a-zA-Z\s\-\.\']+$/',
        'phone_regex' => '/^\+?[0-9\-\s\(\)]+$/',
        'referral_code_regex' => '/^[A-Z0-9\-_]+$/',
        'max_order_quantity' => env('MAX_ORDER_QUANTITY', 10),
        'allowed_file_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        'max_file_size' => env('MAX_FILE_SIZE', 5120), // KB
    ],

    'logging' => [
        /*
        |--------------------------------------------------------------------------
        | Security Logging
        |--------------------------------------------------------------------------
        */
        'log_admin_actions' => env('LOG_ADMIN_ACTIONS', true),
        'log_failed_logins' => env('LOG_FAILED_LOGINS', true),
        'log_api_access' => env('LOG_API_ACCESS', true),
        'log_sensitive_operations' => env('LOG_SENSITIVE_OPERATIONS', true),
        'audit_retention_days' => env('AUDIT_RETENTION_DAYS', 90),
    ],

    'headers' => [
        /*
        |--------------------------------------------------------------------------
        | Security Headers
        |--------------------------------------------------------------------------
        */
        'hsts_max_age' => env('HSTS_MAX_AGE', 31536000), // 1 year
        'csp_report_uri' => env('CSP_REPORT_URI', null),
        'expect_ct_max_age' => env('EXPECT_CT_MAX_AGE', 86400), // 1 day
    ],

    'encryption' => [
        /*
        |--------------------------------------------------------------------------
        | Encryption Settings
        |--------------------------------------------------------------------------
        */
        'ticket_validation_key' => env('TICKET_VALIDATION_KEY', config('app.key')),
        'qr_code_encryption' => env('QR_CODE_ENCRYPTION', true),
        'sensitive_data_encryption' => env('SENSITIVE_DATA_ENCRYPTION', true),
    ],

    'monitoring' => [
        /*
        |--------------------------------------------------------------------------
        | Security Monitoring
        |--------------------------------------------------------------------------
        */
        'suspicious_activity_threshold' => env('SUSPICIOUS_ACTIVITY_THRESHOLD', 10),
        'ip_whitelist' => array_filter(explode(',', env('IP_WHITELIST', ''))),
        'ip_blacklist' => array_filter(explode(',', env('IP_BLACKLIST', ''))),
        'enable_intrusion_detection' => env('ENABLE_INTRUSION_DETECTION', false),
    ],

    'database' => [
        /*
        |--------------------------------------------------------------------------
        | Database Security
        |--------------------------------------------------------------------------
        */
        'enable_query_logging' => env('ENABLE_QUERY_LOGGING', false),
        'log_slow_queries' => env('LOG_SLOW_QUERIES', true),
        'slow_query_threshold' => env('SLOW_QUERY_THRESHOLD', 2000), // milliseconds
        'enable_sql_injection_detection' => env('ENABLE_SQL_INJECTION_DETECTION', true),
    ],
];