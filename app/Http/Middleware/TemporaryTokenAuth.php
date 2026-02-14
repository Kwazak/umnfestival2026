<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TemporaryTokenAuth
{
    /**
     * Handle an incoming request for temporary token authentication.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        // Add debugging
        \Log::info('TemporaryTokenAuth: Processing request', [
            'token' => $token,
            'url' => $request->url(),
            'method' => $request->method(),
            'headers' => $request->headers->all()
        ]);
        
        if (!$token) {
            \Log::warning('TemporaryTokenAuth: No token provided');
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }
        
        // Check if it's a temporary purchase token
        $cacheKey = 'purchase_token_' . $token;
        $purchaseData = cache()->get($cacheKey);
        
        \Log::info('TemporaryTokenAuth: Token validation', [
            'cache_key' => $cacheKey,
            'data_found' => !is_null($purchaseData),
            'purchase_data' => $purchaseData
        ]);
        
        if (!$purchaseData) {
            // If not a valid temporary token, check for Sanctum auth
            if (!$request->user()) {
                \Log::error('TemporaryTokenAuth: Invalid token and no Sanctum auth', ['token' => $token]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid authentication token'
                ], 401);
            }
            // If Sanctum auth exists, continue
            \Log::info('TemporaryTokenAuth: Using Sanctum auth');
            return $next($request);
        }
        
        // Add purchase data to request for use in controllers
        $request->merge([
            'purchase_data' => $purchaseData,
            'is_temporary_auth' => true
        ]);
        
        // Skip further auth checks for temporary tokens
        return $next($request);
    }
}