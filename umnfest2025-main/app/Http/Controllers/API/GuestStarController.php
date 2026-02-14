<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\GuestStar;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class GuestStarController extends Controller
{
    /**
     * Display a listing of guest stars (for public use)
     */
    public function index(): JsonResponse
    {
        try {
            $guestStars = GuestStar::ordered()->get();
            
            return response()->json([
                'success' => true,
                'data' => $guestStars,
                'message' => 'Guest stars retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve guest stars',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created guest star (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'required|integer|min:0',
                'name' => 'required|string|max:255',
                'image' => 'nullable|url|max:500',
                'below_image' => 'nullable|url|max:500',
                'is_revealed' => 'required|boolean',
            ]);

            $guestStar = GuestStar::create($validated);

            return response()->json([
                'success' => true,
                'data' => $guestStar,
                'message' => 'Guest star created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create guest star',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified guest star
     */
    public function show(GuestStar $guestStar): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $guestStar,
                'message' => 'Guest star retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve guest star',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified guest star (admin only)
     */
    public function update(Request $request, GuestStar $guestStar): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'sometimes|integer|min:0',
                'name' => 'sometimes|string|max:255',
                'image' => 'nullable|url|max:500',
                'below_image' => 'nullable|url|max:500',
                'is_revealed' => 'sometimes|boolean',
            ]);

            $guestStar->update($validated);

            return response()->json([
                'success' => true,
                'data' => $guestStar->fresh(),
                'message' => 'Guest star updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update guest star',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified guest star (admin only)
     */
    public function destroy(GuestStar $guestStar): JsonResponse
    {
        try {
            $guestStar->delete();

            return response()->json([
                'success' => true,
                'message' => 'Guest star deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete guest star',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}