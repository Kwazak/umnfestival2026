<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\ReferralCode;
use App\Models\DiscountCode;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Setting;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderConfirmationMail;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Create a new ticket order
     */
    public function create(Request $request)
    {
        try {
            // Email / phone boleh dipakai lagi kalau order sebelumnya statusnya expired atau failed
            $failedStatuses = ['expire', 'deny', 'cancel', 'failure', 'cancelled', 'failed'];
            $request->validate([
                'buyer_name' => 'required|string|max:255',
                'buyer_email' => [
                    'required','email','max:255',
                    Rule::unique('orders','buyer_email')->where(fn($q)=>$q->whereNotIn('status', $failedStatuses))
                ],
                'buyer_phone' => [
                    'required','string','max:20',
                    Rule::unique('orders','buyer_phone')->where(fn($q)=>$q->whereNotIn('status', $failedStatuses))
                ],
                'quantity' => 'required|integer|min:1|max:10',
                'referral_code' => 'nullable|string|exists:referral_codes,code',
                'discount_code' => 'nullable|string|exists:discount_codes,code',
                'category' => 'required|in:internal,external',
                'ticket_type' => 'nullable|string|exists:ticket_types,type',
            ]);

            // Get the current available ticket type price
            $availableTicketType = TicketType::where('is_disabled', false)
                ->where('is_available', true)
                ->whereNotNull('price')
                ->orderBy('sort_order', 'asc')
                ->first();

            if (!$availableTicketType) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tickets are currently available for purchase.',
                    'errors' => [
                        'ticket_type' => ['No tickets are currently available for purchase.']
                    ]
                ], 422);
            }

            // If a specific ticket type is requested, validate it's available
            if ($request->ticket_type) {
                $requestedTicketType = TicketType::where('type', $request->ticket_type)
                    ->where('is_disabled', false)
                    ->where('is_available', true)
                    ->whereNotNull('price')
                    ->first();

                if (!$requestedTicketType) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The requested ticket type is not available for purchase.',
                        'errors' => [
                            'ticket_type' => ['The requested ticket type is not available for purchase.']
                        ]
                    ], 422);
                }

                $availableTicketType = $requestedTicketType;
            }

            $basePrice = $availableTicketType->price;
            $amount = $basePrice * $request->quantity;
            $referralCodeId = null;
            $discountCodeId = null;
            $discountAmount = 0;
            $bundleDiscount = 0;

            // Handle referral code (existing logic)
            if ($request->referral_code) {
                $referralCode = ReferralCode::where('code', $request->referral_code)
                    ->where('is_active', true)
                    ->first();
                if ($referralCode) {
                    $referralCodeId = $referralCode->id;
                }
            }

            // Handle discount code (NEW LOGIC)
            if ($request->discount_code) {
                $discountCode = DiscountCode::where('code', strtoupper($request->discount_code))
                    ->where('is_active', true)
                    ->first();
                    
                if (!$discountCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Discount code not found or inactive',
                        'errors' => [
                            'discount_code' => ['Discount code not found or inactive']
                        ]
                    ], 422);
                }
                
                // CRITICAL: Re-check availability at order creation time
                // This prevents race conditions where multiple users validate simultaneously
                if (!$discountCode->isAvailable()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Discount code has reached its usage limit',
                        'errors' => [
                            'discount_code' => ['Discount code has reached its usage limit']
                        ]
                    ], 422);
                }
                
                $discountCodeId = $discountCode->id;
                $discountAmount = $discountCode->calculateDiscount($amount);
            }

            $finalAmount = $amount - $discountAmount;
            // Apply bundle ticket discount if enabled
            try {
                $bundleEnabled = Setting::get('bundle_ticket_enabled', '0') === '1';
            } catch (\Exception $e) {
                $bundleEnabled = false;
            }

            if ($bundleEnabled) {
                $q = (int) $request->quantity;
                if ($q === 2) $bundleDiscount = 4000;
                elseif ($q === 3) $bundleDiscount = 6000;
                elseif ($q === 4) $bundleDiscount = 8000;
                elseif ($q === 5) $bundleDiscount = 10000;
                else $bundleDiscount = 0;
            }

            $totalDiscount = $discountAmount + $bundleDiscount;
            $finalAmount = $amount - $totalDiscount;

            $order = DB::transaction(function () use ($request, $amount, $discountAmount, $bundleDiscount, $finalAmount, $referralCodeId, $discountCodeId) {
                $orderData = [
                    'buyer_name' => $request->buyer_name,
                    'buyer_email' => $request->buyer_email,
                    'buyer_phone' => $request->buyer_phone,
                    'category' => $request->category,
                    'ticket_quantity' => $request->quantity,
                    'referral_code_id' => $referralCodeId,
                    'discount_code_id' => $discountCodeId,
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'amount' => $amount,
                    'discount_amount' => $discountAmount,
                    'bundle_discount_amount' => $bundleDiscount,
                    'final_amount' => $finalAmount,
                    'status' => 'pending',
                ];

                $order = Order::create($orderData);

                // Generate pending tickets atomically
                for ($i = 1; $i <= $request->quantity; $i++) {
                    $order->tickets()->create([
                        'ticket_code' => 'TKT-' . $order->order_number . '-' . str_pad($i, 2, '0', STR_PAD_LEFT) . '-' . strtoupper(Str::random(4)),
                        'status' => 'pending',
                    ]);
                }

                return $order;
            });

            // Load relationships for response
            $order->load(['tickets', 'referralCode', 'discountCode']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order
                ]
            ], 201);
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Jika unique index lama masih ada (belum migrasi drop), tangani agar pesan sesuai requirement baru
            if ($e->errorInfo[1] == 1062) { // MySQL duplicate entry error
                $errorMessage = $e->getMessage();
                if (str_contains($errorMessage, 'buyer_email')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email ini sudah dipakai untuk order yang masih aktif (belum expire).',
                        'errors' => [
                            'buyer_email' => ['Email ini sudah dipakai untuk order yang masih aktif (belum expire).']
                        ]
                    ], 422);
                } elseif (str_contains($errorMessage, 'buyer_phone')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Nomor telepon ini sudah dipakai untuk order yang masih aktif (belum expire).',
                        'errors' => [
                            'buyer_phone' => ['Nomor telepon ini sudah dipakai untuk order yang masih aktif (belum expire).']
                        ]
                    ], 422);
                }
            }
            throw $e;
        }
    }

    /**
     * Admin: Delete an order ONLY if sync_locked is true (very strict confirmations)
     * - Confirmations: confirm1 must equal "I_UNDERSTAND_DELETE"
     *   and confirm2 must equal the exact order_number
     * - Deletes tickets first, then the order
     */
    public function adminDelete(Request $request, $orderNumber)
    {
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $request->validate([
            'confirm1' => 'required|in:I_UNDERSTAND_DELETE',
            'confirm2' => 'required|string',
        ]);

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if (!$order->sync_locked) {
            return response()->json(['success' => false, 'message' => 'Order must be sync-locked before deletion.'], 400);
        }

        if ($request->input('confirm2') !== $order->order_number) {
            return response()->json(['success' => false, 'message' => 'Second confirmation does not match order number.'], 422);
        }

        try {
            \DB::transaction(function () use ($order) {
                // Delete tickets first to avoid FK issues
                $order->tickets()->delete();
                // Then delete the order
                $order->delete();
            });

            $adminId = optional($request->user())->id ?? data_get(session('admin_user'), 'id');
            \Log::warning('Order deleted by admin (strict, sync-locked)', [
                'order_number' => $orderNumber,
                'admin_id' => $adminId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order and tickets deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Create a manual paid order (for offline/Google Form sales)
     * - Required fields: buyer_name, buyer_email, buyer_phone, category, ticket_quantity, final_amount
     * - Optional: referral_code
     * - Behavior: status = settlement, paid_at = now, sync_locked = true, tickets generated as valid
     */
    public function adminCreateManual(Request $request)
    {
        // Only allow admin via Sanctum or session-based admin
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $validated = $request->validate([
            'buyer_name' => 'required|string|max:255',
            'buyer_email' => 'required|email|max:255',
            'buyer_phone' => 'required|string|max:25',
            'category' => 'required|in:internal,external',
            'ticket_quantity' => 'required|integer|min:1|max:20',
            'final_amount' => 'required|integer|min:0',
            'referral_code' => 'nullable|string|max:100',
        ]);

        $referralCodeId = null;
        if (!empty($validated['referral_code'])) {
            $ref = ReferralCode::where('code', $validated['referral_code'])->first();
            if ($ref) {
                $referralCodeId = $ref->id;
            }
        }

        // Create order with paid status and sync locked inside a transaction
        try {
            $order = DB::transaction(function () use ($validated, $referralCodeId) {
                $order = Order::create([
                    'buyer_name' => $validated['buyer_name'],
                    'buyer_email' => $validated['buyer_email'],
                    'buyer_phone' => $validated['buyer_phone'],
                    'category' => $validated['category'],
                    'ticket_quantity' => $validated['ticket_quantity'],
                    'referral_code_id' => $referralCodeId,
                    'discount_code_id' => null,
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'amount' => (int) $validated['final_amount'],
                    'discount_amount' => 0,
                    'final_amount' => (int) $validated['final_amount'],
                    'status' => 'settlement',
                    'paid_at' => now(),
                    'sync_locked' => true,
                    'sync_locked_reason' => 'Manual import (pre-web sale)',
                ]);

                // Generate valid tickets
                for ($i = 1; $i <= (int) $validated['ticket_quantity']; $i++) {
                    Ticket::create([
                        'order_id' => $order->id,
                        'ticket_code' => 'TKT-' . $order->order_number . '-' . str_pad((string)$i, 2, '0', STR_PAD_LEFT) . '-' . strtoupper(Str::random(4)),
                        'status' => 'valid',
                    ]);
                }

                return $order;
            });

            $order->load(['tickets', 'referralCode', 'discountCode']);

            \Log::warning('Manual order created by admin (paid + sync locked)', [
                'order_number' => $order->order_number,
                'admin_id' => optional($request->user())->id ?? data_get(session('admin_user'), 'id')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Manual order created as paid and sync locked',
                'data' => [
                    'order' => $order
                ]
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            // Handle duplicate entry for email/phone and provide friendly message
            if ($e->errorInfo[1] == 1062) {
                $errorMessage = $e->getMessage();
                if (str_contains($errorMessage, 'buyer_email')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email ini sudah dipakai untuk order yang masih aktif (belum expire).',
                        'errors' => [
                            'buyer_email' => ['Email ini sudah dipakai untuk order yang masih aktif (belum expire).']
                        ]
                    ], 422);
                } elseif (str_contains($errorMessage, 'buyer_phone')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Nomor telepon ini sudah dipakai untuk order yang masih aktif (belum expire).',
                        'errors' => [
                            'buyer_phone' => ['Nomor telepon ini sudah dipakai untuk order yang masih aktif (belum expire).']
                        ]
                    ], 422);
                }
            }
            // Re-throw if not handled specifically
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Failed creating manual order', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create manual order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order details by order number
     */
    public function show(Request $request, $orderNumber)
    {
        // Restrict to admin-only to prevent data leakage
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $order = Order::where('order_number', $orderNumber)
            ->with(['tickets', 'referralCode', 'discountCode'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        // Safety net: if order is successful but some tickets are not 'valid', fix them
        try {
            if (method_exists($order, 'isSuccessful') && $order->isSuccessful()) {
                $updated = 0;
                foreach ($order->tickets as $ticket) {
                    if ($ticket->status !== 'valid') {
                        $ticket->update(['status' => 'valid']);
                        $updated++;
                    }
                }
                if ($updated > 0) {
                    \Log::info('Normalized ticket statuses to valid for successful order on show()', [
                        'order_number' => $order->order_number,
                        'updated_count' => $updated,
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Failed normalizing tickets in show()', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    /**
     * Get all orders (admin only)
     */
    public function index(Request $request)
    {
        $query = Order::with(['referralCode', 'discountCode', 'tickets']);

        // Search by buyer_name or buyer_email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('buyer_name', 'like', "%$search%")
                  ->orWhere('buyer_email', 'like', "%$search%");
            });
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Support custom page size up to 10,000 (default to 10,000 to show all as requested)
        $perPage = (int) $request->query('per_page', 10000);
        if ($perPage <= 0) {
            $perPage = 20; // sane fallback
        }
        $perPage = min($perPage, 10000);

        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders
            ]
        ]);
    }

    /**
     * Update order status (payment webhook will use this)
     */
    public function updateStatus(Request $request, $orderNumber)
    {
        try {
            // Admin-only manual override path with lock
            if (($request->user()->role ?? null) !== 'admin') {
                return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
            }

            \Log::info('Payment webhook received', [
                'order_number' => $orderNumber,
                'request_data' => $request->all()
            ]);

            $request->validate([
                'status' => 'required|in:pending,authorize,capture,settlement,deny,cancel,expire,refund,partial_refund,chargeback,partial_chargeback,failure,paid,failed,cancelled',
                'midtrans_transaction_id' => 'nullable|string',
                'midtrans_payment_type' => 'nullable|string',
                'midtrans_response' => 'nullable'
            ]);

            $order = Order::where('order_number', $orderNumber)->first();

            if (!$order) {
                \Log::error('Order not found in payment webhook', [
                    'order_number' => $orderNumber
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            \Log::info('Processing payment update for order', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'current_status' => $order->status,
                'new_status' => $request->status
            ]);

            $updateData = [
                'status' => $request->status
            ];

            if ($request->midtrans_transaction_id) {
                $updateData['midtrans_transaction_id'] = $request->midtrans_transaction_id;
            }

            if ($request->midtrans_payment_type) {
                $updateData['midtrans_payment_type'] = $request->midtrans_payment_type;
            }

            // Handle midtrans_response which could be JSON string or array
            if ($request->midtrans_response) {
                if (is_string($request->midtrans_response)) {
                    try {
                        $updateData['midtrans_response'] = json_decode($request->midtrans_response, true);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to decode midtrans_response JSON', [
                            'error' => $e->getMessage(),
                            'response' => $request->midtrans_response
                        ]);
                        // Store as is if JSON decode fails
                        $updateData['midtrans_response'] = $request->midtrans_response;
                    }
                } else {
                    $updateData['midtrans_response'] = $request->midtrans_response;
                }
            }

            $order->update($updateData);
            
            // Check if the new status indicates a successful payment
            if ($order->isSuccessful() && !$order->paid_at) {
                \Log::info('Payment successful, updating tickets to valid', [
                    'order_number' => $order->order_number
                ]);
                
                // Update ticket status individually to trigger model events
                foreach ($order->tickets as $ticket) {
                    if ($ticket->status !== 'valid') {
                        $ticket->update(['status' => 'valid']);
                    }
                }
                
                // Update paid_at timestamp
                $order->update(['paid_at' => now()]);
                
                \Log::info('Tickets updated to valid status', [
                    'order_number' => $order->order_number,
                    'ticket_count' => $order->tickets->count()
                ]);
            }
            $order->load(['tickets', 'referralCode', 'discountCode']);

            \Log::info('Order status updated successfully', [
                'order_number' => $order->order_number,
                'new_status' => $order->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order' => $order
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error processing payment webhook', [
                'order_number' => $orderNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment update: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manually lock an order from syncing with Midtrans (admin-only) with multi-confirmation
     */
    public function lockSync(Request $request, $orderNumber)
    {
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $request->validate([
            'confirm' => 'required|in:LOCK',
            'reason' => 'nullable|string|max:1000',
        ]);

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->update([
            'sync_locked' => true,
            'sync_locked_reason' => $request->input('reason'),
        ]);

        $adminId = optional($request->user())->id ?? data_get(session('admin_user'), 'id');
        \Log::warning('Order sync locked by admin', [
            'order_number' => $order->order_number,
            'admin_id' => $adminId,
            'reason' => $request->input('reason')
        ]);

        return response()->json(['success' => true, 'message' => 'Order sync locked', 'data' => ['order' => $order]]);
    }

    /**
     * Unlock order for syncing again (admin-only) with confirmation
     */
    public function unlockSync(Request $request, $orderNumber)
    {
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $request->validate([
            'confirm' => 'required|in:UNLOCK',
        ]);

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->update([
            'sync_locked' => false,
            'sync_locked_reason' => null,
        ]);

        $adminId = optional($request->user())->id ?? data_get(session('admin_user'), 'id');
        \Log::info('Order sync unlocked by admin', [
            'order_number' => $order->order_number,
            'admin_id' => $adminId,
        ]);

        return response()->json(['success' => true, 'message' => 'Order sync unlocked', 'data' => ['order' => $order]]);
    }

    /**
     * Update order status manually (admin-only) with lock and stricter confirmations
     */
    public function adminUpdateStatus(Request $request, $orderNumber)
    {
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,authorize,capture,settlement,deny,cancel,expire,refund,partial_refund,chargeback,partial_chargeback,failure,paid,failed,cancelled',
            'confirm1' => 'required|in:I_UNDERSTAND',
            'confirm2' => 'required|in:LOCK_AND_UPDATE',
            'reason' => 'nullable|string|max:1000',
        ]);

        $order = Order::where('order_number', $orderNumber)->with('tickets')->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        // Lock sync first
        $order->update([
            'sync_locked' => true,
            'sync_locked_reason' => $request->input('reason')
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        $order->update(['status' => $newStatus]);

        // Normalize tickets if marked paid
        if (in_array($newStatus, ['capture', 'settlement', 'paid'])) {
            if (!$order->paid_at) {
                $order->update(['paid_at' => now()]);
            }
            foreach ($order->tickets as $ticket) {
                if ($ticket->status !== 'valid') {
                    $ticket->update(['status' => 'valid']);
                }
            }
        }

        // Optionally send confirmation email
        try {
            if (in_array($newStatus, ['capture', 'settlement', 'paid'])) {
                Mail::to($order->buyer_email)->send(new OrderConfirmationMail($order));
            }
        } catch (\Exception $e) {
            Log::warning('Failed sending email on adminUpdateStatus: ' . $e->getMessage());
        }

        $adminId = optional($request->user())->id ?? data_get(session('admin_user'), 'id');
        \Log::warning('Order status manually updated by admin with sync lock', [
            'order_number' => $order->order_number,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'admin_id' => $adminId,
            'reason' => $request->input('reason')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status manually updated and sync locked',
            'data' => ['order' => $order]
        ]);
    }

    /**
     * Update order details
     */
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,failed,cancelled',
            'buyer_name' => 'nullable|string|max:255',
            'buyer_email' => 'nullable|email|max:255',
            'buyer_phone' => 'nullable|string|max:20',
            'category' => 'nullable|in:internal,external'
        ]);

        $order->status = $request->status;
        
        if ($request->has('buyer_name')) {
            $order->buyer_name = $request->buyer_name;
        }
        
        if ($request->has('buyer_email')) {
            $order->buyer_email = $request->buyer_email;
        }
        
        if ($request->has('buyer_phone')) {
            $order->buyer_phone = $request->buyer_phone;
        }
        
        if ($request->has('category')) {
            $order->category = $request->category;
        }
        
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => [
                'order' => $order->fresh()->load('tickets')
            ]
        ]);
    }

    /**
     * Update ONLY the buyer_email of an order (admin)
     */
    public function updateEmail(Request $request, Order $order)
    {
        $request->validate([
            'buyer_email' => [
                'required', 'email', 'max:255',
                // Unique among orders that are not expired, excluding this order's current email
                \Illuminate\Validation\Rule::unique('orders', 'buyer_email')
                    ->ignore($order->id)
                    ->where(fn($q) => $q->where('status', '!=', 'expire')),
            ],
        ]);

        $order->buyer_email = $request->buyer_email;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Buyer email updated successfully',
            'data' => [
                'order' => $order->fresh()->load(['tickets','referralCode','discountCode'])
            ]
        ], 200);
    }

    /**
     * Delete an order
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Cleanup orders: delete all with status 'expire' and
     * delete 'pending' orders older than or equal to 2 hours.
     * Important: tickets are deleted first to avoid FK issues.
     */
    public function cleanup(Request $request)
    {
        try {
            $twoHoursAgo = now()->subHours(2);

            // Collect expired orders
            $expiredIds = Order::where('status', 'expire')->pluck('id');

            // Collect stale pending orders (created_at <= now - 2 hours)
            $stalePendingIds = Order::where('status', 'pending')
                ->where('created_at', '<=', $twoHoursAgo)
                ->pluck('id');

            $deletedExpired = 0;
            $deletedStalePending = 0;

            DB::transaction(function () use ($expiredIds, $stalePendingIds, &$deletedExpired, &$deletedStalePending) {
                if ($expiredIds->isNotEmpty()) {
                    Ticket::whereIn('order_id', $expiredIds)->delete();
                    $deletedExpired = Order::whereIn('id', $expiredIds)->delete();
                }
                if ($stalePendingIds->isNotEmpty()) {
                    Ticket::whereIn('order_id', $stalePendingIds)->delete();
                    $deletedStalePending = Order::whereIn('id', $stalePendingIds)->delete();
                }
            });

            Log::info('Orders cleanup executed', [
                'deleted_expired' => $deletedExpired,
                'deleted_stale_pending' => $deletedStalePending,
                'total_deleted' => $deletedExpired + $deletedStalePending,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cleanup completed',
                'data' => [
                    'deleted_expired' => $deletedExpired,
                    'deleted_stale_pending' => $deletedStalePending,
                    'total_deleted' => $deletedExpired + $deletedStalePending,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Orders cleanup failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Cleanup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend order receipt email (admin only)
     */
    public function resendReceipt(Request $request, Order $order)
    {
        try {
            // Ensure order has an email
            if (!$order->buyer_email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order does not have a buyer email to send the receipt to.'
                ], 422);
            }

            // Only allow if payment is successful or marked paid
            $successfulStatuses = ['paid', 'settlement', 'capture'];
            $isSuccessful = (method_exists($order, 'isSuccessful') && $order->isSuccessful())
                || in_array($order->status, $successfulStatuses, true)
                || !is_null($order->paid_at);

            if (!$isSuccessful) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot resend receipt for an unpaid order. Please confirm payment first.'
                ], 409);
            }

            // Eager load required relations for email content
            $order->loadMissing(['tickets', 'referralCode', 'discountCode']);

            // Normalize ticket statuses to 'valid' before sending (idempotent)
            $updatedTickets = 0;
            foreach ($order->tickets as $ticket) {
                if ($ticket->status !== 'valid') {
                    $ticket->update(['status' => 'valid']);
                    $updatedTickets++;
                }
            }

            Log::info('Resending order receipt email', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'buyer_email' => $order->buyer_email,
                'tickets_normalized' => $updatedTickets,
            ]);

            // Send the exact same email (same mailable) as during purchase
            Mail::to($order->buyer_email)->send(new OrderConfirmationMail($order));

            return response()->json([
                'success' => true,
                'message' => 'Receipt has been resent to ' . $order->buyer_email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to resend receipt', [
                'order_id' => $order->id ?? null,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend receipt: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend order receipt emails to all successful orders (admin only, chunked for reliability)
     */
    public function resendAllReceipts(Request $request)
    {
        $isSanctumAdmin = $request->user() && (($request->user()->role ?? null) === 'admin');
        $sessionAdmin = session('admin_logged_in') && ((data_get(session('admin_user'), 'role') === 'admin'));
        if (!$isSanctumAdmin && !$sessionAdmin) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        // Allow long-running execution to avoid timeouts on large sends
        try { set_time_limit(0); } catch (\Throwable $e) {}
        try { ini_set('memory_limit', '512M'); } catch (\Throwable $e) {}

        $successfulStatuses = ['capture', 'settlement', 'paid'];
        $skipReasons = ['Onsite sale (OTS)'];
        $normalizedSkip = array_map(function ($r) {
            return strtolower(trim($r, " \"'\\t\\n\\r\\0\\x0B"));
        }, $skipReasons);
        $stats = [
            'eligible' => 0,
            'processed' => 0,
            'sent' => 0,
            'skipped_missing_email' => 0,
            'skipped_wrong_status' => 0,
            'skipped_ots_reason' => 0,
            'failed' => 0,
            'tickets_normalized' => 0,
            'failed_orders' => [],
        ];

        $baseQuery = Order::whereNotNull('buyer_email')
            ->whereIn('status', $successfulStatuses)
            ->orderBy('id');

        $stats['eligible'] = (clone $baseQuery)->count();

        $baseQuery->chunkById(100, function ($orders) use (&$stats, $successfulStatuses) {
            foreach ($orders as $order) {
                $stats['processed']++;
                try {
                    $order->loadMissing(['tickets', 'referralCode', 'discountCode']);

                    if (!$order->buyer_email) {
                        $stats['skipped_missing_email']++;
                        continue;
                    }

                    $isSuccessful = (method_exists($order, 'isSuccessful') && $order->isSuccessful())
                        || in_array($order->status, $successfulStatuses, true);

                    if (!$isSuccessful) {
                        $stats['skipped_wrong_status']++;
                        continue;
                    }
                    $reason = strtolower(trim((string) $order->sync_locked_reason, " \"'\\t\\n\\r\\0\\x0B"));
                    if (in_array($reason, $normalizedSkip, true)) {
                        $stats['skipped_ots_reason']++;
                        continue;
                    }

                    foreach ($order->tickets as $ticket) {
                        if ($ticket->status !== 'valid') {
                            $ticket->update(['status' => 'valid']);
                            $stats['tickets_normalized']++;
                        }
                    }

                    Mail::to($order->buyer_email)->send(new OrderConfirmationMail($order));
                    $stats['sent']++;
                } catch (\Throwable $e) {
                    $stats['failed']++;
                    $stats['failed_orders'][] = [
                        'order_id' => $order->id ?? null,
                        'order_number' => $order->order_number ?? null,
                        'email' => $order->buyer_email ?? null,
                        'error' => $e->getMessage(),
                    ];
                    Log::error('Failed to bulk resend receipt', [
                        'order_id' => $order->id ?? null,
                        'order_number' => $order->order_number ?? null,
                        'buyer_email' => $order->buyer_email ?? null,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });

        Log::info('Bulk resend receipts completed', array_merge($stats, [
            'triggered_by' => optional($request->user())->id ?? data_get(session('admin_user'), 'id'),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Receipt emails resent. Sent to ' . $stats['sent'] . ' buyer(s).',
            'data' => $stats,
        ]);
    }

    /**
     * Admin repair: normalize tickets to valid for a successful order
     */
    public function repairTickets(Order $order)
    {
        try {
            $order->load('tickets');
            if (!(method_exists($order, 'isSuccessful') && $order->isSuccessful()) && is_null($order->paid_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not in a successful state. No changes applied.'
                ], 409);
            }
            $updated = 0;
            foreach ($order->tickets as $ticket) {
                if ($ticket->status !== 'valid') {
                    $ticket->update(['status' => 'valid']);
                    $updated++;
                }
            }
            return response()->json([
                'success' => true,
                'message' => "Normalized {$updated} tickets to valid.",
                'updated' => $updated
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to repair tickets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for existing orders by email or phone
     */
    public function checkExisting(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        // Cek hanya order non-expire
        $existingEmailOrder = Order::where('buyer_email', $request->email)
            ->where('status', '!=', 'expire')
            ->first();

        if ($existingEmailOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Email ini sudah digunakan untuk order aktif (belum expire).',
                'errors' => [
                    'buyer_email' => ['Email ini sudah digunakan untuk order aktif (belum expire).']
                ]
            ], 422);
        }

        $existingPhoneOrder = Order::where('buyer_phone', $request->phone)
            ->where('status', '!=', 'expire')
            ->first();

        if ($existingPhoneOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon ini sudah digunakan untuk order aktif (belum expire).',
                'errors' => [
                    'buyer_phone' => ['Nomor telepon ini sudah digunakan untuk order aktif (belum expire).']
                ]
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'No existing order found. You can proceed with your purchase.'
        ]);
    }

    /**
     * Cancel a pending order
     */
    public function cancel($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.'
            ], 404);
        }

        // Allow cancellation when order is still not finalized. Users often reach 'authorize' when a method is chosen.
        if (!in_array($order->status, ['pending', 'authorize'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only unpaid orders can be cancelled.'
            ], 409);
        }

        // Delete associated tickets first
        $order->tickets()->delete();
        
        // Then delete the order
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled and deleted successfully.'
        ]);
    }

    /**
     * Get current available ticket price
     */
    public function getCurrentPrice()
    {
        try {
            $availableTicketType = TicketType::where('is_disabled', false)
                ->where('is_available', true)
                ->whereNotNull('price')
                ->orderBy('sort_order', 'asc')
                ->first();

            if (!$availableTicketType) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tickets are currently available for purchase.',
                    'data' => [
                        'price' => null,
                        'ticket_type' => null
                    ]
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Current ticket price retrieved successfully',
                'data' => [
                    'price' => $availableTicketType->price,
                    'ticket_type' => $availableTicketType->type,
                    'header' => $availableTicketType->header,
                    'formatted_price' => $availableTicketType->formatted_price
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve current ticket price',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
