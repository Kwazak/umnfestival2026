<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ArchiveVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArchiveVideoController extends Controller
{
    /**
     * Get all archive videos
     */
    public function index()
    {
        try {
            $videos = ArchiveVideo::active()->ordered()->get();
            
            $formattedVideos = $videos->map(function ($video) {
                return $video->formatted_data;
            });

            return response()->json([
                'success' => true,
                'data' => $formattedVideos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archive videos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific archive video
     */
    public function show($id)
    {
        try {
            $video = ArchiveVideo::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $video
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Archive video not found'
            ], 404);
        }
    }

    /**
     * Create new archive video
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'thumbnail_url' => 'nullable|url|max:500',
            'video_id' => 'required|string|max:50',
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
            $video = ArchiveVideo::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Archive video created successfully',
                'data' => $video
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating archive video: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update archive video
     */
    public function update(Request $request, $id)
    {
        $video = ArchiveVideo::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'thumbnail_url' => 'nullable|url|max:500',
            'video_id' => 'required|string|max:50',
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
            $video->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Archive video updated successfully',
                'data' => $video
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating archive video: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete archive video
     */
    public function destroy($id)
    {
        try {
            $video = ArchiveVideo::findOrFail($id);
            $video->delete();

            return response()->json([
                'success' => true,
                'message' => 'Archive video deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting archive video: ' . $e->getMessage()
            ], 500);
        }
    }
}