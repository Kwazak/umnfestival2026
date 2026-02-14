<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TicketType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TicketTypeController extends Controller
{
    /**
     * Display a listing of ticket types (for public use)
     */
    public function index(): JsonResponse
    {
        try {
            $ticketTypes = TicketType::ordered()->get()->map(function ($ticketType) {
                return [
                    'id' => $ticketType->id,
                    'sort_order' => $ticketType->sort_order,
                    'type' => $ticketType->type,
                    'header' => $ticketType->header,
                    'price' => $ticketType->formatted_price,
                    'buttonText' => $ticketType->button_text,
                    'button_text' => $ticketType->button_text, // For admin interface
                    'isDisabled' => $ticketType->is_disabled,
                    'is_disabled' => $ticketType->is_disabled, // For admin interface
                    'isAvailable' => $ticketType->is_available,
                    'is_available' => $ticketType->is_available, // For admin interface
                    'backgroundColor' => $ticketType->background_color,
                    'background_color' => $ticketType->background_color, // For admin interface
                    'buttonAction' => $ticketType->button_action,
                    'className' => $ticketType->type, // For CSS compatibility
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $ticketTypes,
                'message' => 'Ticket types retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ticket types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created ticket type (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'required|integer|min:1|max:5',
                'type' => 'required|string|max:255|unique:ticket_types,type',
                'header' => 'required|string|max:255',
                'price' => 'nullable|numeric|min:0|max:999999999.99',
                'button_text' => 'required|string|max:255',
                'is_disabled' => 'required|boolean',
                'is_available' => 'required|boolean',
                'background_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $ticketType = TicketType::create($validated);

            return response()->json([
                'success' => true,
                'data' => $ticketType,
                'message' => 'Ticket type created successfully'
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
                'message' => 'Failed to create ticket type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ticket type
     */
    public function show(TicketType $ticketType): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $ticketType,
                'message' => 'Ticket type retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ticket type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified ticket type (admin only)
     */
    public function update(Request $request, TicketType $ticketType): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sort_order' => 'sometimes|integer|min:1|max:5',
                'type' => 'sometimes|string|max:255|unique:ticket_types,type,' . $ticketType->id,
                'header' => 'sometimes|string|max:255',
                'price' => 'nullable|numeric|min:0|max:999999999.99',
                'button_text' => 'sometimes|string|max:255',
                'is_disabled' => 'sometimes|boolean',
                'is_available' => 'sometimes|boolean',
                'background_color' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $ticketType->update($validated);

            return response()->json([
                'success' => true,
                'data' => $ticketType->fresh(),
                'message' => 'Ticket type updated successfully'
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
                'message' => 'Failed to update ticket type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified ticket type (admin only)
     */
    public function destroy(TicketType $ticketType): JsonResponse
    {
        try {
            $ticketType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket type deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ticket type',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}