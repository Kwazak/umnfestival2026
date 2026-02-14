<?php

namespace App\Observers;

use App\Models\Order;
use App\Jobs\DeleteExpiredOrders;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if status was changed to 'expire'
        if ($order->isDirty('status') && $order->status === 'expire') {
            Log::info('Order status changed to expire, scheduling for deletion', [
                'order_number' => $order->order_number,
                'old_status' => $order->getOriginal('status'),
                'new_status' => $order->status
            ]);
            
            // Dispatch job to delete expired orders immediately
            DeleteExpiredOrders::dispatch();
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        Log::info('Order deleted', [
            'order_number' => $order->order_number,
            'status' => $order->status
        ]);
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}