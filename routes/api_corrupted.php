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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Documentation (public)
Route::get('/docs', [DocumentationController::class, 'index']);

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/referral-codes/validate', [ReferralCodeController::class, 'validate']);

// Guest Stars (public read access)
Route::get('/guest-stars', [GuestStarController::class, 'index']);
Route::get('/guest-stars/{guestStar}', [GuestStarController::class, 'show']);

// Ticket Types (public read access)
Route::get('/ticket-types', [TicketTypeController::class, 'index']);
Route::get('/ticket-types/{ticketType}', [TicketTypeController::class, 'show']);


Route::post('/orders/check-existing', [App\Http\Controllers\API\OrderController::class, 'checkExisting']);
Route::get('/orders/current-price', [App\Http\Controllers\API\OrderController::class, 'getCurrentPrice']);
// Midtrans webhook (public, no auth required)
Route::post('/payment/notification', [PaymentController::class, 'notification']);

// Order and payment routes for ticket purchase (uses temporary token) - WITH PURE LARAVEL SYNC
Route::middleware(['temp.auth', 'pure.sync'])->group(function () {
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/payment/{orderNumber}/create', [PaymentController::class, 'createPayment']);
    Route::post('/payment/{orderNumber}/verify', [PaymentController::class, 'verifyPayment']);
});

Route::post('/orders/{orderNumber}/cancel', [App\Http\Controllers\API\OrderController::class, 'cancel'])->middleware('pure.sync');

// Public payment status check (for pending page auto-refresh) - WITH PURE LARAVEL SYNC
Route::get('/payment/{orderNumber}/status', [PaymentController::class, 'checkStatus'])->middleware('pure.sync');

