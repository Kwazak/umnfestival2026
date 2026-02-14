<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentStatusController extends Controller
{
    /**
     * Handle all Midtrans redirect URLs (finish, unfinish, error)
     * This prevents external redirects and keeps users on our site
     */
    public function handlePaymentStatus(Request $request)
    {
        // Log the redirect attempt for debugging
        Log::info('Midtrans redirect intercepted', [
            'url' => $request->fullUrl(),
            'params' => $request->all(),
            'user_agent' => $request->userAgent(),
        ]);

        // Get order_id from URL parameters if available
        $orderId = $request->get('order_id');
        $transactionStatus = $request->get('transaction_status');
        $statusCode = $request->get('status_code');

        // Determine where to redirect based on available information
        if ($orderId) {
            // If we have order ID, check the transaction status
            if (in_array($transactionStatus, ['capture', 'settlement'])) {
                // Payment successful - redirect to success page
                Log::info("Redirecting to success page for order: {$orderId}");
                return redirect('/payment/success')->with('order_id', $orderId);
            } elseif (in_array($transactionStatus, ['pending', 'authorize'])) {
                // Payment pending - redirect to pending page
                Log::info("Redirecting to pending page for order: {$orderId}");
                return redirect('/payment/pending')->with('order_id', $orderId);
            } else {
                // Payment failed/cancelled/expired - redirect to pending page for status check
                Log::info("Redirecting to pending page for failed/cancelled order: {$orderId}");
                return redirect('/payment/pending')->with('order_id', $orderId);
            }
        }

        // If no order ID available, redirect to pending page
        // The pending page will handle checking localStorage for order info
        Log::info("No order ID found, redirecting to pending page for localStorage check");
        return redirect('/payment/pending');
    }
}