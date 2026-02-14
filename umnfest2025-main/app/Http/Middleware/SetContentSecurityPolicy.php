<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Check if we're in development environment
        if (app()->environment('local', 'development')) {
            // More permissive CSP for development - all on one line to avoid header errors
            // Extremely permissive CSP for development - allow everything
            $csp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
                   script-src * 'unsafe-inline' 'unsafe-eval';
                   script-src-elem * 'unsafe-inline' 'unsafe-eval';
                   style-src * 'unsafe-inline';
                   style-src-elem * 'unsafe-inline';
                   img-src * data: blob:;
                   font-src * data:;
                   connect-src * ws: wss:;";
            
            // Remove any newlines to avoid header errors
            $csp = preg_replace('/\s+/', ' ', $csp);
        } else {
            // Stricter CSP for production
            $csp = "default-src 'self'; font-src 'self' data:; script-src 'self'; script-src-elem 'self'; style-src 'self'; style-src-elem 'self';";
        }
        
        $response->headers->set('Content-Security-Policy', $csp);
        return $response;
    }
}
