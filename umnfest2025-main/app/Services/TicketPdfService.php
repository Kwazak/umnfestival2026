<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class TicketPdfService
{
    protected $qrCodeService;
    
    public function __construct()
    {
        $this->qrCodeService = new QrCodeService();
    }
    
    /**
     * Generate PDF for a single ticket with working QR code
     */
    public function generateTicketPdf(Ticket $ticket, Order $order)
    {
        Log::info('TicketPdfService: Generating PDF for ticket', [
            'ticket_code' => $ticket->ticket_code,
            'order_number' => $order->order_number
        ]);
        
        // Generate secure validation URL for QR code
        $validationUrl = $this->createValidationUrl($ticket, $order);
        
        // Generate QR code using the updated service (returns PNG base64)
        $qrCodeData = $this->qrCodeService->generateSvg($validationUrl, 250);
        
        // Validate QR code was generated properly
        $this->validateQrCodeData($qrCodeData, $ticket->ticket_code, $validationUrl);
        
        // Prepare PDF data
        $data = [
            'ticket' => $ticket,
            'order' => $order,
            'qrCode' => $qrCodeData,
            'validationUrl' => $validationUrl,
            'eventName' => 'UMN Festival 2025',
            'eventDate' => 'March 15-16, 2025',
            'eventLocation' => 'Universitas Multimedia Nusantara',
            'buyerName' => $order->buyer_name,
            'buyerEmail' => $order->buyer_email,
            'ticketCode' => $ticket->ticket_code,
            'orderNumber' => $order->order_number,
            'category' => ucfirst($order->category ?? 'general'),
            'purchaseDate' => $order->created_at->format('d M Y H:i')
        ];
        
        Log::info('TicketPdfService: Creating PDF with data', [
            'ticket_code' => $ticket->ticket_code,
            'qr_code_type' => $this->getQrCodeType($qrCodeData),
            'qr_code_size' => strlen($qrCodeData)
        ]);
        
        // Generate PDF
        $pdf = Pdf::loadView('pdf.ticket', $data);
        $pdf->setPaper('A5', 'portrait');
        
        Log::info('TicketPdfService: PDF generated successfully for ticket', [
            'ticket_code' => $ticket->ticket_code
        ]);
        
        return $pdf;
    }
    
    /**
     * Create secure validation URL for ticket
     */
    private function createValidationUrl(Ticket $ticket, Order $order)
    {
        // Create a secure hash for validation
        $securityHash = hash('sha256', 
            $ticket->ticket_code . 
            $order->order_number . 
            $ticket->id . 
            config('app.key')
        );
        
        // Build validation URL that can be verified
        $validationUrl = url('/api/tickets/validate/' . $ticket->ticket_code . '?verify=' . $securityHash);
        
        Log::info('TicketPdfService: Created validation URL', [
            'ticket_code' => $ticket->ticket_code,
            'url_length' => strlen($validationUrl)
        ]);
        
        return $validationUrl;
    }
    
    /**
     * Validate QR code data was generated properly
     */
    private function validateQrCodeData($qrCodeData, $ticketCode, $validationUrl)
    {
        if (str_contains($qrCodeData, 'data:image/png;base64,')) {
            // Extract and validate base64 PNG data
            $base64Data = substr($qrCodeData, strpos($qrCodeData, ',') + 1);
            $imageData = base64_decode($base64Data);
            
            if (substr($imageData, 0, 8) === "\x89PNG\r\n\x1a\n") {
                Log::info('TicketPdfService: Valid PNG QR code generated', [
                    'ticket_code' => $ticketCode,
                    'size_bytes' => strlen($imageData)
                ]);
                return true;
            } else {
                Log::warning('TicketPdfService: Invalid PNG signature in QR code', [
                    'ticket_code' => $ticketCode
                ]);
            }
        } elseif (str_contains($qrCodeData, 'data:image/svg+xml;base64,')) {
            Log::info('TicketPdfService: SVG QR code/placeholder generated', [
                'ticket_code' => $ticketCode
            ]);
            return true;
        } else {
            Log::warning('TicketPdfService: Unknown QR code format generated', [
                'ticket_code' => $ticketCode,
                'format_preview' => substr($qrCodeData, 0, 50)
            ]);
        }
        
        return false;
    }
    
    /**
     * Get QR code type for logging
     */
    private function getQrCodeType($qrCodeData)
    {
        if (str_contains($qrCodeData, 'data:image/png;base64,')) {
            return 'PNG';
        } elseif (str_contains($qrCodeData, 'data:image/svg+xml;base64,')) {
            return 'SVG';
        } else {
            return 'UNKNOWN';
        }
    }
    
    /**
     * Generate and save ticket PDF to file system
     */
    public function saveTicketPdf(Ticket $ticket, Order $order)
    {
        Log::info('TicketPdfService: Saving ticket PDF to file', [
            'ticket_code' => $ticket->ticket_code,
            'order_number' => $order->order_number
        ]);
        
        $pdf = $this->generateTicketPdf($ticket, $order);
        
        $directory = storage_path('app/tickets/' . $order->order_number);
        
        // Create directory if it doesn't exist
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
            Log::info('TicketPdfService: Created directory', ['path' => $directory]);
        }
        
        $filePath = $directory . '/' . $ticket->ticket_code . '.pdf';
        $pdf->save($filePath);
        
        Log::info('TicketPdfService: PDF saved successfully', [
            'ticket_code' => $ticket->ticket_code,
            'file_path' => $filePath,
            'file_size' => file_exists($filePath) ? filesize($filePath) : 0
        ]);
        
        return $filePath;
    }
    
    /**
     * Generate PDFs for all tickets in an order
     */
    public function generateOrderTickets(Order $order)
    {
        Log::info('TicketPdfService: Generating PDFs for entire order', [
            'order_number' => $order->order_number,
            'ticket_count' => $order->tickets->count()
        ]);
        
        $generatedPaths = [];
        
        foreach ($order->tickets as $ticket) {
            try {
                $path = $this->saveTicketPdf($ticket, $order);
                $generatedPaths[] = $path;
                
                Log::info('TicketPdfService: Generated PDF for ticket', [
                    'ticket_code' => $ticket->ticket_code,
                    'path' => $path
                ]);
            } catch (\Exception $e) {
                Log::error('TicketPdfService: Failed to generate PDF for ticket', [
                    'ticket_code' => $ticket->ticket_code,
                    'error' => $e->getMessage()
                ]);
                
                // Continue with other tickets even if one fails
                continue;
            }
        }
        
        Log::info('TicketPdfService: Order PDF generation complete', [
            'order_number' => $order->order_number,
            'successful_count' => count($generatedPaths),
            'total_count' => $order->tickets->count()
        ]);
        
        return $generatedPaths;
    }
}
