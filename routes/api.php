<?php

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ReferralCodeController;
use App\Http\Controllers\API\DiscountCodeController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\DocumentationController;
use App\Http\Controllers\API\GuestStarController;
use App\Http\Controllers\API\TicketTypeController;
use App\Http\Controllers\API\EventUpcomingDetailController;
use App\Http\Controllers\API\CountdownEventController;
use App\Http\Controllers\API\ArchiveVideoController;
use App\Http\Controllers\API\ClosingSectionController;
use App\Http\Controllers\API\HeroSectionController;
use App\Http\Controllers\API\DivisionController;
use App\Http\Controllers\API\AdminSpinController;
use App\Http\Controllers\API\AdminEmailBlastController;

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

// Public routes - NO THROTTLE untuk user experience yang lebih baik
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/referral-codes/validate', [ReferralCodeController::class, 'validate']);
Route::post('/discount-codes/validate', [DiscountCodeController::class, 'validate']);
// Referral codes admin utilities (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/referral-codes/sync-uses', [ReferralCodeController::class, 'syncUsesAll']);
    Route::post('/referral-codes/{referralCode}/sync-uses', [ReferralCodeController::class, 'syncUsesSingle']);
});

// Guest Stars (public read access)
Route::get('/guest-stars', [GuestStarController::class, 'index']);
Route::get('/guest-stars/{guestStar}', [GuestStarController::class, 'show']);

// Ticket Types (public read access)
Route::get('/ticket-types', [TicketTypeController::class, 'index']);
Route::get('/ticket-types/{ticketType}', [TicketTypeController::class, 'show']);

// Event Upcoming Details (public read access)
Route::get('/event-upcoming-details', [EventUpcomingDetailController::class, 'index']);
Route::get('/event-upcoming-details/{id}', [EventUpcomingDetailController::class, 'show']);

// Countdown Events (public read access)
Route::get('/countdown-events', [CountdownEventController::class, 'index']);
Route::get('/countdown-events/{id}', [CountdownEventController::class, 'show']);

// Archive Videos (public read access)
Route::get('/archive-videos', [ArchiveVideoController::class, 'index']);
Route::get('/archive-videos/{id}', [ArchiveVideoController::class, 'show']);

// Closing Section (public read access)
Route::get('/closing-section', [ClosingSectionController::class, 'index']);
Route::get('/closing-section/{closingSection}', [ClosingSectionController::class, 'show']);

// Hero Section (public read access)
Route::get('/hero-section', [HeroSectionController::class, 'index']);

// Divisions (public read access)
Route::get('/divisions', [DivisionController::class, 'index']);
Route::get('/divisions/{division}', [DivisionController::class, 'show']);

// Event Pages (public read access)
Route::get('/event-pages/{pageName}', [App\Http\Controllers\API\EventPageController::class, 'show']);

// Admin Hero: single-record edit only (protected)
Route::middleware(['web', 'admin.api.auth'])->prefix('admin')->group(function () {
    Route::get('/hero-section', [HeroSectionController::class, 'admin']);
    Route::put('/hero-section', [HeroSectionController::class, 'update']);

    // Divisions management (admin)
    Route::get('/divisions', [DivisionController::class, 'adminIndex']);
    Route::post('/divisions', [\App\Http\Controllers\API\DivisionController::class, 'store']);
    Route::put('/divisions/{division}', [\App\Http\Controllers\API\DivisionController::class, 'update']);
    Route::delete('/divisions/{division}', [\App\Http\Controllers\API\DivisionController::class, 'destroy']);

    // Event Pages management (admin)
    Route::get('/event-pages', [App\Http\Controllers\API\EventPageController::class, 'index']);
    Route::get('/event-pages/{pageName}', [App\Http\Controllers\API\EventPageController::class, 'admin']);
    Route::put('/event-pages/{pageName}', [App\Http\Controllers\API\EventPageController::class, 'update']);
});

