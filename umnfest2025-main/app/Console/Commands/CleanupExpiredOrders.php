<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class CleanupExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cleanup-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired orders and their associated tickets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of expired orders...');
        
        try {
            // Get all orders that should be deleted using the new scope
            $allExpiredOrders = Order::expiredForDeletion()->get();
            
            $count = 0;
            foreach ($allExpiredOrders as $order) {
                $reason = $order->isExpired() ? 'Status is expire' : 'Pending too long';
                $this->info("Processing expired order: {$order->order_number} (Status: {$order->status}, Reason: {$reason})");
                Log::info('Deleting expired order', [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'reason' => $reason
                ]);
                
                // Delete associated tickets first (to maintain referential integrity)
                $ticketCount = $order->tickets()->count();
                if ($ticketCount > 0) {
                    $order->tickets()->delete();
                    $this->info("Deleted {$ticketCount} tickets for order {$order->order_number}");
                }
                
                // Then delete the order
                $order->delete();
                $this->info("Deleted order {$order->order_number}");
                
                $count++;
            }
            
            if ($count > 0) {
                $this->info("Successfully deleted {$count} expired orders");
                Log::info("Deleted {$count} expired orders");
            } else {
                $this->info("No expired orders found");
                Log::info("No expired orders found during cleanup");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Error cleaning up expired orders: {$e->getMessage()}");
            Log::error("Error cleaning up expired orders", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return 1;
        }
    }
}