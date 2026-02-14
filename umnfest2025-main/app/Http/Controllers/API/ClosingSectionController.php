<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClosingSection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ClosingSectionController extends Controller
{
    /**
     * Display the active closing section (for public use)
     */
    public function index(): JsonResponse
    {
        try {
            $closingSection = ClosingSection::getDefault();
            
            return response()->json([
                'success' => true,
                'data' => $closingSection,
                'message' => 'Closing section retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve closing section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified closing section
     */
    public function show(ClosingSection $closingSection): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $closingSection,
                'message' => 'Closing section retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve closing section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created closing section (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'image_url' => 'required|url|max:500',
                'head_text' => 'required|string|max:255',
                'content_text' => 'required|string',
                'button1_text' => 'required|string|max:100',
                'button1_link' => 'required|string|max:500',
                'button2_text' => 'required|string|max:100',
                'button2_link' => 'required|string|max:500',
                'is_active' => 'required|boolean',
            ]);

            // If this section is being set as active, deactivate all others
            if ($validated['is_active']) {
                ClosingSection::where('is_active', true)->update(['is_active' => false]);
            }

            $closingSection = ClosingSection::create($validated);

            return response()->json([
                'success' => true,
                'data' => $closingSection,
                'message' => 'Closing section created successfully'
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
                'message' => 'Failed to create closing section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified closing section (admin only)
     */
    public function update(Request $request, ClosingSection $closingSection): JsonResponse
    {
        try {
            $validated = $request->validate([
                'image_url' => 'sometimes|url|max:500',
                'head_text' => 'sometimes|string|max:255',
                'content_text' => 'sometimes|string',
                'button1_text' => 'sometimes|string|max:100',
                'button1_link' => 'sometimes|string|max:500',
                'button2_text' => 'sometimes|string|max:100',
                'button2_link' => 'sometimes|string|max:500',
                'is_active' => 'sometimes|boolean',
            ]);

            // If this section is being set as active, deactivate all others
            if (isset($validated['is_active']) && $validated['is_active']) {
                ClosingSection::where('id', '!=', $closingSection->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $closingSection->update($validated);

            return response()->json([
                'success' => true,
                'data' => $closingSection->fresh(),
                'message' => 'Closing section updated successfully'
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
                'message' => 'Failed to update closing section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified closing section (admin only)
     */
    public function destroy(ClosingSection $closingSection): JsonResponse
    {
        try {
            $closingSection->delete();

            return response()->json([
                'success' => true,
                'message' => 'Closing section deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete closing section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all closing sections for admin management
     */
    public function admin(): JsonResponse
    {
        try {
            $closingSections = ClosingSection::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $closingSections,
                'message' => 'Closing sections retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve closing sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}