<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and add security headers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        // Strict defaults: deny sensitive features
        $permissionsPolicy = 'geolocation=(), microphone=(), camera=()';
        // Allow camera on the admin scanner page only
        if ($request->is('admin/scanner') || $request->is('admin/scanner/*')) {
            // Allow camera for same-origin document; keep geolocation/microphone denied
            $permissionsPolicy = 'geolocation=(), microphone=(), camera=(self)';
        }
        $response->headers->set('Permissions-Policy', $permissionsPolicy);
        
        // Content Security Policy
        // Base (production-safe) directives
    $scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://app.midtrans.com', 'https://app.sandbox.midtrans.com'];
    $styleSrc = ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'];
    $fontSrc = ["'self'", 'https://fonts.gstatic.com'];
    $imgSrc = ["'self'", 'data:', 'https:'];
    $connectSrc = ["'self'", 'https://api.midtrans.com', 'https://api.sandbox.midtrans.com', 'https://app.midtrans.com', 'https://app.sandbox.midtrans.com'];
        $frameSrc = ['https://app.midtrans.com', 'https://app.sandbox.midtrans.com'];
    $workerSrc = ["'self'", 'blob:'];

        // Relax CSP for local development to support Vite dev server + HMR
        if (app()->environment('local')) {
            // Support multiple Vite dev server ports (5173-5175)
            $vitePorts = ['5173', '5174', '5175'];
            $viteHttp = array_map(fn($port) => "http://localhost:$port", $vitePorts);
            $viteWs = array_map(fn($port) => "ws://localhost:$port", $vitePorts);
            
            // Vite injects scripts and uses blob URLs in dev
            $scriptSrc = array_merge($scriptSrc, $viteHttp, ['blob:']);
            $styleSrc = array_merge($styleSrc, $viteHttp);
            // Vite serves assets (images/fonts) via its own origin
            $imgSrc = array_merge($imgSrc, $viteHttp, ['blob:']);
            $connectSrc = array_merge($connectSrc, $viteHttp, $viteWs);
            // Allow data: fonts and dev host for fonts
            $fontSrc = array_merge($fontSrc, ['data:'], $viteHttp);
            // Allow workers from blob: and vite
            $workerSrc = array_merge($workerSrc, $viteHttp);
        }

        $csp = "default-src 'self'; "
            . 'script-src ' . implode(' ', $scriptSrc) . '; '
            . 'style-src ' . implode(' ', $styleSrc) . '; '
            . 'font-src ' . implode(' ', $fontSrc) . '; '
            . 'img-src ' . implode(' ', $imgSrc) . '; '
            . 'connect-src ' . implode(' ', $connectSrc) . '; '
            . 'frame-src ' . implode(' ', $frameSrc) . '; '
            . 'worker-src ' . implode(' ', $workerSrc) . ';';

        $response->headers->set('Content-Security-Policy', $csp);

        // Remove server information
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}