Route::middleware(['web', 'admin.api.auth'])->prefix('admin/email-blast')->group(function () {
    Route::get('/template', [AdminEmailBlastController::class, 'template']);
    Route::post('/template', [AdminEmailBlastController::class, 'saveTemplate']);
    Route::post('/preview', [AdminEmailBlastController::class, 'preview']);
    Route::post('/send', [AdminEmailBlastController::class, 'send'])->middleware('throttle:10,1');
    Route::get('/logs', [AdminEmailBlastController::class, 'logs']);
    Route::get('/production-recipients', [AdminEmailBlastController::class, 'productionRecipients']);
});

Route::post('/orders/check-existing', [App\Http\Controllers\API\OrderController::class, 'checkExisting']);
Route::get('/orders/current-price', [App\Http\Controllers\API\OrderController::class, 'getCurrentPrice']);
// Midtrans webhook (public, no auth required) with throttling to prevent abuse
Route::post('/payment/notification', [PaymentController::class, 'notification'])->middleware('throttle:60,1');

// Order and payment routes for ticket purchase (uses temporary token) - WITH PURE LARAVEL SYNC
// Rate limited to prevent abuse while allowing reasonable order creation
Route::middleware(['temp.auth', 'pure.sync', 'throttle:10,1'])->group(function () {
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/payment/{orderNumber}/create', [PaymentController::class, 'createPayment']);
    Route::post('/payment/{orderNumber}/verify', [PaymentController::class, 'verifyPayment']);
});

Route::post('/orders/{orderNumber}/cancel', [App\Http\Controllers\API\OrderController::class, 'cancel'])->middleware(['temp.auth','pure.sync']);
// Admin utilities (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/orders/{order}/repair-tickets', [App\Http\Controllers\API\OrderController::class, 'repairTickets']);
    Route::post('/orders/cleanup', [App\Http\Controllers\API\OrderController::class, 'cleanup']);
    Route::put('/orders/{order}/email', [App\Http\Controllers\API\OrderController::class, 'updateEmail']);
    Route::post('/orders/resend-receipts-all', [App\Http\Controllers\API\OrderController::class, 'resendAllReceipts']);
    Route::post('/orders/{order}/resend-receipt', [App\Http\Controllers\API\OrderController::class, 'resendReceipt'])->middleware('throttle:20,1');
    // Admin-friendly order detail (session admin or sanctum admin)
    Route::get('/admin/orders/{orderNumber}', [App\Http\Controllers\API\OrderController::class, 'show']);
    // Admin manual create (paid + sync locked)
    Route::post('/admin/orders/manual', [App\Http\Controllers\API\OrderController::class, 'adminCreateManual'])->middleware('throttle:20,1');
    // Admin overrides to lock/unlock sync and manually update status with confirmations (with throttling)
    // Use higher admin throttle to prevent Too Many Attempts during admin ops
    Route::post('/orders/{orderNumber}/lock-sync', [App\Http\Controllers\API\OrderController::class, 'lockSync'])->middleware('throttle:30,1');
    Route::post('/orders/{orderNumber}/unlock-sync', [App\Http\Controllers\API\OrderController::class, 'unlockSync'])->middleware('throttle:30,1');
    Route::put('/orders/{orderNumber}/admin-status', [App\Http\Controllers\API\OrderController::class, 'adminUpdateStatus'])->middleware('throttle:20,1');
    // Admin strict delete (only when sync_locked) – allow higher rate to avoid accidental 429 during admin cleanups
    Route::delete('/orders/{orderNumber}', [App\Http\Controllers\API\OrderController::class, 'adminDelete'])->middleware('throttle:60,1');
    // Fallback for environments where DELETE is blocked by proxies/clients – same higher throttle
    Route::post('/orders/{orderNumber}/delete', [App\Http\Controllers\API\OrderController::class, 'adminDelete'])->middleware('throttle:60,1');
});

// Public payment status check (for pending page auto-refresh) - WITH PURE LARAVEL SYNC
// NO THROTTLE - Allow frequent polling for real-time payment status updates
Route::get('/payment/{orderNumber}/status', [PaymentController::class, 'checkStatus'])->middleware(['pure.sync']);

// Sync routes for real-time Midtrans integration - WITH PURE LARAVEL SYNC
// Protected with admin auth for security
Route::prefix('sync')->middleware(['web', 'admin.api.auth', 'pure.sync'])->group(function () {
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
    // Protected: requires admin auth to prevent abuse
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

// Admin-only routes
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
});

