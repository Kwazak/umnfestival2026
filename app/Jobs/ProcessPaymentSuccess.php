<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Services\TicketPdfService;
use App\Mail\OrderConfirmationMail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaymentSuccess implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Order $order)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing payment success for order: ' . $this->order->order_number);

        try {
            // Load relationships
            $this->order->load(['tickets', 'referralCode', 'discountCode']);
            
            // 1. Update order status to paid
            $this->updateOrderStatus();
            
            // 2. Update all tickets status to valid
            $this->updateTicketStatuses();
            
            // 3. Update discount code usage count (NEW)
            $this->updateDiscountCodeUsage();
            
            // 4. Generate PDF tickets
            $ticketPaths = $this->generateTicketPDFs();
            
            // 5. Send confirmation email with attached tickets
            $this->sendConfirmationEmail($ticketPaths);
            
            // 6. Update analytics/reporting
            $this->updateAnalytics();
            
            // 7. Trigger external integrations (if any)
            $this->triggerExternalIntegrations();
            
            Log::info('Payment success processing completed for order: ' . $this->order->order_number);
            
        } catch (\Exception $e) {
            Log::error('Failed to process payment success for order ' . $this->order->order_number . ': ' . $e->getMessage());
            throw $e; // Re-throw to trigger job retry
        }
    }

    /**
     * Update order status to paid (only if not already in a successful state)
     */
    private function updateOrderStatus()
    {
        // Only update if not already in a successful state
        if (!$this->order->isSuccessful()) {
            Log::info('Updating order status to settlement for order: ' . $this->order->order_number);
            
            $this->order->update([
                'status' => 'settlement', // Use settlement as the final successful state
                'paid_at' => now()
            ]);
            
            Log::info('Order status updated successfully for order: ' . $this->order->order_number);
        } else {
            Log::info('Order already in successful state (' . $this->order->status . ') for order: ' . $this->order->order_number);
        }
    }

    /**
     * Update all tickets status to valid (paid and ready for scanning)
     */
    private function updateTicketStatuses()
    {
        Log::info('Updating ticket statuses to valid for order: ' . $this->order->order_number);
        
        // Update tickets individually to trigger model events
        $updatedCount = 0;
        foreach ($this->order->tickets as $ticket) {
            if ($ticket->status !== 'valid') {
                $ticket->update(['status' => 'valid']);
                $updatedCount++;
            }
        }
        
        Log::info("Updated {$updatedCount} tickets to valid status for order: " . $this->order->order_number);
        
        // Reload tickets to get updated status
        $this->order->load('tickets');
    }

    /**
     * Update discount code usage count (ORDER-based, not ticket-based)
     */
    private function updateDiscountCodeUsage()
    {
        if ($this->order->discount_code_id) {
            Log::info('Updating discount code usage for order: ' . $this->order->order_number);
            
            $discountCode = $this->order->discountCode;
            if ($discountCode) {
                // Use atomic increment with constraint check to prevent race conditions
                $updated = DB::table('discount_codes')
                    ->where('id', $discountCode->id)
                    ->where('used_count', '<', DB::raw('quota')) // Ensure we don't exceed quota
                    ->increment('used_count', 1);
                
                if ($updated) {
                    Log::info("Discount code '{$discountCode->code}' usage updated successfully. New count: " . ($discountCode->used_count + 1));
                } else {
                    Log::warning("Failed to update discount code usage - quota may be exceeded for code: {$discountCode->code}");
                    // Optionally, you could mark the order for manual review here
                }
            }
        }
    }

    /**
     * Generate PDF tickets for the order
     */
    private function generateTicketPDFs()
    {
        Log::info('Generating PDF tickets for order: ' . $this->order->order_number);
        
        $ticketPdfService = app(TicketPdfService::class);
        $generatedPaths = $ticketPdfService->generateOrderTickets($this->order);
        
        Log::info('Generated ' . count($generatedPaths) . ' PDF tickets for order: ' . $this->order->order_number);
        
        return $generatedPaths;
    }

    /**
     * Send confirmation email with tickets attached (PDFs generated internally)
     */
    private function sendConfirmationEmail($ticketPaths = null)
    {
        Log::info('Sending order confirmation email for order: ' . $this->order->order_number);
        
        try {
            // Send order confirmation email with PDF attachments
            Mail::to($this->order->buyer_email)
                ->send(new OrderConfirmationMail($this->order));
            
            Log::info('Ticket email sent to: ' . $this->order->buyer_email . ' for order: ' . $this->order->order_number);
            
        } catch (\Exception $e) {
            Log::error('Failed to send ticket email: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update analytics and reporting data
     */
    private function updateAnalytics()
    {
        Log::info('Updating analytics for order: ' . $this->order->order_number);
        
        // TODO: Update analytics tables or send data to analytics services
        // Examples:
        // - Update daily sales totals
        // - Track referral code effectiveness
        // - Track discount code effectiveness
        // - Update inventory counts
        // - Send data to Google Analytics, Mixpanel, etc.
        
        if ($this->order->referral_code_id) {
            Log::info('Tracking referral code usage: ' . $this->order->referralCode->code);
        }
        
        if ($this->order->discount_code_id) {
            Log::info('Tracking discount code usage: ' . $this->order->discountCode->code . ' (saved: Rp ' . number_format($this->order->discount_amount, 0, ',', '.') . ')');
        }
    }

    /**
     * Trigger external integrations
     */
    private function triggerExternalIntegrations()
    {
        Log::info('Triggering external integrations for order: ' . $this->order->order_number);
        
        // TODO: Integrate with external services
        // Examples:
        // - Webhook to event management systems
        // - Integration with CRM systems
        // - Notification to Discord/Slack channels
        // - Update external databases
        
        // Example webhook call:
        // Http::post('https://external-api.com/webhook', [
        //     'event' => 'payment_success',
        //     'order_number' => $this->order->order_number,
        //     'amount' => $this->order->final_amount,
        //     'ticket_count' => $this->order->tickets->count()
        // ]);
    }

    /**
     * The job failed to process.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessPaymentSuccess job failed for order ' . $this->order->order_number . ': ' . $exception->getMessage());
        
        // TODO: Implement failure handling
        // Examples:
        // - Send notification to administrators
        // - Mark order for manual review
        // - Trigger fallback processes
    }
}
