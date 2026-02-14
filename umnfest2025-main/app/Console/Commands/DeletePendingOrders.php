<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Carbon\Carbon;

class DeletePendingOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:delete-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete pending orders that are older than 6 hours (buffer after payment expiry)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $cutoffTime = Carbon::now()->subHours(6);
        
        // Find all pending orders older than 6 hours
        $oldPendingOrders = Order::where('status', 'pending')
            ->where('created_at', '<', $cutoffTime)
            ->get();
        
        $deletedCount = 0;
        
        foreach ($oldPendingOrders as $order) {
            // Delete associated tickets first
            $order->tickets()->delete();
            
            // Then delete the order
            $order->delete();
            
            $deletedCount++;
            
            $this->info("Deleted order: {$order->order_number} (Created: {$order->created_at})");
        }
        
        $this->info("Total orders deleted: {$deletedCount}");
        
        return 0;
    }
}