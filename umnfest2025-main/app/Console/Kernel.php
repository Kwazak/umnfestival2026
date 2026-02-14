<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run every minute to check for expired orders
        $schedule->command('orders:delete-pending')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/scheduler.log'));

        // Run cleanup for expired orders every minute
        $schedule->command('orders:cleanup-expired')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/cleanup-expired.log'));

        // Run job to delete expired orders every 30 seconds for real-time deletion
        $schedule->job(new \App\Jobs\DeleteExpiredOrders())
            ->everyThirtySeconds()
            ->withoutOverlapping()
            ->name('delete-expired-orders')
            ->onOneServer();

        // SUPER AGGRESSIVE SYNC - Every 10 seconds for all pending orders
        $schedule->call(function () {
            // Setup Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $orders = \App\Models\Order::whereIn('status', ['pending', 'authorize', 'capture'])
                ->where('created_at', '>=', now()->subDays(7))
                ->get();

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
                        // Update order
                        $updateData = ['status' => $mappedStatus];
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !$order->paid_at) {
                            $updateData['paid_at'] = now();
                        }
                        
                        $order->update($updateData);
                        
                        \Log::info("SCHEDULER SYNC: {$order->order_number}: {$oldStatus} → {$mappedStatus}");
                        
                        // Trigger success processing if needed
                        if (in_array($mappedStatus, ['capture', 'settlement']) && !in_array($oldStatus, ['capture', 'settlement', 'paid'])) {
                            \App\Jobs\ProcessPaymentSuccess::dispatch($order);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning("Scheduler sync failed for {$order->order_number}: " . $e->getMessage());
                }
            }
        })
        ->everyTenSeconds()
        ->withoutOverlapping()
        ->name('super-aggressive-sync')
        ->onOneServer();

        // Keep the job-based sync as main sync method
        $schedule->job(new \App\Jobs\SyncOrderStatusWithMidtrans())
            ->everyMinute()
            ->withoutOverlapping()
            ->name('sync-orders')
            ->onOneServer();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}