// Referral code admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::get('/referral-codes', [ReferralCodeController::class, 'index']);
    Route::post('/referral-codes', [ReferralCodeController::class, 'store']);
    Route::put('/referral-codes/{id}', [ReferralCodeController::class, 'update']);
    Route::delete('/referral-codes/{id}', [ReferralCodeController::class, 'destroy']);
});

// Discount code routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::get('/discount-codes', [DiscountCodeController::class, 'index']);
    Route::post('/discount-codes', [DiscountCodeController::class, 'store']);
    Route::put('/discount-codes/{id}', [DiscountCodeController::class, 'update']);
    Route::delete('/discount-codes/{id}', [DiscountCodeController::class, 'destroy']);
    Route::post('/discount-codes/recalculate-usage', [DiscountCodeController::class, 'recalculateUsage']);
    
    // Bundle ticket feature toggle
    Route::get('/admin/settings/bundle-ticket', [\App\Http\Controllers\API\Admin\SettingController::class, 'getBundleTicket']);
    Route::post('/admin/settings/bundle-ticket', [\App\Http\Controllers\API\Admin\SettingController::class, 'setBundleTicket']);
});

// Public settings endpoints
Route::get('/settings/bundle-ticket', [\App\Http\Controllers\API\Admin\SettingController::class, 'publicGetBundleTicket']);

// Guest Stars admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/guest-stars', [GuestStarController::class, 'store']);
    Route::put('/guest-stars/{guestStar}', [GuestStarController::class, 'update']);
    Route::delete('/guest-stars/{guestStar}', [GuestStarController::class, 'destroy']);
});

// Ticket Types admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/ticket-types', [TicketTypeController::class, 'store']);
    Route::put('/ticket-types/{ticketType}', [TicketTypeController::class, 'update']);
    Route::delete('/ticket-types/{ticketType}', [TicketTypeController::class, 'destroy']);
});

// Event Upcoming Details admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/event-upcoming-details', [EventUpcomingDetailController::class, 'store']);
    Route::put('/event-upcoming-details/{id}', [EventUpcomingDetailController::class, 'update']);
    Route::delete('/event-upcoming-details/{id}', [EventUpcomingDetailController::class, 'destroy']);
});

// Countdown Events admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/countdown-events', [CountdownEventController::class, 'store']);
    Route::put('/countdown-events/{id}', [CountdownEventController::class, 'update']);
    Route::delete('/countdown-events/{id}', [CountdownEventController::class, 'destroy']);
});

// Archive Videos admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::post('/archive-videos', [ArchiveVideoController::class, 'store']);
    Route::put('/archive-videos/{id}', [ArchiveVideoController::class, 'update']);
    Route::delete('/archive-videos/{id}', [ArchiveVideoController::class, 'destroy']);
});

// Closing Section admin routes (protected)
Route::middleware(['web','admin.api.auth'])->group(function () {
    Route::get('/admin/closing-sections', [ClosingSectionController::class, 'admin']);
    Route::post('/closing-section', [ClosingSectionController::class, 'store']);
    Route::put('/closing-section/{closingSection}', [ClosingSectionController::class, 'update']);
    Route::delete('/closing-section/{closingSection}', [ClosingSectionController::class, 'destroy']);
});

// Tickets listing (admin only)
Route::middleware(['web','admin.api.auth'])->get('/tickets', function(Request $request) {
    $tickets = Ticket::select('id', 'ticket_code', 'status', 'order_id', 'checked_in_at', 'scanned_by', 'frame_before_1500ms', 'frame_before_700ms', 'frame_after_700ms', 'frame_after_1500ms')
        ->whereNotIn('status', ['pending'])
        ->with(['order:id,buyer_name,buyer_email,status,final_amount,amount,ticket_quantity'])
        ->orderBy('created_at', 'desc')
        ->get();
    return response()->json([
        'success' => true,
        'data' => [ 'tickets' => $tickets ]
    ]);
});

