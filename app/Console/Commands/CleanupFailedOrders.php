<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CleanupFailedOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cleanup-failed {--hours=6 : Orders older than this many hours}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up failed/stuck orders that are pending for too long';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = (int) $this->option('hours');
        $cutoffTime = Carbon::now()->subHours($hours);

        $this->info("Cleaning up orders older than {$hours} hours (before {$cutoffTime})...");

        // Find orders that are:
        // 1. Status = 'pending'
        // 2. Created more than X hours ago
        // 3. No snap token or snap token expired
        $expiredOrders = Order::where('status', 'pending')
            ->where('created_at', '<', $cutoffTime)
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('No expired pending orders found.');
            return 0;
        }

        $this->info("Found {$expiredOrders->count()} expired pending orders.");

        $deleted = 0;
        $failed = 0;

        foreach ($expiredOrders as $order) {
            try {
                $orderNumber = $order->order_number;
                $createdAt = $order->created_at;
                
                // Delete the order
                $order->delete();
                
                $this->line("✓ Deleted order {$orderNumber} (created: {$createdAt})");
                Log::info('Deleted expired pending order', [
                    'order_number' => $orderNumber,
                    'created_at' => $createdAt,
                    'age_hours' => Carbon::now()->diffInHours($createdAt),
                ]);
                
                $deleted++;
            } catch (\Exception $e) {
                $this->error("✗ Failed to delete order {$order->order_number}: {$e->getMessage()}");
                Log::error('Failed to delete expired order', [
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        $this->newLine();
        $this->info("Cleanup complete:");
        $this->line("  - Deleted: {$deleted} orders");
        if ($failed > 0) {
            $this->warn("  - Failed: {$failed} orders");
        }

        return 0;
    }
}