// Sync routes for real-time Midtrans integration - WITH PURE LARAVEL SYNC
Route::prefix('sync')->middleware('pure.sync')->group(function () {
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
    
    // Check all orders status
    Route::get('/check-orders', function() {
        $orders = \App\Models\Order::select('order_number', 'status', 'paid_at', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'paid_at' => $order->paid_at ? $order->paid_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });
            
        return response()->json([
            'success' => true,
            'data' => $orders
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
            return response()->json([
                'success' => false,
                'message' => 'Auto sync failed: ' . $e->getMessage()
            ], 500);
        }
    });

    // TEST SUPER AGGRESSIVE SYNC - This will sync ALL orders IMMEDIATELY
    Route::get('/test-super-sync', function() {
        try {
            \Log::info('🔥 TESTING SUPER AGGRESSIVE SYNC');
            
            // Setup Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Get ALL orders
            $orders = \App\Models\Order::where('created_at', '>=', now()->subDays(30))->get();
            $updated = 0;
            $results = [];

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
                        
                        $results[] = [
                            'order_number' => $order->order_number,
                            'old_status' => $oldStatus,
                            'new_status' => $mappedStatus,
                            'midtrans_status' => $midtransStatus
                        ];
                        
                        $updated++;
                    }
                } catch (\Exception $e) {
                    $results[] = [
                        'order_number' => $order->order_number,
                        'error' => $e->getMessage()
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "🔥 SUPER AGGRESSIVE SYNC COMPLETED!",
                'data' => [
                    'total_orders' => $orders->count(),
                    'updated_orders' => $updated,
                    'results' => $results
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Super sync failed: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // FORCE SYNC NOW - immediate sync for any order
    Route::get('/force/{orderNumber}', function($orderNumber) {
        try {
            $order = \App\Models\Order::where('order_number', $orderNumber)->first();
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            $oldStatus = $order->status;
            
            // Setup Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            
            // Get status from Midtrans
            $transactionStatus = \Midtrans\Transaction::status($orderNumber);
            $midtransStatus = $transactionStatus->transaction_status ?? null;
            
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
            
            // Update order
            $updateData = ['status' => $mappedStatus];
            if (in_array($mappedStatus, ['capture', 'settlement']) && !$order->paid_at) {
                $updateData['paid_at'] = now();
            }
            
            $order->update($updateData);
            
            // Trigger success processing if needed
            if (in_array($mappedStatus, ['capture', 'settlement']) && !in_array($oldStatus, ['capture', 'settlement', 'paid'])) {
                \App\Jobs\ProcessPaymentSuccess::dispatch($order);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Order synced successfully',
                'data' => [
                    'order_number' => $orderNumber,
                    'old_status' => $oldStatus,
                    'new_status' => $mappedStatus,
                    'midtrans_status' => $midtransStatus,
                    'paid_at' => $order->paid_at,
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    // Order routes (admin)
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::put('/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);
});

// Admin-only routes (TEMP: no middleware for debugging)
Route::get('/orders', [OrderController::class, 'index']);

// Referral code routes are now public for debugging
Route::get('/referral-codes', [ReferralCodeController::class, 'index']);
Route::post('/referral-codes', [ReferralCodeController::class, 'store']);
Route::put('/referral-codes/{id}', [ReferralCodeController::class, 'update']);
Route::delete('/referral-codes/{id}', [ReferralCodeController::class, 'destroy']);

// Guest Stars admin routes (TEMP: no middleware for debugging)
Route::post('/guest-stars', [GuestStarController::class, 'store']);
Route::put('/guest-stars/{guestStar}', [GuestStarController::class, 'update']);
Route::delete('/guest-stars/{guestStar}', [GuestStarController::class, 'destroy']);

// Ticket Types admin routes (TEMP: no middleware for debugging)
Route::post('/ticket-types', [TicketTypeController::class, 'store']);
Route::put('/ticket-types/{ticketType}', [TicketTypeController::class, 'update']);
Route::delete('/ticket-types/{ticketType}', [TicketTypeController::class, 'destroy']);

// Simple API endpoint to get all tickets for admin (exclude pending tickets)
Route::get('/tickets', function(Request $request) {
    $tickets = Ticket::select('id', 'ticket_code', 'status', 'order_id', 'checked_in_at')
        ->whereNotIn('status', ['pending']) // Exclude pending tickets
        ->orderBy('created_at', 'desc')
        ->get();
    return response()->json([
        'success' => true,
        'data' => [
            'tickets' => $tickets
        ]
    ]);
});

// Ticket validation endpoint for QR scanner (public)
Route::get('/tickets/validate/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'validateTicket']);
Route::post('/tickets/checkin/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'checkIn']);
 
 / /   E v e n t   U p c o m i n g   D e t a i l s   ( p u b l i c   r e a d   a c c e s s )  
 R o u t e : : g e t ( ' / e v e n t - u p c o m i n g - d e t a i l s ' ,   [ A p p \ H t t p \ C o n t r o l l e r s \ A P I \ E v e n t U p c o m i n g D e t a i l C o n t r o l l e r : : c l a s s ,   ' i n d e x ' ] ) ;  
 R o u t e : : g e t ( ' / e v e n t - u p c o m i n g - d e t a i l s / { i d } ' ,   [ A p p \ H t t p \ C o n t r o l l e r s \ A P I \ E v e n t U p c o m i n g D e t a i l C o n t r o l l e r : : c l a s s ,   ' s h o w ' ] ) ;  
  
 / /   E v e n t   U p c o m i n g   D e t a i l s   a d m i n   r o u t e s   ( T E M P :   n o   m i d d l e w a r e   f o r   d e b u g g i n g )  
 R o u t e : : p o s t ( ' / e v e n t - u p c o m i n g - d e t a i l s ' ,   [ A p p \ H t t p \ C o n t r o l l e r s \ A P I \ E v e n t U p c o m i n g D e t a i l C o n t r o l l e r : : c l a s s ,   ' s t o r e ' ] ) ;  
 R o u t e : : p u t ( ' / e v e n t - u p c o m i n g - d e t a i l s / { i d } ' ,   [ A p p \ H t t p \ C o n t r o l l e r s \ A P I \ E v e n t U p c o m i n g D e t a i l C o n t r o l l e r : : c l a s s ,   ' u p d a t e ' ] ) ;  
 R o u t e : : d e l e t e ( ' / e v e n t - u p c o m i n g - d e t a i l s / { i d } ' ,   [ A p p \ H t t p \ C o n t r o l l e r s \ A P I \ E v e n t U p c o m i n g D e t a i l C o n t r o l l e r : : c l a s s ,   ' d e s t r o y ' ] ) ;  
 