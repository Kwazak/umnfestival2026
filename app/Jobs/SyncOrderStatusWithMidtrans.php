<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Transaction;

class SyncOrderStatusWithMidtrans implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $forceSync;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order = null, bool $forceSync = false)
    {
        $this->order = $order;
        $this->forceSync = $forceSync;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Setup Midtrans configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        if ($this->order) {
            // Sync specific order
            $this->syncSingleOrder($this->order);
        } elseif ($this->forceSync) {
            // Force sync all orders
            $this->forceSyncAllOrders();
        } else {
            // Sync all pending/processing orders
            $this->syncPendingOrders();
        }
    }

    /**
     * Sync a specific order with Midtrans
     */
    private function syncSingleOrder(Order $order)
    {
        try {
            Log::info("Syncing order {$order->order_number} with Midtrans");

            // Skip if order is already in final state and not forced
            if (!$this->forceSync && $this->isOrderInFinalState($order)) {
                Log::info("Order {$order->order_number} is already in final state, skipping sync");
                return;
            }

            // Get transaction status from Midtrans
            $transactionStatus = Transaction::status($order->order_number);
            
            if (!$transactionStatus) {
                Log::warning("No transaction status found for order {$order->order_number}");
                return;
            }

            $midtransStatus = $transactionStatus->transaction_status ?? null;
            $fraudStatus = $transactionStatus->fraud_status ?? null;
            
            Log::info("Midtrans status for order {$order->order_number}: {$midtransStatus}, fraud: {$fraudStatus}");

            // Map Midtrans status to our database status
            $mappedStatus = $this->mapMidtransStatusToDatabase($midtransStatus, $fraudStatus);
            
            // Check if status has changed
            if ($order->status !== $mappedStatus) {
                $oldStatus = $order->status;
                
                // Update order status
                $updateData = [
                    'status' => $mappedStatus,
                    'midtrans_transaction_id' => $transactionStatus->transaction_id ?? $order->midtrans_transaction_id,
                ];

                // Set paid_at timestamp for successful payments
                if ($this->isSuccessfulStatus($mappedStatus) && !$order->paid_at) {
                    $updateData['paid_at'] = now();
                }

                $order->update($updateData);

                Log::info("Order {$order->order_number} status updated from {$oldStatus} to {$mappedStatus}");

                // Trigger post-update actions
                $this->handleStatusChange($order, $oldStatus, $mappedStatus);
            } else {
                Log::info("Order {$order->order_number} status unchanged: {$order->status}");
            }

        } catch (\Exception $e) {
            Log::error("Failed to sync order {$order->order_number} with Midtrans: " . $e->getMessage());
            
            // If transaction not found in Midtrans, it might be expired
            if (strpos($e->getMessage(), '404') !== false) {
                $this->handleTransactionNotFound($order);
            }
        }
    }

    /**
     * Sync all pending orders with Midtrans
     */
    private function syncPendingOrders()
    {
        Log::info("Starting bulk sync of pending orders with Midtrans");

        // Get orders that might need status updates
        $orders = Order::whereIn('status', [
            'pending', 
            'authorize', 
            'capture'
        ])
        ->where('created_at', '>=', now()->subDays(7)) // Only sync recent orders
        ->get();

        Log::info("Found {$orders->count()} orders to sync");

        foreach ($orders as $order) {
            try {
                $this->syncSingleOrder($order);
                
                // Add small delay to avoid rate limiting
                usleep(100000); // 0.1 second delay
                
            } catch (\Exception $e) {
                Log::error("Failed to sync order {$order->order_number}: " . $e->getMessage());
                continue;
            }
        }

        Log::info("Completed bulk sync of pending orders");
    }

    /**
     * Force sync all orders with Midtrans
     */
    private function forceSyncAllOrders()
    {
        Log::info("Starting FORCE FULL sync of ALL orders with Midtrans");

        // Get ALL orders (no status filter)
        $orders = Order::where('created_at', '>=', now()->subDays(30)) // Limit to last 30 days to avoid too many
            ->get();

        Log::info("Found {$orders->count()} orders to force sync");

        foreach ($orders as $order) {
            try {
                $this->syncSingleOrder($order);
                
                // Smaller delay for full sync
                usleep(50000); // 0.05 second delay
                
            } catch (\Exception $e) {
                Log::error("Failed to force sync order {$order->order_number}: " . $e->getMessage());
                continue;
            }
        }

        Log::info("Completed FORCE FULL sync of all orders");
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
     * Check if status indicates successful payment
     */
    private function isSuccessfulStatus(string $status): bool
    {
        return in_array($status, ['capture', 'settlement', 'paid']);
    }

    /**
     * Map Midtrans status to database status
     */
    private function mapMidtransStatusToDatabase($midtransStatus, $fraudStatus = null)
    {
        // Handle fraud status
        if ($fraudStatus === 'deny') {
            return 'deny';
        }

        // Direct mapping for Midtrans statuses
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

        return $statusMapping[$midtransStatus] ?? 'pending';
    }

    /**
     * Handle status change actions
     */
    private function handleStatusChange(Order $order, string $oldStatus, string $newStatus)
    {
        // If payment became successful, trigger success processing
        if ($this->isSuccessfulStatus($newStatus) && !$this->isSuccessfulStatus($oldStatus)) {
            Log::info("Payment successful for order {$order->order_number}, dispatching ProcessPaymentSuccess job");
            \App\Jobs\ProcessPaymentSuccess::dispatch($order);
        }

        // If payment failed, handle failure
        if (in_array($newStatus, ['deny', 'cancel', 'expire', 'failure']) && !in_array($oldStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            Log::info("Payment failed for order {$order->order_number}, status: {$newStatus}");
            // Could dispatch a payment failure job here if needed
        }

        // Broadcast status change event (for real-time updates)
        try {
            broadcast(new \App\Events\OrderStatusUpdated($order, $oldStatus, $newStatus));
        } catch (\Exception $e) {
            Log::warning("Failed to broadcast order status update: " . $e->getMessage());
        }
    }

    /**
     * Handle case when transaction is not found in Midtrans
     */
    private function handleTransactionNotFound(Order $order)
    {
        // If order is old and still pending, mark as expired
        if ($order->status === 'pending' && $order->created_at->lt(now()->subHours(24))) {
            Log::info("Order {$order->order_number} not found in Midtrans and is old, marking as expired");
            
            $order->update(['status' => 'expire']);
            
            $this->handleStatusChange($order, 'pending', 'expire');
        }
    }

    /**
     * The job failed to process.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SyncOrderStatusWithMidtrans job failed: ' . $exception->getMessage());
    }
}