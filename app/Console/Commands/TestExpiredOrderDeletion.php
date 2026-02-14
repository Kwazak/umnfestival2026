<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Jobs\DeleteExpiredOrders;
use Illuminate\Support\Facades\Log;

class TestExpiredOrderDeletion extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:test-expired-deletion';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the automatic deletion of expired orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing expired order deletion functionality...');
        
        try {
            // Show current expired orders
            $expiredOrders = Order::where('status', 'expire')->get();
            $this->info("Found {$expiredOrders->count()} orders with 'expire' status:");
            
            foreach ($expiredOrders as $order) {
                $this->line("- Order: {$order->order_number} | Status: {$order->status} | Created: {$order->created_at}");
            }
            
            if ($expiredOrders->count() > 0) {
                $this->info("\nDispatching DeleteExpiredOrders job...");
                DeleteExpiredOrders::dispatch();
                $this->info("Job dispatched successfully!");
                
                $this->info("\nWaiting 3 seconds for job to process...");
                sleep(3);
                
                // Check again
                $remainingExpiredOrders = Order::where('status', 'expire')->get();
                $this->info("After deletion, found {$remainingExpiredOrders->count()} orders with 'expire' status");
                
                if ($remainingExpiredOrders->count() === 0) {
                    $this->info("✅ All expired orders have been successfully deleted!");
                } else {
                    $this->warn("⚠️  Some expired orders still remain. Check logs for details.");
                }
            } else {
                $this->info("✅ No expired orders found. System is working correctly!");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Error testing expired order deletion: {$e->getMessage()}");
            Log::error("Error testing expired order deletion", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return 1;
        }
    }
}