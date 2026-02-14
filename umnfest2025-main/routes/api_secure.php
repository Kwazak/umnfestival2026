<?php

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ReferralCodeController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\DocumentationController;
use App\Http\Controllers\API\GuestStarController;
use App\Http\Controllers\API\TicketTypeController;
use App\Http\Controllers\API\DivisionController;

/*
|--------------------------------------------------------------------------
| SECURED API Routes
|--------------------------------------------------------------------------
|
| This file contains the secured version of API routes with proper
| authentication, rate limiting, and security measures implemented.
|
*/

// API Documentation (public)
Route::get('/docs', [DocumentationController::class, 'index']);

// Public routes with rate limiting
Route::middleware(['throttle:30,1'])->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/referral-codes/validate', [ReferralCodeController::class, 'validate']);
    
    // Guest Stars (public read access)
    Route::get('/guest-stars', [GuestStarController::class, 'index']);
    Route::get('/guest-stars/{guestStar}', [GuestStarController::class, 'show']);
    
    // Ticket Types (public read access)
    Route::get('/ticket-types', [TicketTypeController::class, 'index']);
    Route::get('/ticket-types/{ticketType}', [TicketTypeController::class, 'show']);

    // Divisions (public read access)
    Route::get('/divisions', [DivisionController::class, 'index']);
    Route::get('/divisions/{division}', [DivisionController::class, 'show']);
    
    Route::post('/orders/check-existing', [OrderController::class, 'checkExisting']);
    Route::get('/orders/current-price', [OrderController::class, 'getCurrentPrice']);
});

// Midtrans webhook (public, no auth required but with rate limiting)
Route::middleware(['throttle:100,1'])->group(function () {
    Route::post('/payment/notification', [PaymentController::class, 'notification']);
});

// Order and payment routes for ticket purchase (uses temporary token)
Route::middleware(['temp.auth', 'pure.sync', 'throttle:20,1'])->group(function () {
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/payment/{orderNumber}/create', [PaymentController::class, 'createPayment']);
    Route::post('/payment/{orderNumber}/verify', [PaymentController::class, 'verifyPayment']);
});

Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel'])
    ->middleware(['pure.sync', 'throttle:10,1']);

// Public payment status check (for pending page auto-refresh)
Route::get('/payment/{orderNumber}/status', [PaymentController::class, 'checkStatus'])
    ->middleware(['pure.sync', 'throttle:60,1']);

// Sync routes for real-time Midtrans integration
Route::prefix('sync')->middleware(['pure.sync', 'throttle:30,1'])->group(function () {
    // Manual sync specific order
    Route::post('/order/{orderNumber}', [App\Http\Controllers\API\SyncController::class, 'syncOrder']);
    
    // Manual sync all pending orders
    Route::post('/orders', [App\Http\Controllers\API\SyncController::class, 'syncAllOrders']);
    
    // Get real-time status from Midtrans
    Route::get('/order/{orderNumber}/status', [App\Http\Controllers\API\SyncController::class, 'getRealTimeStatus']);
    
    // Get sync statistics
    Route::get('/status', [App\Http\Controllers\API\SyncController::class, 'getSyncStatus']);
    
    // Test sync system
    Route::get('/test', function() {
        $stats = [
            'sync_system_active' => true,
            'queue_connection' => config('queue.default'),
            'midtrans_configured' => !empty(config('midtrans.server_key')),
            'recent_orders_count' => \App\Models\Order::where('created_at', '>=', now()->subHour())->count(),
            'pending_orders_count' => \App\Models\Order::whereIn('status', ['pending', 'authorize', 'capture'])->count(),
            'total_orders_count' => \App\Models\Order::count(),
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Real-time Midtrans sync system is active',
            'data' => $stats
        ]);
    });
    
    // AUTO TRIGGER - For external services like UptimeRobot to trigger sync
    Route::get('/auto-trigger', function() {
        try {
            \Log::info('🤖 AUTO TRIGGER: External sync triggered');
            
            // Setup Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Get pending orders only (more efficient)
            $orders = \App\Models\Order::whereIn('status', ['pending', 'authorize', 'capture'])
                ->where('created_at', '>=', now()->subDays(7))
                ->get();
                
            $updated = 0;

            foreach ($orders as $order) {
                try {
                    $oldStatus = $order->status;
                    
                    // Get status from Midtrans
                    $transactionStatus = \Midtrans\Transaction::status($order->order_number);
                    $midtransStatus = $transactionStatus->transaction_status ?? null;
                    
                    if (!$midtransStatus) continue;

                    // Map status
                    $statusMapping = [
                        'pending' => 'pending',
                        'authorize' => 'authorize',
                        'capture' => 'capture',
                        'settlement' => 'settlement',
                        'deny' => 'deny',
                        'cancel' => 'cancel',
                        'expire' => 'expire',
                        'refund' => 'refund',
                        'partial_refund' => 'partial_refund',
                        'chargeback' => 'chargeback',
                        'partial_chargeback' => 'partial_chargeback',
                        'failure' => 'failure',
                    ];
                    
                    $mappedStatus = $statusMapping[$midtransStatus] ?? 'pending';
                    
                    if ($oldStatus !== $mappedStatus) {
                        // Update order IMMEDIATELY
                        $updateData = ['status' => $mappedStatus];
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !$order->paid_at) {
                            $updateData['paid_at'] = now();
                        }
                        
                        $order->update($updateData);
                        
                        // Process success immediately if needed
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !in_array($oldStatus, ['capture', 'settlement', 'paid'])) {
                            // Update tickets individually to trigger model events
                            foreach ($order->tickets as $ticket) {
                                if ($ticket->status !== 'valid') {
                                    $ticket->update(['status' => 'valid']);
                                }
                            }
                            
                            try {
                                \Illuminate\Support\Facades\Mail::to($order->buyer_email)
                                    ->send(new \App\Mail\OrderConfirmationMail($order));
                            } catch (\Exception $e) {
                                \Log::warning("Failed to send email: " . $e->getMessage());
                            }
                        }
                        
                        $updated++;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "🤖 Auto sync completed",
                'synced' => $orders->count(),
                'updated' => $updated,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Auto sync failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Auto sync failed'
            ], 500);
        }
    });
});

