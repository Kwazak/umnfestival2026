<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\User;

class EnhancedAdminAuth
{
    /**
     * Handle an incoming request with enhanced security.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // SECURITY: Check session timeout
        $sessionTimeout = config('security.admin.session_timeout', 3600);
        $lastActivity = session('admin_last_activity');
        
        if ($lastActivity && (time() - $lastActivity) > $sessionTimeout) {
            $this->logSecurityEvent('session_timeout', $request);
            session()->forget(['admin_logged_in', 'admin_user', 'admin_last_activity']);
            
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired'
                ], 401);
            }
            
            return redirect()->route('admin.login')->with('error', 'Session expired. Please login again.');
        }

        // Check if admin is logged in
        if (!session('admin_logged_in')) {
            $this->logSecurityEvent('unauthorized_access_attempt', $request);
            
            // For API requests or AJAX requests, throw exception to be handled by our error handler
            if ($request->expectsJson() || $request->ajax()) {
                throw new AuthenticationException('Unauthenticated.');
            }
            
            // For admin routes, redirect to login
            if ($request->is('admin/*')) {
                return redirect()->route('admin.login');
            }
            
            // For other routes, throw exception to show 401 page
            throw new AuthenticationException('Unauthenticated.');
        }

        // SECURITY: Validate admin user still exists and has admin role
        $adminUserId = session('admin_user.id');
        if ($adminUserId) {
            $adminUser = User::find($adminUserId);
            if (!$adminUser || $adminUser->role !== 'admin') {
                $this->logSecurityEvent('invalid_admin_session', $request, [
                    'admin_id' => $adminUserId,
                    'user_exists' => $adminUser ? 'yes' : 'no',
                    'user_role' => $adminUser->role ?? 'none'
                ]);
                
                session()->forget(['admin_logged_in', 'admin_user', 'admin_last_activity']);
                
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid session'
                    ], 401);
                }
                
                return redirect()->route('admin.login')->with('error', 'Invalid session. Please login again.');
            }
        }

        // SECURITY: Rate limiting per admin user
        $rateLimitKey = 'admin_requests_' . session('admin_user.id') . '_' . $request->ip();
        $maxRequests = config('security.api.rate_limits.admin', 60);
        
        if (RateLimiter::tooManyAttempts($rateLimitKey, $maxRequests)) {
            $this->logSecurityEvent('admin_rate_limit_exceeded', $request);
            
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests'
                ], 429);
            }
            
            return response('Too Many Requests', 429);
        }
        
        RateLimiter::hit($rateLimitKey, 60); // 1 minute window

        // SECURITY: Check for suspicious activity patterns
        $this->checkSuspiciousActivity($request);

        // Update last activity timestamp
        session(['admin_last_activity' => time()]);

        return $next($request);
    }

    /**
     * Log security events
     */
    private function logSecurityEvent(string $event, Request $request, array $extra = []): void
    {
        $logData = array_merge([
            'event' => $event,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'admin_user' => session('admin_user.email'),
            'admin_id' => session('admin_user.id'),
            'timestamp' => now()->toISOString(),
        ], $extra);

        Log::channel('security')->warning('Admin security event', $logData);
    }

    /**
     * Check for suspicious activity patterns
     */
    private function checkSuspiciousActivity(Request $request): void
    {
        $adminId = session('admin_user.id');
        $ip = $request->ip();
        
        // Check for rapid requests from different IPs for same admin
        $ipKey = 'admin_ips_' . $adminId;
        $recentIps = cache()->get($ipKey, []);
        
        if (!in_array($ip, $recentIps)) {
            $recentIps[] = $ip;
            
            // Keep only last 5 IPs
            if (count($recentIps) > 5) {
                array_shift($recentIps);
            }
            
            cache()->put($ipKey, $recentIps, 3600); // 1 hour
            
            // If admin is using too many different IPs, log it
            if (count($recentIps) > 3) {
                $this->logSecurityEvent('multiple_ip_usage', $request, [
                    'recent_ips' => $recentIps,
                    'ip_count' => count($recentIps)
                ]);
            }
        }
    }
}