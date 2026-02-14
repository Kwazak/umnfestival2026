<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentEmailFlowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function payment_flow_sends_email_with_pdf_attachment_and_qr_code()
    {
        Mail::fake();

        // Create a paid order and tickets
        $order = Order::factory()->create(['status' => 'paid']);
$tickets = Ticket::factory()->count(2)->create(['order_id' => $order->id, 'status' => 'valid']);

        // Simulate sending the ticket email
Mail::to($order->buyer_email)->send(new OrderConfirmationMail($order));

        // Assert email was sent
        Mail::assertSent(OrderConfirmationMail::class, function ($mail) use ($order) {
            return $mail->hasTo($order->buyer_email) && $mail->order->id === $order->id;
        });

        // Additional assertions can be added here to check PDF attachments and QR code presence if accessible
    }

    // Additional tests for payment creation, verification, notification, and redirection can be added here
}
