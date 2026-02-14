<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DiscountCode;

class DiscountCodeController extends Controller
{
    /**
     * Get all discount codes (admin only)
     */
    public function index()
    {
        $discountCodes = DiscountCode::with(['orders' => function($query) {
                $query->whereIn('status', ['capture', 'settlement', 'paid']);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'discount_percentage' => $code->discount_percentage,
                    'quota' => $code->quota,
                    'used_count' => $code->used_count,
                    'remaining_quota' => $code->remaining_quota,
                    'is_active' => $code->is_active,
                    'created_at' => $code->created_at,
                    'updated_at' => $code->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'discount_codes' => $discountCodes
            ]
        ], 200);
    }

    /**
     * Validate a discount code (public)
     */
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $discountCode = DiscountCode::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$discountCode) {
            return response()->json([
                'success' => false,
                'message' => 'Discount code not found or inactive'
            ], 404);
        }

        if (!$discountCode->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Discount code has reached its usage limit'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Discount code is valid',
            'data' => [
                'discount_code' => [
                    'id' => $discountCode->id,
                    'code' => $discountCode->code,
                    'discount_percentage' => $discountCode->discount_percentage,
                    'remaining_quota' => $discountCode->remaining_quota,
                ]
            ]
        ], 200);
    }

    /**
     * Create a new discount code (admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:discount_codes,code',
            'discount_percentage' => 'required|numeric|min:1|max:100',
            'quota' => 'required|integer|min:1',
            'is_active' => 'boolean'
        ]);

        $discountCode = DiscountCode::create([
            'code' => strtoupper($request->code),
            'discount_percentage' => $request->discount_percentage,
            'quota' => $request->quota,
            'is_active' => $request->is_active ?? true,
            'used_count' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Discount code created successfully',
            'data' => [
                'discount_code' => $discountCode
            ]
        ], 201);
    }

    /**
     * Update a discount code (admin only)
     */
    public function update(Request $request, $id)
    {
        $discountCode = DiscountCode::find($id);

        if (!$discountCode) {
            return response()->json([
                'success' => false,
                'message' => 'Discount code not found'
            ], 404);
        }

        $request->validate([
            'code' => 'required|string|unique:discount_codes,code,' . $id,
            'discount_percentage' => 'required|numeric|min:1|max:100',
            'quota' => 'required|integer|min:1',
            'is_active' => 'boolean'
        ]);

        // Prevent reducing quota below current usage
        if ($request->quota < $discountCode->used_count) {
            return response()->json([
                'success' => false,
                'message' => 'Quota cannot be lower than current usage count (' . $discountCode->used_count . ')'
            ], 400);
        }

        $discountCode->update([
            'code' => strtoupper($request->code),
            'discount_percentage' => $request->discount_percentage,
            'quota' => $request->quota,
            'is_active' => $request->is_active ?? $discountCode->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Discount code updated successfully',
            'data' => [
                'discount_code' => $discountCode->fresh()
            ]
        ], 200);
    }

    /**
     * Delete a discount code (admin only)
     */
    public function destroy($id)
    {
        $discountCode = DiscountCode::find($id);

        if (!$discountCode) {
            return response()->json([
                'success' => false,
                'message' => 'Discount code not found'
            ], 404);
        }

        // Check if discount code has been used
        if ($discountCode->used_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete discount code that has been used'
            ], 400);
        }

        $discountCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Discount code deleted successfully'
        ], 200);
    }

    /**
     * Recalculate usage for all discount codes (admin only)
     */
    public function recalculateUsage()
    {
        $discountCodes = DiscountCode::all();
        $updated = 0;

        foreach ($discountCodes as $discountCode) {
            $oldCount = $discountCode->used_count;
            $newCount = $discountCode->recalculateUses();
            
            if ($oldCount !== $newCount) {
                $updated++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully updated {$updated} discount codes",
            'data' => [
                'total_codes' => $discountCodes->count(),
                'updated_codes' => $updated
            ]
        ], 200);
    }
}