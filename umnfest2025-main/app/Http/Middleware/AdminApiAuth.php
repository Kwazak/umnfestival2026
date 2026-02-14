<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start session for API routes to access session data
        $session = app('session');
        $session->start();

        // Get session data directly
        $adminLoggedIn = $session->get('admin_logged_in', false);
        $adminUser = $session->get('admin_user', null);

        // Check if admin is logged in via session
        if (!$adminLoggedIn) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin login required.',
                'error' => 'ADMIN_AUTH_REQUIRED'
            ], 401);
        }

        // Verify admin user data exists
        if (!$adminUser || !isset($adminUser['role']) || $adminUser['role'] !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin privileges required.',
                'error' => 'ADMIN_PRIVILEGES_REQUIRED'
            ], 401);
        }

        return $next($request);
    }
}