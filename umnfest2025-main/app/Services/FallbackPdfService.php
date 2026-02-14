<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use App\Services\TicketSecurityService;

class FallbackPdfService
{
    protected $qrCodeService;
    
    public function __construct()
    {
        $this->qrCodeService = new QrCodeService();
    }
    
    /**
     * Generate PDF for a single ticket with working QR code - NO GD REQUIRED
     */
    public function generateTicketPdf(Ticket $ticket, Order $order)
    {
        Log::info('FallbackPdfService: Generating PDF for ticket (GD-free)', [
            'ticket_code' => $ticket->ticket_code,
            'order_number' => $order->order_number
        ]);
        
        // Generate secure validation URL for QR code
        $validationUrl = $this->createValidationUrl($ticket, $order);
        
        // Generate QR code using API service (doesn't require GD)
        $qrCodeData = $this->generateQrCodeForPdf($validationUrl);
        
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
        
        Log::info('FallbackPdfService: Creating PDF with QR code', [
            'ticket_code' => $ticket->ticket_code,
            'qr_code_size' => strlen($qrCodeData),
            'uses_gd' => false
        ]);
        
        // Generate PDF
        $pdf = Pdf::loadView('pdf.ticket', $data);
        $pdf->setPaper('A5', 'portrait');
        
        Log::info('FallbackPdfService: PDF generated successfully', [
            'ticket_code' => $ticket->ticket_code
        ]);
        
        return $pdf;
    }
    
    /**
     * Generate QR code that works without GD extension
     */
    private function generateQrCodeForPdf($validationUrl)
    {
        try {
            // First try the regular QR service
            $qrCodeData = $this->qrCodeService->generateSvg($validationUrl, 250);
            
            if (str_contains($qrCodeData, 'data:image/png;base64,')) {
                Log::info('FallbackPdfService: Using PNG QR code from API service');
                return $qrCodeData;
            }
            
            // If API service fails, create a simple URL-based QR code
            Log::warning('FallbackPdfService: API QR service failed, creating URL-based QR');
            return $this->createUrlBasedQrCode($validationUrl);
            
        } catch (\Exception $e) {
            Log::error('FallbackPdfService: QR generation failed, using URL fallback', [
                'error' => $e->getMessage()
            ]);
            
            return $this->createUrlBasedQrCode($validationUrl);
        }
    }
    
    /**
     * Create URL-based QR code using external service
     */
    private function createUrlBasedQrCode($validationUrl)
    {
        // Use Google Charts API for QR code generation (no GD required)
        $encodedUrl = urlencode($validationUrl);
        $qrApiUrl = "https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl={$encodedUrl}&choe=UTF-8";
        
        try {
            // Get QR code from Google Charts
            $qrImageData = file_get_contents($qrApiUrl);
            
            if ($qrImageData !== false) {
                $base64QrCode = base64_encode($qrImageData);
                Log::info('FallbackPdfService: Generated QR using Google Charts API');
                return 'data:image/png;base64,' . $base64QrCode;
            }
        } catch (\Exception $e) {
            Log::error('FallbackPdfService: Google Charts QR failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        // Final fallback - create QR code using QR-Server API
        $qrServerUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" . urlencode($validationUrl);
        
        try {
            $qrImageData = file_get_contents($qrServerUrl);
            
            if ($qrImageData !== false) {
                $base64QrCode = base64_encode($qrImageData);
                Log::info('FallbackPdfService: Generated QR using QR-Server API');
                return 'data:image/png;base64,' . $base64QrCode;
            }
        } catch (\Exception $e) {
            Log::error('FallbackPdfService: All QR services failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        // Ultimate fallback - return a text representation
        Log::warning('FallbackPdfService: Using text fallback for QR code');
        return $this->createTextQrCode($validationUrl);
    }
    
    /**
     * Create text-based QR code as ultimate fallback
     */
    private function createTextQrCode($validationUrl)
    {
        // Create a simple text-based "QR code" representation
        $textQr = "
        ████████████████████████████████
        ██                            ██
        ██  SCAN WITH QR READER:      ██
        ██                            ██
        ██  {$validationUrl}          ██
        ██                            ██
        ██  OR USE MANUAL ENTRY       ██
        ██                            ██
        ████████████████████████████████
        ";
        
        // Convert to base64 SVG
        $svgQr = '<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
            <rect width="250" height="250" fill="white"/>
            <text x="125" y="100" text-anchor="middle" font-family="monospace" font-size="8" fill="black">SCAN QR CODE</text>
            <text x="125" y="130" text-anchor="middle" font-family="monospace" font-size="6" fill="black">Validation URL:</text>
            <text x="125" y="150" text-anchor="middle" font-family="monospace" font-size="4" fill="black">' . htmlspecialchars($validationUrl) . '</text>
            <rect x="50" y="170" width="150" height="60" fill="none" stroke="black" stroke-width="2"/>
            <text x="125" y="205" text-anchor="middle" font-family="monospace" font-size="8" fill="black">QR CODE PLACEHOLDER</text>
        </svg>';
        
        return 'data:image/svg+xml;base64,' . base64_encode($svgQr);
    }
    
    /**
     * Create secure validation URL for ticket
     */
    private function createValidationUrl(Ticket $ticket, Order $order)
    {
        // Build validation URL that can be verified
        $validationUrl = TicketSecurityService::buildValidationUrl($ticket);
        
        Log::info('FallbackPdfService: Created validation URL', [
            'ticket_code' => $ticket->ticket_code,
            'url_length' => strlen($validationUrl)
        ]);
        
        return $validationUrl;
    }
    
    /**
     * Generate and save ticket PDF to file system
     */
    public function saveTicketPdf(Ticket $ticket, Order $order)
    {
        Log::info('FallbackPdfService: Saving ticket PDF to file', [
            'ticket_code' => $ticket->ticket_code,
            'order_number' => $order->order_number
        ]);
        
        $pdf = $this->generateTicketPdf($ticket, $order);
        
        $directory = storage_path('app/tickets/' . $order->order_number);
        
        // Create directory if it doesn't exist
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
            Log::info('FallbackPdfService: Created directory', ['path' => $directory]);
        }
        
        $filePath = $directory . '/' . $ticket->ticket_code . '.pdf';
        $pdf->save($filePath);
        
        Log::info('FallbackPdfService: PDF saved successfully', [
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
        Log::info('FallbackPdfService: Generating PDFs for entire order', [
            'order_number' => $order->order_number,
            'ticket_count' => $order->tickets->count()
        ]);
        
        $generatedPaths = [];
        
        foreach ($order->tickets as $ticket) {
            try {
                $path = $this->saveTicketPdf($ticket, $order);
                $generatedPaths[] = $path;
                
                Log::info('FallbackPdfService: Generated PDF for ticket', [
                    'ticket_code' => $ticket->ticket_code,
                    'path' => $path
                ]);
            } catch (\Exception $e) {
                Log::error('FallbackPdfService: Failed to generate PDF for ticket', [
                    'ticket_code' => $ticket->ticket_code,
                    'error' => $e->getMessage()
                ]);
                
                // Continue with other tickets even if one fails
                continue;
            }
        }
        
        Log::info('FallbackPdfService: Order PDF generation complete', [
            'order_number' => $order->order_number,
            'successful_count' => count($generatedPaths),
            'total_count' => $order->tickets->count()
        ]);
        
        return $generatedPaths;
    }
}
