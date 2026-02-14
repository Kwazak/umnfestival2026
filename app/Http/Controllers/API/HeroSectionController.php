<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroSectionController extends Controller
{
    // Public: get single hero (first/default)
    public function index(): JsonResponse
    {
        $hero = HeroSection::getDefault();
        return response()->json([
            'success' => true,
            'data' => $hero,
        ]);
    }

    // Admin: get single hero (for edit form)
    public function admin(): JsonResponse
    {
        $hero = HeroSection::getDefault();
        return response()->json([
            'success' => true,
            'data' => $hero,
        ]);
    }

    // Admin: update only (no create; we always update first/default)
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_text' => 'required|string|max:255',
            'event_text_line1' => 'required|string|max:255',
            'event_text_line2' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $hero = HeroSection::getDefault();
        $hero->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hero section updated',
            'data' => $hero->fresh(),
        ]);
    }
}
