<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SpinController extends Controller
{
    /**
     * Validate if user is eligible to spin
     * Check: order exists, paid, email matches, not spun yet
     */
    public function validate(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            // Find order by order_number
            $order = Order::where('order_number', $request->order_number)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'eligible' => false,
                    'message' => 'Order not found. Please check your order number.',
                ], 404);
            }

            // Check if order is paid
            if (!in_array($order->status, ['paid', 'settlement', 'capture'])) {
                return response()->json([
                    'success' => false,
                    'eligible' => false,
                    'message' => 'Order is not paid yet. Please complete payment first.',
                ], 400);
            }

            // Check if email matches
            if (strtolower($order->buyer_email) !== strtolower($request->email)) {
                return response()->json([
                    'success' => false,
                    'eligible' => false,
                    'message' => 'Email does not match with this order.',
                ], 400);
            }

            // Check if already spun
            $alreadySpun = DB::table('spin_attempts')
                ->where('order_id', $order->id)
                ->exists();

            if ($alreadySpun) {
                return response()->json([
                    'success' => false,
                    'eligible' => false,
                    'message' => 'You have already spun the wheel for this order!',
                ], 400);
            }

            // All checks passed
            return response()->json([
                'success' => true,
                'eligible' => true,
                'message' => 'You are eligible to spin!',
                'order' => [
                    'order_number' => $order->order_number,
                    'buyer_name' => $order->buyer_name,
                    'ticket_quantity' => $order->ticket_quantity,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Spin validation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'eligible' => false,
                'message' => 'System error. Please try again later.',
            ], 500);
        }
    }

    /**
     * Execute spin - select random prize and save to database
     */
    public function execute(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            // Re-validate (prevent race condition)
            $order = Order::where('order_number', $request->order_number)->first();

            if (!$order || !in_array($order->status, ['paid', 'settlement', 'capture'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid order or order not paid.',
                ], 400);
            }

            if (strtolower($order->buyer_email) !== strtolower($request->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email does not match.',
                ], 400);
            }

            // Check if already spun (CRITICAL: prevent double spin)
            $alreadySpun = DB::table('spin_attempts')
                ->where('order_id', $order->id)
                ->exists();

            if ($alreadySpun) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already spun!',
                ], 400);
            }

            // Get active prizes with stock check
            $prizes = DB::table('spin_prizes')
                ->where('is_active', true)
                ->where(function($query) {
                    $query->whereNull('stock')
                          ->orWhere('stock', '>', 0);
                })
                ->get();

            if ($prizes->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No prizes available at the moment.',
                ], 500);
            }

            // Calculate total weight
            $totalWeight = $prizes->sum('probability');

            // Random number between 1 and totalWeight
            $randomNumber = rand(1, $totalWeight);

            // Select prize based on probability
            $cumulativeWeight = 0;
            $selectedPrize = null;

            foreach ($prizes as $prize) {
                $cumulativeWeight += $prize->probability;
                if ($randomNumber <= $cumulativeWeight) {
                    $selectedPrize = $prize;
                    break;
                }
            }

            // Fallback (should never happen)
            if (!$selectedPrize) {
                $selectedPrize = $prizes->last();
            }

            // Decrease stock if applicable
            if ($selectedPrize->stock !== null && $selectedPrize->type !== 'nothing') {
                DB::table('spin_prizes')
                    ->where('id', $selectedPrize->id)
                    ->decrement('stock');
            }

            // Save spin attempt
            DB::table('spin_attempts')->insert([
                'order_id' => $order->id,
                'email' => $request->email,
                'prize_id' => $selectedPrize->id,
                'prize_name' => $selectedPrize->name,
                'prize_type' => $selectedPrize->type,
                'prize_value' => $selectedPrize->value,
                'spun_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            Log::info('Spin executed', [
                'order_number' => $order->order_number,
                'email' => $request->email,
                'prize' => $selectedPrize->name,
            ]);

            // Return result
            return response()->json([
                'success' => true,
                'message' => $selectedPrize->type === 'nothing' 
                    ? 'Better luck next time!' 
                    : 'Congratulations! You won!',
                'prize' => [
                    'id' => $selectedPrize->id,
                    'name' => $selectedPrize->name,
                    'type' => $selectedPrize->type,
                    'value' => $selectedPrize->value,
                    'display_text' => $selectedPrize->display_text,
                    'probability' => $selectedPrize->probability,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Spin execution error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'System error during spin. Please try again.',
            ], 500);
        }
    }

    /**
     * Get all active prizes (for displaying on wheel)
     */
    public function prizes()
    {
        try {
            $prizes = DB::table('spin_prizes')
                ->where('is_active', true)
                ->orderBy('probability', 'asc') // Show rare prizes first
                ->get(['id', 'name', 'type', 'display_text', 'probability']);

            return response()->json([
                'success' => true,
                'data' => $prizes,
            ]);

        } catch (\Exception $e) {
            Log::error('Get prizes error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load prizes.',
            ], 500);
        }
    }
}
