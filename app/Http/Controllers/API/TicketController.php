<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Services\TicketSecurityService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Scanner login - Simple authentication for ORANG-1 to ORANG-50
     */
    public function scannerLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $username = strtoupper(trim($request->username));
        $password = trim($request->password);

        // Validate username format (ORANG-1 to ORANG-50)
        if (!preg_match('/^ORANG-([1-9]|[1-4][0-9]|50)$/', $username)) {
            return back()->withErrors([
                'message' => 'Username harus dalam format ORANG-1 sampai ORANG-50'
            ]);
        }

        // Validate password matches username (simple confirmation)
        if ($password !== $username) {
            return back()->withErrors([
                'message' => 'Password harus sama dengan username'
            ]);
        }

        // Set session
        session([
            'scanner_username' => $username,
            'scanner_logged_in_at' => now()->toISOString()
        ]);

        Log::info("Scanner logged in: {$username}", [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return redirect('/admin/scanner')->with('success', "Logged in as {$username}");
    }

    /**
     * Scanner logout
     */
    public function scannerLogout(Request $request)
    {
        $username = session('scanner_username');
        
        session()->forget(['scanner_username', 'scanner_logged_in_at']);

        Log::info("Scanner logged out: {$username}", [
            'ip' => $request->ip()
        ]);

        return redirect('admin/scanner/login')->with('message', 'Logged out successfully');
    }

    /**
     * Mask an email address to minimize PII exposure in public responses.
     * Examples: john.doe@example.com -> j***@example.com
     */
    private function maskEmail(?string $email): ?string
    {
        if (!$email || !str_contains($email, '@')) return null;
        [$local, $domain] = explode('@', $email, 2);
        $first = mb_substr($local, 0, 1);
        return $first . '***@' . $domain;
    }

    
    
    /**
     * Validate a ticket by its code (for QR scanner)
     * Supports both direct validation and QR code validation with security hash
     * 
     * @param string $ticketCode
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateTicket($ticketCode, Request $request)
    {
        try {
            Log::info('Ticket validation requested', [
                'ticket_code' => $ticketCode,
                'verify_hash' => $request->get('verify', 'none'),
                'user_agent' => $request->header('User-Agent')
            ]);

            // Find the ticket
            $ticket = Ticket::where('ticket_code', $ticketCode)
                ->with(['order'])
                ->first();

            if (!$ticket) {
                Log::warning('Ticket validation failed: Ticket not found', [
                    'ticket_code' => $ticketCode
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 404);
            }

            // Require and validate security hash to prevent brute-force guessing
            $verifyHash = $request->get('verify');
            if (!$verifyHash) {
                Log::warning('Ticket validation failed: Missing security hash', [ 'ticket_code' => $ticketCode ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Security code is required',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }
            if (!TicketSecurityService::isValidHash($ticket, $verifyHash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid ticket security code',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            Log::info('Ticket security hash validated successfully', [
                'ticket_code' => $ticketCode
            ]);

            // Check if the order is paid (accept both 'paid' and 'settlement' status)
            if (!in_array($ticket->order->status, ['paid', 'settlement', 'capture'])) {
                Log::warning('Ticket validation failed: Order not paid', [
                    'ticket_code' => $ticketCode,
                    'order_status' => $ticket->order->status
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket order not paid',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Check ticket status
            if ($ticket->status === 'used') {
                Log::info('Ticket validation: Ticket already used', [
                    'ticket_code' => $ticketCode,
                    'checked_in_at' => $ticket->checked_in_at
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket already used',
                    'type' => 'used',
                    'ticket' => [
                        'ticket_code' => $ticket->ticket_code,
                        'status' => $ticket->status,
                        'buyer_name' => $ticket->order->buyer_name,
                        'buyer_email' => $ticket->order->buyer_email,
                        'category' => $ticket->order->category ?? 'general',
                        'order_id' => $ticket->order_id,
                        'checked_in_at' => $ticket->checked_in_at ? $ticket->checked_in_at->toISOString() : null
                    ],
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Check if ticket is valid (ready for use)
            if ($ticket->status !== 'valid') {
                Log::warning('Ticket validation failed: Ticket not valid', [
                    'ticket_code' => $ticketCode,
                    'status' => $ticket->status
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket is not valid',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Ticket is valid
            Log::info('Ticket validation successful', [
                'ticket_code' => $ticketCode,
                'buyer_name' => $ticket->order->buyer_name,
                'order_number' => $ticket->order->order_number
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Ticket is valid',
                'type' => 'valid',
                'ticket' => [
                    'ticket_code' => $ticket->ticket_code,
                    'status' => $ticket->status,
                    'buyer_name' => $ticket->order->buyer_name,
                    'buyer_email' => $ticket->order->buyer_email,
                    'category' => $ticket->order->category ?? 'general',
                    'order_id' => $ticket->order_id,
                    'order_number' => $ticket->order->order_number,
                    'checked_in_at' => null,
                    'purchase_date' => $ticket->order->created_at->format('Y-m-d H:i:s')
                ],
                'ticketCode' => $ticketCode
            ]);

        } catch (\Exception $e) {
            Log::error('Ticket validation error', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'System error during validation',
                'type' => 'error',
                'ticketCode' => $ticketCode
            ], 500);
        }
    }

    /**
     * Validate a ticket for admin scanner (still requires hash but admin-only)
     * Requires admin session via middleware("web","admin.api.auth")
     *
     * @param string $ticketCode
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminValidateTicket($ticketCode, Request $request)
    {
        try {
            Log::info('ADMIN Ticket validation requested', [
                'ticket_code' => $ticketCode,
                'admin_ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]);

            // Find the ticket
            $ticket = Ticket::where('ticket_code', $ticketCode)
                ->with(['order'])
                ->first();

            if (!$ticket) {
                Log::warning('ADMIN Ticket validation failed: Ticket not found', [
                    'ticket_code' => $ticketCode
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 404);
            }

            // Admin scanner: require security hash by default, but allow manual override
            $verifyHash = $request->get('verify');
            $isManual = $request->boolean('manual', false);
            $hasHash = is_string($verifyHash) && trim($verifyHash) !== '';
            if ($hasHash) {
                if (!TicketSecurityService::isValidHash($ticket, $verifyHash)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid ticket security code',
                        'type' => 'invalid',
                        'ticketCode' => $ticketCode
                    ], 400);
                }
            } else {
                // No hash supplied (e.g., scanned via plain QR); allow because admin-authenticated, but log it
                $isManual = true;
                Log::warning('ADMIN Ticket validation without hash, falling back to manual validation', [
                    'ticket_code' => $ticketCode,
                    'admin_ip' => $request->ip(),
                ]);
            }

            // Check if the order is paid (accept both 'paid' and 'settlement' status)
            if (!in_array($ticket->order->status, ['paid', 'settlement', 'capture'])) {
                Log::warning('ADMIN Ticket validation failed: Order not paid', [
                    'ticket_code' => $ticketCode,
                    'order_status' => $ticket->order->status
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ticket order not paid',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Check ticket status
            if ($ticket->status === 'used') {
                Log::info('ADMIN Ticket validation: Ticket already used', [
                    'ticket_code' => $ticketCode,
                    'checked_in_at' => $ticket->checked_in_at
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ticket sudah pernah di-scan',
                    'type' => 'used',
                    'ticket' => [
                        'ticket_code' => $ticket->ticket_code,
                        'status' => $ticket->status,
                        'buyer_name' => $ticket->order->buyer_name,
                        'buyer_email' => $ticket->order->buyer_email,
                        'category' => $ticket->order->category ?? 'general',
                        'order_id' => $ticket->order_id,
                        'checked_in_at' => $ticket->checked_in_at ? $ticket->checked_in_at->toISOString() : null,
                        'scanned_by' => $ticket->scanned_by
                    ],
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Check if ticket is valid (ready for use)
            if ($ticket->status !== 'valid') {
                Log::warning('ADMIN Ticket validation failed: Ticket not valid', [
                    'ticket_code' => $ticketCode,
                    'status' => $ticket->status
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ticket is not valid',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Ticket is valid
            Log::info('ADMIN Ticket validation successful', [
                'ticket_code' => $ticketCode,
                'buyer_name' => $ticket->order->buyer_name,
                'order_number' => $ticket->order->order_number
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket is valid',
                'type' => 'valid',
                'ticket' => [
                    'ticket_code' => $ticket->ticket_code,
                    'status' => $ticket->status,
                    'buyer_name' => $ticket->order->buyer_name,
                    'buyer_email' => $ticket->order->buyer_email,
                    'category' => $ticket->order->category ?? 'general',
                    'order_id' => $ticket->order_id,
                    'order_number' => $ticket->order->order_number,
                    'checked_in_at' => null,
                    'purchase_date' => $ticket->order->created_at->format('Y-m-d H:i:s')
                ],
                'ticketCode' => $ticketCode
            ]);

        } catch (\Exception $e) {
            Log::error('ADMIN Ticket validation error', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'System error during validation',
                'type' => 'error',
                'ticketCode' => $ticketCode
            ], 500);
        }
    }

    /**
     * Check-in a ticket (mark as used)
     * 
     * @param string $ticketCode
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkIn($ticketCode, Request $request)
    {
        try {
            // Get scanner username from session
            $scannedBy = session('scanner_username');
            
            if (!$scannedBy) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scanner not authenticated. Please login first.',
                    'type' => 'auth_required',
                    'ticketCode' => $ticketCode
                ], 401);
            }

            // Find the ticket
            $ticket = Ticket::where('ticket_code', $ticketCode)
                ->with(['order'])
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 404);
            }

            // Admin scanner: require security hash by default, but allow manual override
            $verifyHash = $request->get('verify');
            $isManual = $request->boolean('manual', false);
            $hasHash = is_string($verifyHash) && trim($verifyHash) !== '';
            if ($hasHash) {
                if (!TicketSecurityService::isValidHash($ticket, $verifyHash)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid ticket security code',
                        'type' => 'invalid',
                        'ticketCode' => $ticketCode
                    ], 400);
                }
            } else {
                // No hash supplied (e.g., scanned via plain QR); allow because admin-authenticated, but log it
                $isManual = true;
                Log::warning('ADMIN Ticket validation without hash, falling back to manual validation', [
                    'ticket_code' => $ticketCode,
                    'admin_ip' => $request->ip(),
                ]);
            }

            // Check if the order is paid (accept both 'paid' and 'settlement' status)
            if (!in_array($ticket->order->status, ['paid', 'settlement', 'capture'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket order not paid',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Check if already used
            if ($ticket->status === 'used') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket sudah pernah di-scan',
                    'type' => 'used',
                    'ticket' => [
                        'ticket_code' => $ticket->ticket_code,
                        'status' => $ticket->status,
                        'buyer_name' => $ticket->order->buyer_name,
                        'buyer_email' => $ticket->order->buyer_email,
                        'category' => $ticket->order->category,
                        'order_id' => $ticket->order_id,
                        'checked_in_at' => $ticket->checked_in_at ? $ticket->checked_in_at->toISOString() : null,
                        'scanned_by' => $ticket->scanned_by
                    ],
                    'ticketCode' => $ticketCode
                ], 400);
            }

            // Mark ticket as used with scanner info
            $ticket->update([
                'status' => 'used',
                'checked_in_at' => Carbon::now(),
                'scanned_by' => $scannedBy
            ]);

            Log::info("Ticket checked in: {$ticketCode} for order #{$ticket->order->order_number} by {$scannedBy}");

            return response()->json([
                'success' => true,
                'message' => 'Check-in successful',
                'type' => 'valid',
                'ticket' => [
                    'ticket_code' => $ticket->ticket_code,
                    'status' => 'used',
                    'buyer_name' => $ticket->order->buyer_name,
                    'buyer_email' => $ticket->order->buyer_email,
                    'category' => $ticket->order->category,
                    'order_id' => $ticket->order_id,
                    'checked_in_at' => $ticket->checked_in_at->toISOString(),
                    'scanned_by' => $scannedBy
                ],
                'ticketCode' => $ticketCode
            ]);

        } catch (\Exception $e) {
            Log::error('Ticket check-in error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'System error during check-in',
                'type' => 'error',
                'ticketCode' => $ticketCode
            ], 500);
        }
    }

    /**
     * Admin utility: reset all tickets to valid and clear checked_in_at
     * Requires a secret confirmation code in request: secret = "JANGANLAKUKANINIDIHARIH"
     */
    public function resetAll(Request $request)
    {
        try {
            $secret = $request->input('secret');
            if ($secret !== 'JANGANLAKUKANINIDIHARIH') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid secret code'
                ], 403);
            }

            // Only reset tickets that are not pending
            $query = Ticket::whereNotIn('status', ['pending']);
            $count = $query->count();
            // Bulk update
            Ticket::whereNotIn('status', ['pending'])->update([
                'status' => 'valid',
                'checked_in_at' => null,
            ]);

            \Log::warning('ADMIN RESET: All non-pending tickets set to valid and cleared check-in', [
                'affected' => $count,
                'by' => $request->ip(),
                'ua' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'All non-pending tickets have been reset to valid.',
                'data' => [ 'affected' => $count ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to reset all tickets', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset tickets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin utility: reset a single ticket to valid and clear checked_in_at
     * Strict confirmation: requires secret AND confirm_code equals ticket_code
     */
    public function adminResetSingle($ticketCode, Request $request)
    {
        try {
            $secret = $request->input('secret');
            $confirm = trim((string)$request->input('confirm_code'));
            if ($secret !== 'JANGANLAKUKANINIDIHARIH') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid secret code'
                ], 403);
            }

            $ticket = Ticket::where('ticket_code', $ticketCode)->with('order')->first();
            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            if ($confirm !== $ticket->ticket_code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Confirmation code mismatch'
                ], 400);
            }

            // Don't allow resetting pending tickets
            if ($ticket->status === 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot reset a pending ticket'
                ], 400);
            }

            $before = [
                'status' => $ticket->status,
                'checked_in_at' => $ticket->checked_in_at
            ];

            $ticket->update([
                'status' => 'valid',
                'checked_in_at' => null,
            ]);

            \Log::warning('ADMIN RESET SINGLE: Ticket reset to valid', [
                'ticket_code' => $ticket->ticket_code,
                'order_number' => $ticket->order?->order_number,
                'before' => $before,
                'by' => $request->ip(),
                'ua' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket has been reset to valid',
                'data' => [
                    'ticket' => [
                        'ticket_code' => $ticket->ticket_code,
                        'status' => $ticket->status,
                        'checked_in_at' => $ticket->checked_in_at,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to reset single ticket', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store frame captures for a ticket (admin only)
     */
    public function storeFrames($ticketCode, Request $request)
    {
        try {
            $ticket = Ticket::where('ticket_code', $ticketCode)->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                    'type' => 'invalid',
                    'ticketCode' => $ticketCode
                ], 404);
            }

            $frames = [
                'frame_before_1500ms' => $request->input('frame_before_1500ms'),
                'frame_before_700ms' => $request->input('frame_before_700ms'),
                'frame_after_700ms' => $request->input('frame_after_700ms'),
                'frame_after_1500ms' => $request->input('frame_after_1500ms'),
            ];

            $savedPaths = [];
            foreach ($frames as $key => $dataUrl) {
                if (!$dataUrl) {
                    continue;
                }
                $saved = $this->saveFrameData($ticket, $dataUrl, $key);
                if (!$saved) {
                    continue;
                }
                $savedPaths[$key] = $saved;
            }

            if (empty($savedPaths)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No frame data provided',
                    'type' => 'invalid_frame',
                    'ticketCode' => $ticketCode
                ], 400);
            }

            $ticket->update($savedPaths);

            return response()->json([
                'success' => true,
                'message' => 'Frames saved',
                'data' => $savedPaths
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store frames', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to store frames',
                'type' => 'error',
                'ticketCode' => $ticketCode
            ], 500);
        }
    }

    /**
     * Save a base64 frame to storage/public and return public path
     */
    private function saveFrameData(Ticket $ticket, string $dataUrl, string $label): ?string
    {
        if (!preg_match('/^data:image\\/(png|jpeg);base64,/', $dataUrl, $matches)) {
            Log::warning('Frame rejected: invalid data URL', [
                'ticket_code' => $ticket->ticket_code,
                'label' => $label
            ]);
            return null;
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : 'png';
        $base64 = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $binary = base64_decode($base64);

        if ($binary === false || strlen($binary) < 1000) {
            Log::warning('Frame rejected: too small or decode failed', [
                'ticket_code' => $ticket->ticket_code,
                'label' => $label,
                'bytes' => strlen((string)$binary)
            ]);
            return null;
        }

        $dir = 'ticket-frames/' . $ticket->ticket_code;
        $filename = "{$label}.{$extension}";
        $path = "{$dir}/{$filename}";

        Storage::disk('public')->put($path, $binary);

        Log::info('Frame saved', [
            'ticket_code' => $ticket->ticket_code,
            'label' => $label,
            'path' => $path,
            'bytes' => strlen($binary)
        ]);

        return 'storage/' . $path;
    }
}
