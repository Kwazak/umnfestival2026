<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EventPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventPageController extends Controller
{
    // Public: get event page data by name
    public function show(string $pageName): JsonResponse
    {
        $page = EventPage::getByName($pageName);
        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    // Admin: get all event pages
    public function index(): JsonResponse
    {
        $pages = EventPage::getAllPages();
        return response()->json([
            'success' => true,
            'data' => $pages,
        ]);
    }

    // Admin: get single event page for editing
    public function admin(string $pageName): JsonResponse
    {
        $page = EventPage::getByName($pageName);
        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    // Admin: update event page
    public function update(Request $request, string $pageName): JsonResponse
    {
        // Get all input data without validation
        $data = $request->only([
            'hero_src',
            'paper_src',
            'unveiling_images',
            'sponsor_src',
            'medpar_src',
            'bg_color',
            'image_section_bg',
            'is_active'
        ]);

        $page = EventPage::getByName($pageName);
        $page->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Event page updated successfully',
            'data' => $page->fresh(),
        ]);
    }
}