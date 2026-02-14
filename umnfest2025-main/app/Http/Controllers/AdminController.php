<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    /**
     * Show admin login form
     */
    public function showLogin()
    {
        return inertia('Auth/AdminLogin');
    }

    /**
     * Handle admin login
     */
    public function login(Request $request)
    {
        // Rate limiting - prevent brute force attacks
        $key = 'admin_login_attempts_' . $request->ip();
        $attempts = cache()->get($key, 0);
        
        if ($attempts >= 5) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in 15 minutes.'],
            ]);
        }

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);

        // Find user by email
        $user = User::where('email', $credentials['email'])->first();

        // Check if user exists and has admin role
        if (!$user || $user->role !== 'admin') {
            // Increment failed attempts
            cache()->put($key, $attempts + 1, now()->addMinutes(15));
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Check password
        if (!Hash::check($credentials['password'], $user->password)) {
            // Increment failed attempts
            cache()->put($key, $attempts + 1, now()->addMinutes(15));
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Clear failed attempts on successful login
        cache()->forget($key);

        // Regenerate session ID to prevent session fixation
        $request->session()->regenerate();

        // Store session data with timestamp
        session([
            'admin_logged_in' => true,
            'admin_login_time' => now(),
            'admin_last_activity' => now(),
            'admin_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
            ]
        ]);

        // Log successful admin login
        \Log::info('Admin login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId()
        ]);

        return redirect()->route('admin.dashboard');
    }

    /**
     * Handle admin logout
     */
    public function logout()
    {
        session()->forget(['admin_logged_in', 'admin_user']);
        return redirect()->route('admin.login');
    }

    /**
     * Show admin dashboard
     */
    public function dashboard()
    {
        return inertia('Admin', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin orders page
     */
    public function orders()
    {
        return inertia('Admin/Orders', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin order detail page
     */
    public function orderDetail($orderId)
    {
        return inertia('Admin/OrderDetail', [
            'orderId' => $orderId,
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin tickets page
     */
    public function tickets()
    {
        return inertia('Admin/Tickets', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin referral codes page
     */
    public function referralCodes()
    {
        return inertia('Admin/ReferralCodes', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin discount codes page
     */
    public function discountCodes()
    {
        return inertia('Admin/DiscountCodes', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin guest stars page
     */
    public function guestStars()
    {
        return inertia('Admin/GuestStars', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin ticket types page
     */
    public function ticketTypes()
    {
        return inertia('Admin/TicketTypes', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin merchandise page
     */
    public function merchandise()
    {
        return inertia('Admin/Merchandise', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin countdown page
     */
    public function countdown()
    {
        return inertia('Admin/Countdown', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin divisions page
     */
    public function divisions()
    {
        return inertia('Admin/Divisions', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin archive page
     */
    public function archive()
    {
        return inertia('Admin/Archive', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin closing section page
     */
    public function closingSection()
    {
        return inertia('Admin/ClosingSection', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin hero section page
     */
    public function heroSection()
    {
        return inertia('Admin/HeroSection', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin scanner page
     */
    public function scanner()
    {
        // Check if scanner is logged in
        $scannerUsername = session('scanner_username');
        
        // If no scanner login, redirect to scanner login page
        if (!$scannerUsername) {
            return redirect('/admin/scanner/login');
        }

        return inertia('Admin/Scanner', [
            'auth' => [
                'user' => session('admin_user'),
                'scanner_username' => $scannerUsername,
                'scanner_logged_in_at' => session('scanner_logged_in_at')
            ]
        ]);
    }

    /**
     * Show admin event pages page
     */
    public function eventPages()
    {
        return inertia('Admin/EventPages', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin chatbot training page
     */
    public function chatbotTraining()
    {
        return inertia('Admin/ChatbotTraining', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin spin management page
     */
    public function spin()
    {
        return inertia('Admin/SpinDashboard', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Show admin email blast composer page
     */
    public function emailBlast()
    {
        return inertia('Admin/EmailBlast', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }
}