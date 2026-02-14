<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EventUpcomingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventUpcomingDetailController extends Controller
{
    /**
     * Get all event upcoming details
     */
    public function index()
    {
        try {
            $events = EventUpcomingDetail::ordered()->get();
            
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
                'message' => 'Error retrieving events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific event upcoming detail
     */
    public function show($id)
    {
        try {
            $event = EventUpcomingDetail::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }
    }

    /**
     * Create new event upcoming detail
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sort_order' => 'required|integer|min:1|max:10',
            'key' => 'required|string|max:255|unique:event_upcoming_details,key',
            'image_url' => 'nullable|url|max:500',
            'alt_text' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_locked' => 'boolean',
            'link' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $event = EventUpcomingDetail::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update event upcoming detail
     */
    public function update(Request $request, $id)
    {
        $event = EventUpcomingDetail::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'sort_order' => 'required|integer|min:1|max:10',
            'key' => 'required|string|max:255|unique:event_upcoming_details,key,' . $id,
            'image_url' => 'nullable|url|max:500',
            'alt_text' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_locked' => 'boolean',
            'link' => 'required|string|max:255'
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
                'message' => 'Event updated successfully',
                'data' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete event upcoming detail
     */
    public function destroy($id)
    {
        try {
            $event = EventUpcomingDetail::findOrFail($id);
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting event: ' . $e->getMessage()
            ], 500);
        }
    }
}