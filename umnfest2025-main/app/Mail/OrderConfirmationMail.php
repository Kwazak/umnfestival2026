<?php

namespace App\Mail;

use App\Models\Order;
use App\Services\FallbackPdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $tickets;
    public $amount;
    public $userName;
    public $referralCode;
    public $userEmail;

    public function __construct(Order $order)
    {
        $this->order = $order;
        $this->tickets = $order->tickets;
        $this->amount = $order->amount;
        $this->userName = $order->buyer_name ?? 'Valued Customer';
        $this->userEmail = $order->buyer_email;
        $this->referralCode = $order->referralCode?->code;
        
        Log::info("OrderConfirmationMail created for order: {$this->order->order_number}, user: {$this->userName}, tickets: {$this->tickets->count()}");
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'UMN Festival 2025 - Order Confirmation #' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'order' => $this->order,
                'tickets' => $this->tickets,
                'amount' => $this->amount,
                'userName' => $this->userName,
                'userEmail' => $this->userEmail,   
                'referralCode' => $this->referralCode,
            ]
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        $ticketPdfService = new FallbackPdfService();

        try {
            Log::info("Generating PDF attachments for {$this->tickets->count()} tickets");
            
            foreach ($this->tickets as $ticket) {
                Log::info("Generating PDF for ticket: {$ticket->ticket_code}");
                
                $pdf = $ticketPdfService->generateTicketPdf($ticket, $this->order);
                
                // Save PDF to temporary location for attachment
                $filename = "ticket_{$ticket->ticket_code}_" . time() . ".pdf";
                $directory = storage_path('app/temp_tickets');
                
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                $pdfPath = $directory . '/' . $filename;
                $pdf->save($pdfPath);
                
                if (file_exists($pdfPath)) {
                    $attachments[] = Attachment::fromPath($pdfPath)
                        ->as("UMN_Festival_2025_Ticket_{$ticket->ticket_code}.pdf")
                        ->withMime('application/pdf');
                    
                    Log::info("PDF attached for ticket: {$ticket->ticket_code}");
                } else {
                    Log::error("PDF file not found for ticket: {$ticket->ticket_code} at path: {$pdfPath}");
                }
            }
            
            Log::info("Total attachments created: " . count($attachments));
            
        } catch (\Exception $e) {
            Log::error("Failed to generate PDF attachments: " . $e->getMessage());
        }

        return $attachments;
    }
}
