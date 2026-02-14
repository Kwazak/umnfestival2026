<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function showLogin(Request $request)
    {
        // Check if already authenticated
        if ($request->session()->get('leaderboard_authenticated')) {
            return redirect()->route('vanguards.leaderboard');
        }

        return Inertia::render('Vanguards/Login');
    }

    public function authenticate(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        // Simple password check
        if ($request->password === '22112025') {
            $request->session()->put('leaderboard_authenticated', true);
            return redirect()->route('vanguards.leaderboard');
        }

        return back()->withErrors([
            'password' => 'Invalid password. Please try again.',
        ]);
    }

    public function index(Request $request)
    {
        // Check authentication
        if (!$request->session()->get('leaderboard_authenticated')) {
            return redirect()->route('vanguards.login');
        }

        // Get leaderboard data from referral_codes table
        $leaderboard = DB::table('referral_codes')
            ->select('code', 'panitia_name', 'uses as total_uses')
            ->where('is_active', true)
            ->where('uses', '>', 0)
            ->orderBy('uses', 'desc')
            ->get()
            ->map(function($item) {
                $item->successful_uses = $item->total_uses; // For now, count all uses as successful
                return $item;
            });

        // Calculate total uses
        $totalUses = $leaderboard->sum('total_uses');
        
        // Get total active codes count
        $totalActiveCodes = DB::table('referral_codes')
            ->where('is_active', true)
            ->count();

        return Inertia::render('Vanguards/Leaderboard', [
            'leaderboard' => $leaderboard,
            'totalUses' => $totalUses,
            'totalActiveCodes' => $totalActiveCodes,
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('leaderboard_authenticated');
        return redirect()->route('vanguards.login');
    }
}
