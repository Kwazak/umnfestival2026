<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function getBundleTicket()
    {
        $value = Setting::get('bundle_ticket_enabled', '0');
        return response()->json([
            'success' => true,
            'data' => [ 'enabled' => $value === '1' ]
        ]);
    }

    // Public getter (no auth) - for frontend to check feature flag
    public function publicGetBundleTicket()
    {
        $value = Setting::get('bundle_ticket_enabled', '0');
        return response()->json([
            'success' => true,
            'data' => [ 'enabled' => $value === '1' ]
        ]);
    }

    public function setBundleTicket(Request $request)
    {
        $request->validate([
            'enabled' => 'required|boolean'
        ]);

        Setting::set('bundle_ticket_enabled', $request->enabled ? '1' : '0');

        return response()->json(['success' => true]);
    }
}
