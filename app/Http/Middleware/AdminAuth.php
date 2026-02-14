<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if admin is logged in
        if (!session('admin_logged_in') || !session('admin_user')) {
            // If it's an AJAX request or API request, return JSON response
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthorized. Please login as admin.',
                    'redirect' => route('admin.login')
                ], 401);
            }
            
            // For regular requests, redirect to admin login
            return redirect()->route('admin.login')->with('error', 'Please login to access admin panel.');
        }

        // Refresh session to prevent timeout
        session()->put('admin_last_activity', now());
        
        return $next($request);
    }
}