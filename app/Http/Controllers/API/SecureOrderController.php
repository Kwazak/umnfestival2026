<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\ReferralCode;
use App\Models\Ticket;
use App\Models\TicketType;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class SecureOrderController extends Controller
{
    /**
     * Get all orders (admin only) - SECURED VERSION
     */
    public function index(Request $request)
    {
        // SECURITY: Verify admin authentication
        if (!session('admin_logged_in')) {
            Log::warning('Unauthorized orders access attempt', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        // SECURITY: Rate limiting per admin user
        $key = 'admin_orders_access_' . session('admin_user.id') . '_' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 30)) {
            Log::warning('Admin orders access rate limit exceeded', [
                'admin_id' => session('admin_user.id'),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.'
            ], 429);
        }
        
        RateLimiter::hit($key, 60); // 1 minute window

        try {
            $query = Order::with(['referralCode', 'tickets']);

            // SECURITY: Sanitized search with proper validation
            if ($search = $request->query('search')) {
                $search = trim($search);
                
                // Validate search input
                if (strlen($search) > 100) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Search term too long'
                    ], 400);
                }
                
                if (strlen($search) > 0) {
                    // Use parameter binding to prevent SQL injection
                    $query->where(function ($q) use ($search) {
                        $q->where('buyer_name', 'like', DB::raw("CONCAT('%', ?, '%')"), [$search])
                          ->orWhere('buyer_email', 'like', DB::raw("CONCAT('%', ?, '%')"), [$search]);
                    });
                }
            }

            // SECURITY: Validate status filter
            if ($status = $request->query('status')) {
                $allowedStatuses = ['pending', 'paid', 'failed', 'cancelled', 'settlement', 'capture', 'authorize', 'deny', 'cancel', 'expire'];
                if (in_array($status, $allowedStatuses)) {
                    $query->where('status', $status);
                }
            }

            $orders = $query->orderBy('created_at', 'desc')->paginate(20);

            // Log admin access
            Log::info('Admin accessed orders list', [
                'admin_user' => session('admin_user.email'),
                'ip' => $request->ip(),
                'search' => $search ?? null,
                'status_filter' => $status ?? null
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $orders
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error retrieving orders', [
                'admin_user' => session('admin_user.email'),
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving orders'
            ], 500);
        }
    }

    /**
     * Create a new ticket order - SECURED VERSION
     */
    public function create(Request $request)
    {
        // SECURITY: Rate limiting per IP
        $key = 'order_creation_' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            Log::warning('Order creation rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many order attempts. Please try again later.'
            ], 429);
        }
        
        RateLimiter::hit($key, 300); // 5 minute window

        try {
            // SECURITY: Enhanced validation with sanitization
            $validated = $request->validate([
                'buyer_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\.]+$/',
                'buyer_email' => 'required|email:rfc,dns|max:255|unique:orders,buyer_email',
                'buyer_phone' => 'required|string|max:20|regex:/^\+?[0-9\-\s]+$/|unique:orders,buyer_phone',
                'quantity' => 'required|integer|min:1|max:10',
                'referral_code' => 'nullable|string|max:50|alpha_num',
                'category' => 'required|in:internal,external',
                'ticket_type' => 'nullable|string|max:50|exists:ticket_types,type',
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
            if ($validated['ticket_type']) {
                $requestedTicketType = TicketType::where('type', $validated['ticket_type'])
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
            $amount = $basePrice * $validated['quantity'];
            $referralCodeId = null;

            if ($validated['referral_code']) {
                $referralCode = ReferralCode::where('code', $validated['referral_code'])
                    ->where('is_active', true)
                    ->first();
                if ($referralCode) {
                    $referralCodeId = $referralCode->id;
                }
            }

            $finalAmount = $amount;

            // SECURITY: Use database transaction
            DB::beginTransaction();

            try {
                $order = Order::create([
                    'buyer_name' => $validated['buyer_name'],
                    'buyer_email' => $validated['buyer_email'],
                    'buyer_phone' => $validated['buyer_phone'],
                    'category' => $validated['category'],
                    'ticket_quantity' => $validated['quantity'],
                    'referral_code_id' => $referralCodeId,
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'amount' => $amount,
                    'final_amount' => $finalAmount,
                    'status' => 'pending',
                    'user_id' => null,
                ]);

                // Create tickets for this order
                for ($i = 1; $i <= $validated['quantity']; $i++) {
                    Ticket::create([
                        'order_id' => $order->id,
                        'ticket_code' => 'TKT-' . $order->order_number . '-' . str_pad($i, 2, '0', STR_PAD_LEFT) . '-' . strtoupper(Str::random(4)),
                        'status' => 'pending'
                    ]);
                }

                DB::commit();

                // Load relationships for response
                $order->load(['tickets', 'referralCode']);

                // Log successful order creation
                Log::info('Order created successfully', [
                    'order_number' => $order->order_number,
                    'buyer_email' => $order->buyer_email,
                    'amount' => $order->amount,
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'data' => [
                        'order' => $order
                    ]
                ], 201);
                
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle unique constraint violations at database level
            if ($e->errorInfo[1] == 1062) { // MySQL duplicate entry error
                $errorMessage = $e->getMessage();
                
                if (strpos($errorMessage, 'orders_buyer_email_unique') !== false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This email has already been used for ticket booking. Each email can only be used once.',
                        'errors' => [
                            'buyer_email' => ['This email has already been used for ticket booking.']
                        ]
                    ], 422);
                } elseif (strpos($errorMessage, 'orders_buyer_phone_unique') !== false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This phone number has already been used for ticket booking. Each phone number can only be used once.',
                        'errors' => [
                            'buyer_phone' => ['This phone number has already been used for ticket booking.']
                        ]
                    ], 422);
                }
            }
            
            Log::error('Database error during order creation', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred'
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Error creating order', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the order'
            ], 500);
        }
    }
}