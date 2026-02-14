<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DeleteExpiredOrders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting automatic deletion of expired orders...');
        
        try {
            // Find all orders that should be deleted (expired status or old pending orders)
            $expiredOrders = Order::expiredForDeletion()->get();
            
            $count = 0;
            foreach ($expiredOrders as $order) {
                Log::info('Deleting expired order', [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'reason' => $order->isExpired() ? 'Status is expire' : 'Pending too long'
                ]);
                
                // Delete associated tickets first (to maintain referential integrity)
                $ticketCount = $order->tickets()->count();
                if ($ticketCount > 0) {
                    $order->tickets()->delete();
                    Log::info("Deleted {$ticketCount} tickets for expired order {$order->order_number}");
                }
                
                // Then delete the order
                $order->delete();
                Log::info("Successfully deleted expired order {$order->order_number}");
                
                $count++;
            }
            
            if ($count > 0) {
                Log::info("Successfully deleted {$count} expired orders");
            } else {
                Log::info("No expired orders found for deletion");
            }
            
        } catch (\Exception $e) {
            Log::error("Error deleting expired orders", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
}