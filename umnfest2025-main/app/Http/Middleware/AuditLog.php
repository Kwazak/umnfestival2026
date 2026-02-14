<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
    /**
     * Handle an incoming request and log admin activities.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Log incoming admin request
        if ($this->shouldLog($request)) {
            $this->logRequest($request);
        }

        $response = $next($request);

        // Log response for admin actions
        if ($this->shouldLog($request)) {
            $this->logResponse($request, $response, $startTime);
        }

        return $response;
    }

    /**
     * Determine if the request should be logged
     */
    private function shouldLog(Request $request): bool
    {
        // Log admin routes and sensitive operations
        return $request->is('admin/*') || 
               $request->is('api/orders*') || 
               $request->is('api/referral-codes*') || 
               $request->is('api/guest-stars*') || 
               $request->is('api/ticket-types*') ||
               $request->is('api/tickets*') ||
               session('admin_logged_in');
    }

    /**
     * Log the incoming request
     */
    private function logRequest(Request $request): void
    {
        $logData = [
            'type' => 'admin_request',
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'admin_user' => session('admin_user.email'),
            'admin_id' => session('admin_user.id'),
            'timestamp' => now()->toISOString(),
        ];

        // Log request body for POST/PUT/PATCH (excluding sensitive data)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $body = $request->all();
            
            // Remove sensitive fields
            unset($body['password'], $body['current_password'], $body['new_password'], $body['new_password_confirmation']);
            
            if (!empty($body)) {
                $logData['request_body'] = $body;
            }
        }

        Log::channel('audit')->info('Admin request', $logData);
    }

    /**
     * Log the response
     */
    private function logResponse(Request $request, Response $response, float $startTime): void
    {
        $duration = round((microtime(true) - $startTime) * 1000, 2);

        $logData = [
            'type' => 'admin_response',
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'ip' => $request->ip(),
            'admin_user' => session('admin_user.email'),
            'admin_id' => session('admin_user.id'),
            'timestamp' => now()->toISOString(),
        ];

        // Log error responses with more detail
        if ($response->getStatusCode() >= 400) {
            $logData['error'] = true;
            
            if ($response->getStatusCode() >= 500) {
                Log::channel('audit')->error('Admin request error', $logData);
            } else {
                Log::channel('audit')->warning('Admin request warning', $logData);
            }
        } else {
            Log::channel('audit')->info('Admin response', $logData);
        }
    }
}