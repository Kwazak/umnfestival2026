<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReferralCode;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class ReferralCodeController extends Controller
{
    /**
     * Get all referral codes (admin only)
     */
    public function index()
    {
        $referralCodes = ReferralCode::with('orders')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'referral_codes' => $referralCodes
            ]
        ], 200);
    }

    /**
     * Validate a referral code
     */
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $referralCode = ReferralCode::where('code', $request->code)
            ->where('is_active', true)
            ->first();

        if (!$referralCode) {
            return response()->json([
                'success' => false,
                'message' => 'Referral code not found or inactive'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Referral code is valid',
            'data' => [
                'referral_code' => [
                    'id' => $referralCode->id,
                    'code' => $referralCode->code,
                    'panitia_name' => $referralCode->panitia_name,
                    'discount_value' => $referralCode->discount_value,
                    'uses' => $referralCode->uses
                ]
            ]
        ], 200);
    }

    /**
     * Create a new referral code (admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:referral_codes,code',
            'panitia_name' => 'required|string|max:255',
            'is_active' => 'boolean'
        ]);

        $referralCode = ReferralCode::create([
            'code' => strtoupper($request->code),
            'panitia_name' => $request->panitia_name,
            'is_active' => $request->is_active ?? true,
            'uses' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Referral code created successfully',
            'data' => [
                'referral_code' => $referralCode
            ]
        ], 201);
    }

    /**
     * Update a referral code (admin only)
     */
    public function update(Request $request, $id)
    {
        $referralCode = ReferralCode::find($id);

        if (!$referralCode) {
            return response()->json([
                'success' => false,
                'message' => 'Referral code not found'
            ], 404);
        }

        $request->validate([
            'code' => 'required|string|unique:referral_codes,code,' . $id,
            'panitia_name' => 'required|string|max:255',
            'is_active' => 'boolean'
        ]);

        $referralCode->update([
            'code' => strtoupper($request->code),
            'panitia_name' => $request->panitia_name,
            'is_active' => $request->is_active ?? $referralCode->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Referral code updated successfully',
            'data' => [
                'referral_code' => $referralCode->fresh()
            ]
        ], 200);
    }

    /**
     * Delete a referral code (admin only)
     */
    public function destroy($id)
    {
        $referralCode = ReferralCode::find($id);

        if (!$referralCode) {
            return response()->json([
                'success' => false,
                'message' => 'Referral code not found'
            ], 404);
        }

        // Check if referral code has been used
        if ($referralCode->uses > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete referral code that has been used'
            ], 400);
        }

        $referralCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Referral code deleted successfully'
        ], 200);
    }

    /**
     * Sync 'uses' for ALL referral codes based on total tickets from PAID/SETTLEMENT orders
     * Uses = SUM(ticket_quantity) for orders with matching referral_code_id and successful status
     */
    public function syncUsesAll()
    {
        try {
            // Robust calculation: count tickets (valid or used) joined to orders by referral_code_id
            $counts = DB::table('orders')
                ->join('tickets', 'tickets.order_id', '=', 'orders.id')
                ->whereNotNull('orders.referral_code_id')
                ->whereIn('orders.status', ['capture', 'settlement', 'paid'])
                ->whereIn('tickets.status', ['valid', 'used'])
                ->groupBy('orders.referral_code_id')
                ->select('orders.referral_code_id', DB::raw('COUNT(tickets.id) as total'))
                ->pluck('total', 'orders.referral_code_id');

            $updated = 0;
            $allCodes = ReferralCode::all();
            foreach ($allCodes as $code) {
                $newUses = (int) ($counts[$code->id] ?? 0);
                if ($code->uses !== $newUses) {
                    $code->uses = $newUses;
                    $code->save();
                    $updated++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Referral codes uses synced successfully',
                'data' => [
                    'updated_codes' => $updated,
                    'total_codes' => $allCodes->count(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync referral codes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync 'uses' for a single referral code
     */
    public function syncUsesSingle(ReferralCode $referralCode)
    {
        try {
            $total = DB::table('orders')
                ->join('tickets', 'tickets.order_id', '=', 'orders.id')
                ->where('orders.referral_code_id', $referralCode->id)
                ->whereIn('orders.status', ['capture', 'settlement', 'paid'])
                ->whereIn('tickets.status', ['valid', 'used'])
                ->count('tickets.id');

            $referralCode->uses = (int) $total;
            $referralCode->save();

            return response()->json([
                'success' => true,
                'message' => 'Referral code uses synced successfully',
                'data' => [
                    'referral_code' => $referralCode->fresh(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync referral code: ' . $e->getMessage(),
            ], 500);
        }
    }
}