// Protected routes with Sanctum authentication
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Order routes (admin)
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::put('/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);
});

// SECURED Admin-only routes with proper authentication and rate limiting
Route::middleware(['admin.auth', 'throttle:60,1'])->group(function () {
    // Orders management
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/resend-receipts-all', [OrderController::class, 'resendAllReceipts']);
    Route::post('/orders/{order}/resend-receipt', [OrderController::class, 'resendReceipt']);

    // Divisions admin list (all, ordered)
    Route::get('/divisions', [DivisionController::class, 'adminIndex']);
    
    // Referral codes management
    Route::get('/referral-codes', [ReferralCodeController::class, 'index']);
    Route::post('/referral-codes', [ReferralCodeController::class, 'store']);
    Route::put('/referral-codes/{id}', [ReferralCodeController::class, 'update']);
    Route::delete('/referral-codes/{id}', [ReferralCodeController::class, 'destroy']);
    
    // Guest Stars management
    Route::post('/guest-stars', [GuestStarController::class, 'store']);
    Route::put('/guest-stars/{guestStar}', [GuestStarController::class, 'update']);
    Route::delete('/guest-stars/{guestStar}', [GuestStarController::class, 'destroy']);
    
    // Ticket Types management
    Route::post('/ticket-types', [TicketTypeController::class, 'store']);
    Route::put('/ticket-types/{ticketType}', [TicketTypeController::class, 'update']);
    Route::delete('/ticket-types/{ticketType}', [TicketTypeController::class, 'destroy']);

    // Divisions management
    Route::post('/divisions', [DivisionController::class, 'store']);
    Route::put('/divisions/{division}', [DivisionController::class, 'update']);
    Route::delete('/divisions/{division}', [DivisionController::class, 'destroy']);
    
    // Tickets management (admin only)
    Route::get('/tickets', function(Request $request) {
        // SECURITY: Double-check admin session
        if (!session('admin_logged_in')) {
            \Log::warning('Unauthorized tickets access attempt', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }
        
        // Log admin access
        \Log::info('Admin accessed tickets list', [
            'admin_user' => session('admin_user.email'),
            'ip' => $request->ip()
        ]);
        
        // Allow per_page override up to 10,000 to avoid excessive payloads
        $perPage = (int) $request->query('per_page', 10000);
        if ($perPage <= 0) { $perPage = 10000; }
        $perPage = min($perPage, 10000);

        $tickets = Ticket::select('id', 'ticket_code', 'status', 'order_id', 'checked_in_at')
            ->whereNotIn('status', ['pending']) // Exclude pending tickets
            ->orderBy('created_at', 'desc')
            ->limit($perPage)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => [
                'tickets' => $tickets
            ]
        ]);
    });
});

// Ticket validation endpoint for QR scanner (public but rate limited)
Route::middleware(['throttle:100,1'])->group(function () {
    Route::get('/tickets/validate/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'validateTicket']);
    Route::post('/tickets/checkin/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'checkIn']);
});
