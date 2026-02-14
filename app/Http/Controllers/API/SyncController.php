<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\SyncOrderStatusWithMidtrans;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    /**
     * Manually sync a specific order with Midtrans
     * POST /api/sync/order/{orderNumber}
     */
    public function syncOrder(Request $request, $orderNumber)
    {
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            Log::info("Manual sync requested for order: {$orderNumber}");

            // Force sync even if order is in final state
            $forceSync = $request->boolean('force', false);

            // Dispatch sync job
            SyncOrderStatusWithMidtrans::dispatch($order, $forceSync);

            return response()->json([
                'success' => true,
                'message' => 'Order sync initiated',
                'data' => [
                    'order_number' => $orderNumber,
                    'current_status' => $order->status,
                    'force_sync' => $forceSync,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to initiate sync for order {$orderNumber}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate sync: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync all pending orders with Midtrans
     * POST /api/sync/orders
     */
    public function syncAllOrders(Request $request)
    {
        try {
            Log::info("Manual bulk sync requested for all pending orders");

            // Dispatch bulk sync job
            SyncOrderStatusWithMidtrans::dispatch();

            // Get count of orders that will be synced
            $pendingCount = Order::whereIn('status', [
                'pending', 
                'authorize', 
                'capture'
            ])
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

            return response()->json([
                'success' => true,
                'message' => 'Bulk order sync initiated',
                'data' => [
                    'pending_orders_count' => $pendingCount,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to initiate bulk sync: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate bulk sync: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get real-time status of an order directly from Midtrans
     * GET /api/sync/order/{orderNumber}/status
     */
    public function getRealTimeStatus($orderNumber)
    {
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            // Setup Midtrans configuration
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Get real-time status from Midtrans
            $transactionStatus = \Midtrans\Transaction::status($orderNumber);

            $midtransData = [
                'transaction_status' => $transactionStatus->transaction_status ?? null,
                'fraud_status' => $transactionStatus->fraud_status ?? null,
                'transaction_id' => $transactionStatus->transaction_id ?? null,
                'payment_type' => $transactionStatus->payment_type ?? null,
                'transaction_time' => $transactionStatus->transaction_time ?? null,
                'gross_amount' => $transactionStatus->gross_amount ?? null,
                'status_code' => $transactionStatus->status_code ?? null,
                'status_message' => $transactionStatus->status_message ?? null,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => [
                        'order_number' => $order->order_number,
                        'current_status' => $order->status,
                        'status_description' => $order->status_description,
                        'is_successful' => $order->isSuccessful(),
                        'is_failed' => $order->isFailed(),
                        'is_pending' => $order->isPending(),
                        'paid_at' => $order->paid_at,
                        'updated_at' => $order->updated_at,
                    ],
                    'midtrans' => $midtransData,
                    'status_match' => $this->checkStatusMatch($order->status, $midtransData['transaction_status']),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get real-time status for order {$orderNumber}: " . $e->getMessage());

            // If transaction not found, return order status only
            if (strpos($e->getMessage(), '404') !== false) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'order_number' => $order->order_number,
                            'current_status' => $order->status,
                            'status_description' => $order->status_description,
                            'is_successful' => $order->isSuccessful(),
                            'is_failed' => $order->isFailed(),
                            'is_pending' => $order->isPending(),
                            'paid_at' => $order->paid_at,
                            'updated_at' => $order->updated_at,
                        ],
                        'midtrans' => null,
                        'error' => 'Transaction not found in Midtrans (possibly expired)',
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to get real-time status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sync status and statistics
     * GET /api/sync/status
     */
    public function getSyncStatus()
    {
        try {
            $stats = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::whereIn('status', ['pending', 'authorize'])->count(),
                'successful_orders' => Order::whereIn('status', ['capture', 'settlement', 'paid'])->count(),
                'failed_orders' => Order::whereIn('status', ['deny', 'cancel', 'expire', 'failure', 'failed', 'cancelled'])->count(),
                'refunded_orders' => Order::whereIn('status', ['refund', 'partial_refund'])->count(),
                'chargeback_orders' => Order::whereIn('status', ['chargeback', 'partial_chargeback'])->count(),
                'recent_orders' => Order::where('created_at', '>=', now()->subHours(24))->count(),
                'orders_needing_sync' => Order::whereIn('status', ['pending', 'authorize', 'capture'])
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'last_updated' => now()->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get sync status: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get sync status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if database status matches Midtrans status
     */
    private function checkStatusMatch($dbStatus, $midtransStatus)
    {
        if (!$midtransStatus) {
            return null;
        }

        // Direct match
        if ($dbStatus === $midtransStatus) {
            return true;
        }

        // Check equivalent statuses
        $equivalents = [
            'paid' => ['capture', 'settlement'],
            'capture' => ['settlement'],
            'failed' => ['deny', 'failure'],
            'cancelled' => ['cancel', 'expire'],
        ];

        foreach ($equivalents as $dbStat => $midtransStats) {
            if ($dbStatus === $dbStat && in_array($midtransStatus, $midtransStats)) {
                return true;
            }
        }

        return false;
    }
}