// Admin utility: reset tickets (protected)
Route::middleware(['web','admin.api.auth'])->post('/tickets/reset-all', [App\Http\Controllers\API\TicketController::class, 'resetAll']);
// Admin utility: reset single ticket (protected)
Route::middleware(['web','admin.api.auth','throttle:30,1'])->post('/tickets/{ticketCode}/reset', [App\Http\Controllers\API\TicketController::class, 'adminResetSingle']);
// Admin: upload and store frame captures for a ticket
Route::middleware(['web','admin.api.auth','throttle:60,1'])->post('/tickets/{ticketCode}/frames', [App\Http\Controllers\API\TicketController::class, 'storeFrames']);

// Ticket validation public (with throttling) and check-in admin-only
Route::middleware(['throttle:10,1'])->group(function () {
    Route::get('/tickets/validate/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'validateTicket']);
});
Route::middleware(['web','admin.api.auth'])->group(function () {
    // Higher throttle for on-site scanning to avoid 429 (admin only)
    Route::middleware('throttle:300,1')->get('/admin/tickets/validate/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'adminValidateTicket']);
    Route::middleware('throttle:300,1')->post('/tickets/checkin/{ticketCode}', [App\Http\Controllers\API\TicketController::class, 'checkIn']);
});

// Chatbot routes (public with rate limiting)
Route::middleware(['throttle:30,1'])->prefix('chatbot')->group(function () {
    Route::post('/chat', [App\Http\Controllers\API\ChatbotController::class, 'chat']);
    Route::get('/suggestions', [App\Http\Controllers\API\ChatbotController::class, 'getSuggestions']);
    Route::get('/history', [App\Http\Controllers\API\ChatbotController::class, 'getHistory']);
    Route::get('/health', [App\Http\Controllers\API\ChatbotController::class, 'health']);
});

// Chatbot admin routes (for statistics)
Route::get('/chatbot/stats', [App\Http\Controllers\API\ChatbotController::class, 'getStats']);

// Chatbot admin management routes (protected)
Route::middleware(['web', 'admin.api.auth'])->prefix('admin/chatbot')->group(function () {
    Route::get('/knowledge', [App\Http\Controllers\API\ChatbotAdminController::class, 'getKnowledge']);
    Route::post('/knowledge', [App\Http\Controllers\API\ChatbotAdminController::class, 'createKnowledge']);
    Route::put('/knowledge/{id}', [App\Http\Controllers\API\ChatbotAdminController::class, 'updateKnowledge']);
    Route::delete('/knowledge/{id}', [App\Http\Controllers\API\ChatbotAdminController::class, 'deleteKnowledge']);
    Route::patch('/knowledge/{id}/toggle', [App\Http\Controllers\API\ChatbotAdminController::class, 'toggleKnowledgeStatus']);
    
    Route::get('/analytics', [App\Http\Controllers\API\ChatbotAdminController::class, 'getAnalytics']);
    Route::get('/conversations', [App\Http\Controllers\API\ChatbotAdminController::class, 'getConversations']);
    Route::get('/categories', [App\Http\Controllers\API\ChatbotAdminController::class, 'getCategories']);
    
    Route::post('/bulk-import', [App\Http\Controllers\API\ChatbotAdminController::class, 'bulkImport']);
    Route::get('/export', [App\Http\Controllers\API\ChatbotAdminController::class, 'exportKnowledge']);
    Route::post('/test', [App\Http\Controllers\API\ChatbotAdminController::class, 'testResponse']);
    
    // AI Translation endpoint
    Route::post('/translate', [App\Http\Controllers\API\ChatbotTranslationController::class, 'translate']);
});

// Spin management (admin)
Route::middleware(['web', 'admin.api.auth'])->prefix('admin/spin')->group(function () {
    Route::get('/dashboard', [AdminSpinController::class, 'dashboard']);
    Route::put('/prizes/{spinPrize}', [AdminSpinController::class, 'updatePrize']);
    Route::get('/attempts', [AdminSpinController::class, 'attempts']);
    Route::delete('/attempts/{spinAttempt}', [AdminSpinController::class, 'destroy']);
});

// Spin the Wheel (public)
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/spin/validate', [App\Http\Controllers\API\SpinController::class, 'validate']);
    Route::post('/spin/execute', [App\Http\Controllers\API\SpinController::class, 'execute']);
    Route::get('/spin/prizes', [App\Http\Controllers\API\SpinController::class, 'prizes']);
});
