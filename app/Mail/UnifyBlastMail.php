<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UnifyBlastMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $payload, public string $recipientName = 'UNIFY Friend')
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->payload['subject'] ?? 'UNIFY 2025 Update'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.campaigns.unify-blast',
            with: [
                'payload' => $this->payload,
                'recipientName' => $this->recipientName,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
