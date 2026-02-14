<?php

namespace App\Http\Controllers;

use App\Services\TicketQrCodeService;
use App\Services\TicketSecurityService;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class QrCodeController extends Controller
{
    protected $qrCodeService;

    public function __construct(TicketQrCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Generate QR code PNG image for a ticket code
     *
     * @param string $ticketCode
     * @param Request $request
     * @return Response
     */
    public function generateTicketQr(string $ticketCode, Request $request)
    {
        try {
            // Validate ticket code format (basic validation)
            if (empty($ticketCode) || strlen($ticketCode) < 3) {
                Log::warning('QrCodeController: Invalid ticket code provided', [
                    'ticket_code' => $ticketCode
                ]);
                return response('Invalid ticket code', 400);
            }

            $ticket = Ticket::where('ticket_code', $ticketCode)
                ->with('order')
                ->first();

            if (!$ticket) {
                Log::warning('QrCodeController: Ticket not found for QR generation', [
                    'ticket_code' => $ticketCode
                ]);
                return response('Ticket not found', 404);
            }

            $verifyHash = $request->get('verify');
            if (!$verifyHash || !TicketSecurityService::isValidHash($ticket, $verifyHash)) {
                Log::warning('QrCodeController: QR generation blocked due to invalid hash', [
                    'ticket_code' => $ticketCode,
                    'provided_hash' => substr((string) $verifyHash, 0, 10)
                ]);
                return response('Unauthorized QR request', 403);
            }

            // Only generate QR for paid/valid tickets
            if (!in_array($ticket->order->status, ['paid', 'settlement', 'capture'])) {
                Log::warning('QrCodeController: Attempt to generate QR for unpaid ticket', [
                    'ticket_code' => $ticketCode,
                    'order_status' => $ticket->order->status
                ]);
                return response('Ticket not paid', 403);
            }

            // Get size parameter (default: 300)
            $size = $request->get('size', 300);
            $size = max(100, min(1000, (int) $size)); // Clamp between 100-1000

            Log::info('QrCodeController: Generating QR code', [
                'ticket_code' => $ticketCode,
                'size' => $size,
                'order_number' => $ticket->order->order_number
            ]);

            // Generate QR code payload that encodes the validation URL + hash
            $validationUrl = TicketSecurityService::buildValidationUrl($ticket);

            // Generate QR code
            $qrImageData = $this->qrCodeService->generateTicketQrCode($validationUrl, $size);

            if (!$qrImageData) {
                Log::error('QrCodeController: Failed to generate QR code', [
                    'ticket_code' => $ticketCode
                ]);
                return response('Failed to generate QR code', 500);
            }

            Log::info('QrCodeController: QR code generated successfully', [
                'ticket_code' => $ticketCode,
                'data_size' => strlen($qrImageData)
            ]);

            return response($qrImageData)
                ->header('Content-Type', 'image/png')
                ->header('Content-Disposition', 'inline; filename="ticket-' . $ticketCode . '.png"')
                ->header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
                ->header('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + 3600));

        } catch (\Exception $e) {
            Log::error('QrCodeController: Exception occurred', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response('Internal server error', 500);
        }
    }

    /**
     * Generate QR code as base64 data URL for embedding
     *
     * @param string $ticketCode
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateTicketQrBase64(string $ticketCode, Request $request)
    {
        try {
            if (empty($ticketCode) || strlen($ticketCode) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid ticket code'
                ], 400);
            }

            $size = $request->get('size', 300);
            $size = max(100, min(1000, (int) $size));

            $qrImageData = $this->qrCodeService->generateTicketQrCode($ticketCode, $size);

            if (!$qrImageData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate QR code'
                ], 500);
            }

            $base64 = base64_encode($qrImageData);
            $dataUrl = "data:image/png;base64,{$base64}";

            return response()->json([
                'success' => true,
                'ticket_code' => $ticketCode,
                'qr_code' => $dataUrl,
                'size' => $size
            ]);

        } catch (\Exception $e) {
            Log::error('QrCodeController: Exception in base64 generation', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Batch generate QR codes for multiple ticket codes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateBatchQrCodes(Request $request)
    {
        try {
            $ticketCodes = $request->input('ticket_codes', []);
            $size = $request->get('size', 300);
            $size = max(100, min(1000, (int) $size));

            if (empty($ticketCodes) || !is_array($ticketCodes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No ticket codes provided'
                ], 400);
            }

            if (count($ticketCodes) > 50) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many ticket codes (max: 50)'
                ], 400);
            }

            $results = [];
            foreach ($ticketCodes as $ticketCode) {
                if (empty($ticketCode)) continue;

                $qrImageData = $this->qrCodeService->generateTicketQrCode($ticketCode, $size);
                
                if ($qrImageData) {
                    $base64 = base64_encode($qrImageData);
                    $results[$ticketCode] = "data:image/png;base64,{$base64}";
                } else {
                    $results[$ticketCode] = null;
                }
            }

            return response()->json([
                'success' => true,
                'qr_codes' => $results,
                'size' => $size,
                'total' => count($results)
            ]);

        } catch (\Exception $e) {
            Log::error('QrCodeController: Exception in batch generation', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
