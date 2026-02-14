<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\AdminAuth;
use App\Http\Middleware\AdminApiAuth;
use App\Http\Middleware\TemporaryTokenAuth;
use App\Http\Middleware\PureLaravelSync;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleCors::class,
            HandleInertiaRequests::class,
            SecurityHeaders::class,
        ]);
        // Apply security headers to API responses too
        $middleware->api(append: [
            HandleCors::class,
            SecurityHeaders::class,
        ]);
        
        $middleware->alias([
            'admin.auth' => AdminAuth::class,
            'admin.api.auth' => AdminApiAuth::class,
            'temp.auth' => TemporaryTokenAuth::class,
            'pure.sync' => PureLaravelSync::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle 404 errors
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The requested resource was not found.',
                    'error' => 'Not Found'
                ], 404);
            }
            return inertia('Errors/NotFound')->toResponse($request)->setStatusCode(404);
        });

        // Handle 401 errors
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Authentication required.',
                    'error' => 'Unauthorized'
                ], 401);
            }
            return inertia('Errors/Unauthorized')->toResponse($request)->setStatusCode(401);
        });

        // Handle 403 errors
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Access denied.',
                    'error' => 'Forbidden'
                ], 403);
            }
            return inertia('Errors/Forbidden')->toResponse($request)->setStatusCode(403);
        });

        // Handle 500 errors
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 500) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Internal server error.',
                        'error' => 'Server Error'
                    ], 500);
                }
                return inertia('Errors/ServerError')->toResponse($request)->setStatusCode(500);
            }
            if ($e->getStatusCode() === 503) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Service temporarily unavailable.',
                        'error' => 'Service Unavailable'
                    ], 503);
                }
                return inertia('Errors/ServiceUnavailable')->toResponse($request)->setStatusCode(503);
            }
        });

        // Handle maintenance mode
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Service temporarily unavailable.',
                    'error' => 'Service Unavailable'
                ], 503);
            }
            return inertia('Errors/ServiceUnavailable')->toResponse($request)->setStatusCode(503);
        });

        // Handle 429 Too Many Attempts - DISABLED for ticket purchase UX
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, $request) {
            // Log the throttle event for security monitoring
            \Log::warning('Rate limit reached', [
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'user_agent' => $request->userAgent(),
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please wait a moment and try again.',
                    'error' => 'Rate Limit'
                ], 200); // Return 200 instead of 429 for better UX
            }
            return response()->json([
                'success' => false,
                'message' => 'Please wait a moment and try again.',
                'error' => 'Rate Limit'
            ], 200);
        });
    })->create();
