<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CountdownEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CountdownEventController extends Controller
{
    /**
     * Get all countdown events
     */
    public function index()
    {
        try {
            $events = CountdownEvent::active()->ordered()->get();
            
            $formattedEvents = $events->map(function ($event) {
                return $event->formatted_data;
            });

            return response()->json([
                'success' => true,
                'data' => $formattedEvents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving countdown events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific countdown event
     */
    public function show($id)
    {
        try {
            $event = CountdownEvent::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Countdown event not found'
            ], 404);
        }
    }

    /**
     * Create new countdown event
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_key' => 'required|string|max:255|unique:countdown_events,event_key',
            'name' => 'required|string|max:255',
            'target_date' => 'required|date|after:now',
            'bg_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order' => 'required|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $event = CountdownEvent::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Countdown event created successfully',
                'data' => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating countdown event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update countdown event
     */
    public function update(Request $request, $id)
    {
        $event = CountdownEvent::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'event_key' => 'required|string|max:255|unique:countdown_events,event_key,' . $id,
            'name' => 'required|string|max:255',
            'target_date' => 'required|date',
            'bg_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order' => 'required|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $event->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Countdown event updated successfully',
                'data' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating countdown event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete countdown event
     */
    public function destroy($id)
    {
        try {
            $event = CountdownEvent::findOrFail($id);
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Countdown event deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting countdown event: ' . $e->getMessage()
            ], 500);
        }
    }
}