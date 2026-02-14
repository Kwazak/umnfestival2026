<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPaymentSuccess;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Setup Midtrans configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Check payment status of an order (public)
     * GET /api/payment/{orderNumber}/status
     */
    public function checkStatus($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Skip auto-sync in status check if admin has locked the order
        if (!($order->sync_locked ?? false)) {
            try {
                $this->syncOrderStatusNow($order);
                $order->refresh();
            } catch (\Exception $e) {
                Log::error("Failed to sync order status: " . $e->getMessage());
            }
        }

        // Compute payment expiry time (5 hours from token creation or order creation)
        try {
            $baseTime = $order->snap_token_created_at ?: $order->created_at;
            $expiresAt = \Carbon\Carbon::parse($baseTime)->addHours(5);
        } catch (\Exception $e) {
            $expiresAt = null;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $order->status,
                'status_description' => $order->status_description,
                'is_successful' => $order->isSuccessful(),
                'is_failed' => $order->isFailed(),
                'is_pending' => $order->isPending(),
                'paid_at' => $order->paid_at,
                'updated_at' => $order->updated_at,
                'expires_at' => $expiresAt ? $expiresAt->toISOString() : null,
            ],
        ]);
    }

    /**
     * Verify payment of an order (requires temp.auth middleware)
     * POST /api/payment/{orderNumber}/verify
     */
    public function verifyPayment(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Query Midtrans API for real-time transaction status
        try {
            $transactionStatus = \Midtrans\Transaction::status($orderNumber);
        } catch (\Exception $e) {
            \Log::error("Midtrans transaction status check failed for order {$orderNumber}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment status',
            ], 500);
        }

        $status = $transactionStatus->transaction_status ?? null;

        // Map Midtrans status directly to database
        $mappedStatus = $this->mapMidtransStatusToDatabase($status);
        
        if (in_array($status, ['capture', 'settlement'])) {
            // Update order status if not already in a successful state
            if (!in_array($order->status, ['capture', 'settlement', 'paid'])) {
                $order->status = $mappedStatus;
                $order->paid_at = now();
                $order->save();

                \Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber} via verifyPayment");

                // Normalize ticket statuses to valid immediately (idempotent)
                try {
                    $order->loadMissing('tickets');
                    $updatedCount = 0;
                    foreach ($order->tickets as $ticket) {
                        if ($ticket->status !== 'valid') {
                            $ticket->update(['status' => 'valid']);
                            $updatedCount++;
                        }
                    }
                    \Log::info("Updated {$updatedCount} tickets to valid for order: {$orderNumber} via verifyPayment");
                } catch (\Exception $e) {
                    \Log::warning('Ticket normalization failed on verifyPayment: ' . $e->getMessage());
                }

                $this->runPaymentSuccessPipeline($order);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $order,
                ],
            ]);
        } elseif (in_array($status, ['deny', 'cancel', 'expire', 'failure'])) {
            // Update order status to the specific Midtrans status
            if (!in_array($order->status, ['deny', 'cancel', 'expire', 'failure', 'cancelled', 'failed'])) {
                $order->status = $mappedStatus;
                $order->save();

                \Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber} via verifyPayment");
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment was cancelled or denied',
            ], 400);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Payment not verified',
            ], 400);
        }
    }

    /**
     * Create payment token for an order (requires temp.auth middleware)
     * GET /api/payment/{orderNumber}/create
     */
    public function createPayment(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Check if order already has a valid snap token (created within last 5 hours)
        if ($order->snap_token && $order->snap_token_created_at) {
            $tokenAge = now()->diffInHours($order->snap_token_created_at);
            if ($tokenAge < 5) {
                Log::info('Reusing existing snap token for order', [
                    'order_number' => $order->order_number,
                    'token_age_hours' => $tokenAge,
                ]);
                return response()->json([
                    'success' => true,
                    'data' => [
                        'snap_token' => $order->snap_token,
                    ],
                    'reused' => true,
                ]);
            }
        }

        // Prepare transaction details for Midtrans Snap
        $transactionDetails = [
            'order_id' => $order->order_number,
            'gross_amount' => $order->final_amount,
        ];

        // Prepare customer details
        $customerDetails = [
            'first_name' => $order->buyer_name,
            'email' => $order->buyer_email,
            'phone' => $order->buyer_phone,
        ];

        // Prepare item details (optional)
        $itemDetails = [
            [
                'id' => 'ticket',
                'price' => $order->final_amount,
                'quantity' => 1,
                'name' => 'UMN Festival 2025 Ticket',
            ],
        ];

        $params = [
            'transaction_details' => $transactionDetails,
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
            'credit_card' => [
                'secure' => true,
            ],
            // Enable additional payment methods including other_qris to support mobile QRIS per Midtrans guidance
            'enabled_payments' => [
                "gopay",
                "shopeepay",
                "qris",
                "other_qris", // added to ensure QRIS availability on mobile devices
                "permata_va",
                "bca_va",
                "bni_va",
                "other_va"
            ],
            'expiry' => [
                'start_time' => date('Y-m-d H:i:s O'),
                'unit' => 'hour',
                'duration' => 5,
            ],
            'callbacks' => [
                'finish' => url('/payment-status'),
                'unfinish' => url('/payment-status'),
                'error' => url('/payment-status'),
            ],
        ];

        try {
            Log::info('Creating Midtrans snap token', [
                'order_number' => $order->order_number,
                'env_is_production' => config('midtrans.is_production'),
                'server_key_present' => !empty(config('midtrans.server_key')),
                'api_url' => config('midtrans.api_url') ?? null,
            ]);
            $snapToken = Snap::getSnapToken($params);
            $order->snap_token = $snapToken;
            $order->snap_token_created_at = now();
            $order->save();
            return response()->json([
                'success' => true,
                'data' => [
                    'snap_token' => $snapToken,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Midtrans Snap token generation failed: ' . $e->getMessage(), [
                'params' => $params,
                'exception' => $e,
                'order_number' => $order->order_number,
                'env_is_production' => config('midtrans.is_production'),
                'server_key_present' => !empty(config('midtrans.server_key')),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment token: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Midtrans payment notification webhook (public)
     * POST /payment/notification
     */
    public function notification(Request $request)
    {
        $payload = $request->all();

        Log::info('Received payment notification', $payload);

        // Validate Midtrans notification signature
        // Reference: signature_key = SHA512(order_id + status_code + gross_amount + server_key)
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $signatureKey = $request->input('signature_key');
        if ($orderId && $statusCode && $grossAmount && $signatureKey) {
            $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . config('midtrans.server_key'));
            if (!hash_equals($expectedSignature, $signatureKey)) {
                Log::warning('Invalid Midtrans signature on notification', [
                    'order_id' => $orderId,
                    'status_code' => $statusCode,
                    'gross_amount' => $grossAmount,
                ]);
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        } else {
            Log::warning('Missing fields for Midtrans signature verification', [
                'has_order_id' => (bool) $orderId,
                'has_status_code' => (bool) $statusCode,
                'has_gross_amount' => (bool) $grossAmount,
                'has_signature_key' => (bool) $signatureKey,
            ]);
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $orderNumber = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if (!$orderNumber || !$transactionStatus) {
            Log::warning('Invalid payment notification payload');
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            Log::warning("Order not found for notification: {$orderNumber}");
            return response()->json(['message' => 'Order not found'], 404);
        }

        Log::info("Processing payment notification for order: {$orderNumber} with status: {$transactionStatus}");

        // Map Midtrans status directly to database
        $mappedStatus = $this->mapMidtransStatusToDatabase($transactionStatus);

        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            // Payment successful
            if (!in_array($order->status, ['capture', 'settlement', 'paid'])) {
                $order->status = $mappedStatus;
                $order->paid_at = now();
                $order->save();

                Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber}");

                // Normalize ticket statuses to valid immediately (idempotent)
                try {
                    $order->loadMissing('tickets');
                    $updatedCount = 0;
                    foreach ($order->tickets as $ticket) {
                        if ($ticket->status !== 'valid') {
                            $ticket->update(['status' => 'valid']);
                            $updatedCount++;
                        }
                    }
                    Log::info("Updated {$updatedCount} tickets to valid for order: {$orderNumber} (notification)");
                } catch (\Exception $e) {
                    Log::warning('Ticket normalization failed on notification: ' . $e->getMessage());
                }

                $this->runPaymentSuccessPipeline($order);
            } else {
                Log::info("Order already marked as successful: {$orderNumber}");
            }
        } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            // Payment failed or cancelled - use exact Midtrans status
            if (!in_array($order->status, ['deny', 'cancel', 'expire', 'failure', 'cancelled', 'failed'])) {
                $order->status = $mappedStatus;
                $order->save();

                Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber}");
            }
        } elseif (in_array($transactionStatus, ['authorize', 'pending'])) {
            // Update to exact Midtrans status for pending/authorize states
            if ($order->status !== $mappedStatus) {
                $order->status = $mappedStatus;
                $order->save();

                Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber}");
            }
        } elseif (in_array($transactionStatus, ['refund', 'partial_refund', 'chargeback', 'partial_chargeback'])) {
            // Handle refund and chargeback statuses
            $order->status = $mappedStatus;
            $order->save();

            Log::info("Order status updated to {$mappedStatus} for order: {$orderNumber}");
        } else {
            Log::info("Unhandled transaction status '{$transactionStatus}' for order: {$orderNumber}");
        }

        return response()->json(['message' => 'Notification processed']);
    }

    /**
     * Ensure payment success side-effects (tickets, email, PDFs) run reliably.
     */
    private function runPaymentSuccessPipeline(Order $order): void
    {
        $freshOrder = $order->fresh(['tickets', 'referralCode', 'discountCode']) ?? $order;

        try {
            ProcessPaymentSuccess::dispatchSync($freshOrder);
            Log::info("ProcessPaymentSuccess job executed synchronously for order: {$freshOrder->order_number}");
        } catch (\Throwable $e) {
            Log::error("Failed running ProcessPaymentSuccess job synchronously for order {$freshOrder->order_number}", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Map Midtrans transaction status to database status
     * Ensures data type compatibility between Midtrans API and database
     */
    private function mapMidtransStatusToDatabase($midtransStatus)
    {
        // Direct mapping for exact Midtrans statuses that exist in our enum
        $directMapping = [
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

        // Return direct mapping if exists
        if (isset($directMapping[$midtransStatus])) {
            return $directMapping[$midtransStatus];
        }

        // Fallback mapping for backward compatibility or unknown statuses
        switch ($midtransStatus) {
            case 'capture':
            case 'settlement':
                return 'settlement'; // Use settlement as the final successful state
            case 'deny':
            case 'failure':
                return 'deny'; // Map failures to deny
            case 'cancel':
            case 'expire':
                return 'cancel'; // Map cancellations and expirations to cancel
            default:
                // For unknown statuses, log and return pending
                Log::warning("Unknown Midtrans status received: {$midtransStatus}");
                return 'pending';
        }
    }

    /**
     * Check if order is in a final state
     */
    private function isOrderInFinalState(Order $order): bool
    {
        return in_array($order->status, [
            'settlement',
            'deny',
            'cancel',
            'expire',
            'refund',
            'partial_refund',
            'chargeback',
            'partial_chargeback',
            'failure',
            'cancelled',
            'failed'
        ]);
    }

    /**
     * Sync order status immediately (synchronous)
     */
    private function syncOrderStatusNow(Order $order)
    {
        try {
            // Do not override manually locked orders
            if ($order->sync_locked ?? false) {
                Log::info("Sync skipped for locked order: {$order->order_number}");
                return;
            }
            // Get transaction status from Midtrans
            $transactionStatus = \Midtrans\Transaction::status($order->order_number);
            
            if (!$transactionStatus) {
                return;
            }

            $midtransStatus = $transactionStatus->transaction_status ?? null;
            $mappedStatus = $this->mapMidtransStatusToDatabase($midtransStatus);
            
            // Update if status has changed
            if ($order->status !== $mappedStatus) {
                $oldStatus = $order->status;
                
                $updateData = [
                    'status' => $mappedStatus,
                    'midtrans_transaction_id' => $transactionStatus->transaction_id ?? $order->midtrans_transaction_id,
                ];

                // Set paid_at timestamp for successful payments
                if (in_array($mappedStatus, ['capture', 'settlement']) && !$order->paid_at) {
                    $updateData['paid_at'] = now();
                }

                $order->update($updateData);

                Log::info("Order {$order->order_number} status synced from {$oldStatus} to {$mappedStatus}");

                // Trigger success processing if payment became successful
                if (in_array($mappedStatus, ['capture', 'settlement']) && !in_array($oldStatus, ['capture', 'settlement', 'paid'])) {
                    // Normalize ticket statuses to valid immediately (idempotent)
                    try {
                        $order->loadMissing('tickets');
                        $updatedCount = 0;
                        foreach ($order->tickets as $ticket) {
                            if ($ticket->status !== 'valid') {
                                $ticket->update(['status' => 'valid']);
                                $updatedCount++;
                            }
                        }
                        Log::info("Updated {$updatedCount} tickets to valid for order: {$order->order_number} via syncOrderStatusNow");
                    } catch (\Exception $e) {
                        Log::warning('Ticket normalization failed on syncOrderStatusNow: ' . $e->getMessage());
                    }

                    ProcessPaymentSuccess::dispatch($order);
                }

                // Broadcast status change
                try {
                    broadcast(new \App\Events\OrderStatusUpdated($order, $oldStatus, $mappedStatus));
                } catch (\Exception $e) {
                    Log::warning("Failed to broadcast order status update: " . $e->getMessage());
                }
            }

        } catch (\Exception $e) {
            if (strpos($e->getMessage(), '404') !== false) {
                // 404 is normal for new orders that haven't been paid yet
                // Only mark as expired if the order is older than the payment expiry time (5 hours + small buffer)
                if (!($order->sync_locked ?? false) && $order->created_at->lt(now()->subMinutes(310)) && $order->status === 'pending') {
                    $oldStatus = $order->status;
                    $order->update(['status' => 'expire']);
                    Log::info("Order {$order->order_number} marked as expired due to age and Midtrans 404");
                } else {
                    Log::debug("Order {$order->order_number} received 404 from Midtrans but is still within payment window");
                }
            } else {
                Log::warning("Failed to sync order status immediately: " . $e->getMessage());
            }
        }
    }
}
