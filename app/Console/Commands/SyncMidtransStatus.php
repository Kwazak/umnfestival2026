<?php

namespace App\Console\Commands;

use App\Jobs\SyncOrderStatusWithMidtrans;
use App\Models\Order;
use Illuminate\Console\Command;

class SyncMidtransStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'midtrans:sync 
                            {--order= : Sync specific order by order number}
                            {--all : Sync all pending orders}
                            {--force : Force sync even for orders in final state}
                            {--recent : Sync only recent orders (last 24 hours)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync order status with Midtrans transaction status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Midtrans status sync...');

        if ($orderNumber = $this->option('order')) {
            $this->syncSpecificOrder($orderNumber);
        } elseif ($this->option('all')) {
            $this->syncAllOrders();
        } elseif ($this->option('recent')) {
            $this->syncRecentOrders();
        } else {
            $this->syncPendingOrders();
        }

        $this->info('Midtrans status sync completed!');
    }

    /**
     * Sync a specific order
     */
    private function syncSpecificOrder($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            $this->error("Order {$orderNumber} not found!");
            return;
        }

        $this->info("Syncing order: {$orderNumber}");
        
        $forceSync = $this->option('force');
        SyncOrderStatusWithMidtrans::dispatch($order, $forceSync);

        $this->info("Sync job dispatched for order: {$orderNumber}");
    }

    /**
     * Sync all orders
     */
    private function syncAllOrders()
    {
        $this->info('Syncing all orders...');
        
        $orders = Order::all();
        $count = 0;

        foreach ($orders as $order) {
            SyncOrderStatusWithMidtrans::dispatch($order, $this->option('force'));
            $count++;
        }

        $this->info("Dispatched sync jobs for {$count} orders");
    }

    /**
     * Sync only pending orders
     */
    private function syncPendingOrders()
    {
        $this->info('Syncing pending orders...');
        
        SyncOrderStatusWithMidtrans::dispatch();
        
        $pendingCount = Order::whereIn('status', [
            'pending', 
            'authorize', 
            'capture'
        ])
        ->where('created_at', '>=', now()->subDays(7))
        ->count();

        $this->info("Dispatched bulk sync job for {$pendingCount} pending orders");
    }

    /**
     * Sync recent orders (last 24 hours)
     */
    private function syncRecentOrders()
    {
        $this->info('Syncing recent orders (last 24 hours)...');
        
        $orders = Order::where('created_at', '>=', now()->subDay())->get();
        $count = 0;

        foreach ($orders as $order) {
            SyncOrderStatusWithMidtrans::dispatch($order, $this->option('force'));
            $count++;
        }

        $this->info("Dispatched sync jobs for {$count} recent orders");
    }
}