<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DivisionController extends Controller
{
    // Public: list all active divisions ordered
    public function index(): JsonResponse
    {
        try {
            $divisions = Division::active()->ordered()->get();

            return response()->json([
                'success' => true,
                'data' => $divisions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve divisions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: list all (including inactive), ordered
    public function adminIndex(): JsonResponse
    {
        try {
            $divisions = Division::ordered()->get();
            return response()->json([
                'success' => true,
                'data' => $divisions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve divisions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Public: show single division
    public function show(Division $division): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $division,
        ]);
    }

    // Admin: create
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'required|integer|min:0',
                'name' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'image' => 'nullable|url|max:1000',
                'description1' => 'nullable|string',
                'description2' => 'nullable|string',
                'is_active' => 'required|boolean',
            ]);

            $division = Division::create($validated);

            return response()->json([
                'success' => true,
                'data' => $division,
                'message' => 'Division created successfully',
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create division',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: update
    public function update(Request $request, Division $division): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'sometimes|integer|min:0',
                'name' => 'sometimes|string|max:255',
                'title' => 'sometimes|string|max:255',
                'image' => 'nullable|url|max:1000',
                'description1' => 'nullable|string',
                'description2' => 'nullable|string',
                'is_active' => 'sometimes|boolean',
            ]);

            $division->update($validated);

            return response()->json([
                'success' => true,
                'data' => $division->fresh(),
                'message' => 'Division updated successfully',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update division',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: delete
    public function destroy(Division $division): JsonResponse
    {
        try {
            $division->delete();

            return response()->json([
                'success' => true,
                'message' => 'Division deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete division',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}