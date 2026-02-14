<?php

namespace App\Http\Middleware;

use App\Models\Order;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PureLaravelSync
{
    /**
     * Handle an incoming request - PURE LARAVEL SYNC
     */
    public function handle(Request $request, Closure $next): Response
    {
        // SYNC ONLY EVERY 30 SECONDS - PURE LARAVEL
        $this->purelaravelSyncThrottled();
        
        return $next($request);
    }

    /**
     * THROTTLED SYNC - ONLY EVERY 30 SECONDS
     */
    private function purelaravelSyncThrottled()
    {
        $cacheKey = 'pure_laravel_sync_last_run';
        $lastRun = cache($cacheKey);
        $now = now()->timestamp;
        
        // Only run if 30 seconds have passed since last sync
        if ($lastRun && ($now - $lastRun) < 30) {
            return;
        }
        
        // Update cache with current timestamp
        cache([$cacheKey => $now], 60); // Cache for 1 minute
        
        $this->purelaravelSyncNow();
    }

    /**
     * PURE LARAVEL SYNC - NO EXTERNAL DEPENDENCIES
     */
    private function purelaravelSyncNow()
    {
        try {
            Log::info("🔥 PURE LARAVEL SYNC: Starting immediate sync");

            // Setup Midtrans
            $serverKey = config('midtrans.server_key');
            if (empty($serverKey)) {
                Log::warning('PURE SYNC skipped: MIDTRANS_SERVER_KEY missing');
                return;
            }
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Only sync likely-changing orders in a small recent window
            $orders = Order::whereIn('status', ['pending','authorize','capture'])
                ->where('created_at', '>=', now()->subMinutes(15))
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            if ($orders->isEmpty()) {
                return;
            }

            Log::info("🔥 PURE LARAVEL SYNC: Found {$orders->count()} orders to sync");

            $updated = 0;

            foreach ($orders as $order) {
                // Skip orders that are manually locked from sync (admin override)
                if ($order->sync_locked ?? false) {
                    continue;
                }
                try {
                    $oldStatus = $order->status;
                    
                    // Get status from Midtrans IMMEDIATELY
                    $transactionStatus = \Midtrans\Transaction::status($order->order_number);
                    $midtransStatus = $transactionStatus->transaction_status ?? null;
                    
                    if (!$midtransStatus) continue;

                    // Direct status mapping
                    $mappedStatus = $this->mapStatus($midtransStatus);
                    
                    if ($oldStatus !== $mappedStatus) {
                        // Update IMMEDIATELY
                        $updateData = ['status' => $mappedStatus];
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !$order->paid_at) {
                            $updateData['paid_at'] = now();
                        }
                        
                        $order->update($updateData);
                        
                        Log::info("🔥 PURE SYNC: {$order->order_number}: {$oldStatus} → {$mappedStatus}");
                        
                        // Process success IMMEDIATELY - NO JOBS, NO QUEUES
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !in_array($oldStatus, ['capture', 'settlement', 'paid'])) {
                            $this->processSuccessImmediately($order);
                        }
                        
                        $updated++;
                    }
                } catch (\Exception $e) {
                    // Continue with other orders
                    continue;
                }
            }

            if ($updated > 0) {
                Log::info("🎉 PURE LARAVEL SYNC: {$updated} orders updated IMMEDIATELY");
            }

        } catch (\Exception $e) {
            Log::error("Pure Laravel sync failed: " . $e->getMessage());
        }
    }

    /**
     * Map Midtrans status
     */
    private function mapStatus($midtransStatus)
    {
        $mapping = [
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

        return $mapping[$midtransStatus] ?? 'pending';
    }

    /**
     * Process payment success IMMEDIATELY - NO JOBS
     */
    private function processSuccessImmediately(Order $order)
    {
        try {
            Log::info("🚀 IMMEDIATE PROCESSING: {$order->order_number}");

            // Update tickets individually to trigger model events
            foreach ($order->tickets as $ticket) {
                if ($ticket->status !== 'valid') {
                    $ticket->update(['status' => 'valid']);
                }
            }
            
            Log::info("✅ Tickets updated IMMEDIATELY: {$order->order_number}");

            // Send email IMMEDIATELY - NO QUEUE
            try {
                \Illuminate\Support\Facades\Mail::to($order->buyer_email)
                    ->send(new \App\Mail\OrderConfirmationMail($order));
                
                Log::info("✅ Email sent IMMEDIATELY: {$order->buyer_email}");
            } catch (\Exception $e) {
                Log::warning("Email failed: " . $e->getMessage());
            }

        } catch (\Exception $e) {
            Log::error("Immediate processing failed: " . $e->getMessage());
        }
    }
}