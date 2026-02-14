<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AdminPasswordController extends Controller
{
    /**
     * Show change password form
     */
    public function showChangePassword()
    {
        return inertia('Admin/ChangePassword', [
            'auth' => [
                'user' => session('admin_user')
            ]
        ]);
    }

    /**
     * Handle password change
     */
    public function changePassword(Request $request)
    {
        // Rate limiting for password change attempts
        $key = 'admin_password_change_' . session('admin_user.id') . '_' . $request->ip();
        $attempts = cache()->get($key, 0);
        
        if ($attempts >= 3) {
            throw ValidationException::withMessages([
                'current_password' => ['Too many password change attempts. Please try again in 30 minutes.'],
            ]);
        }

        // Validate input with very strict password rules
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(3), // Check against known data breaches
            ],
            'new_password_confirmation' => ['required', 'string'],
        ], [
            'new_password.min' => 'Password must be at least 12 characters long.',
            'new_password.letters' => 'Password must contain at least one letter.',
            'new_password.mixed_case' => 'Password must contain both uppercase and lowercase letters.',
            'new_password.numbers' => 'Password must contain at least one number.',
            'new_password.symbols' => 'Password must contain at least one symbol.',
            'new_password.uncompromised' => 'This password has been found in data breaches and cannot be used.',
            'new_password.confirmed' => 'Password confirmation does not match.',
        ]);

        // Get current admin user
        $adminUser = User::find(session('admin_user.id'));
        
        if (!$adminUser || $adminUser->role !== 'admin') {
            // Log suspicious activity
            Log::warning('Unauthorized password change attempt', [
                'session_user_id' => session('admin_user.id'),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            // Clear session and redirect to login
            session()->forget(['admin_logged_in', 'admin_user']);
            return redirect()->route('admin.login')->withErrors([
                'general' => 'Session expired. Please login again.'
            ]);
        }

        // Verify current password
        if (!Hash::check($validated['current_password'], $adminUser->password)) {
            // Increment failed attempts
            cache()->put($key, $attempts + 1, now()->addMinutes(30));
            
            Log::warning('Failed password change attempt - wrong current password', [
                'user_id' => $adminUser->id,
                'email' => $adminUser->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        // Additional security: Check if new password is same as current
        if (Hash::check($validated['new_password'], $adminUser->password)) {
            throw ValidationException::withMessages([
                'new_password' => ['New password must be different from current password.'],
            ]);
        }

        // Additional security: Check password complexity manually
        if (!$this->isPasswordComplex($validated['new_password'])) {
            throw ValidationException::withMessages([
                'new_password' => ['Password does not meet complexity requirements. Must contain uppercase, lowercase, numbers, symbols, and be at least 12 characters.'],
            ]);
        }

        // Update password
        $adminUser->update([
            'password' => Hash::make($validated['new_password']),
            'updated_at' => now(),
        ]);

        // Clear failed attempts
        cache()->forget($key);

        // Log successful password change
        Log::info('Admin password changed successfully', [
            'user_id' => $adminUser->id,
            'email' => $adminUser->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString()
        ]);

        // Update session data
        session([
            'admin_user' => [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
                'role' => $adminUser->role,
                'phone' => $adminUser->phone,
            ]
        ]);

        return redirect()->route('admin.change-password')->with('success', 'Password changed successfully!');
    }

    /**
     * Additional password complexity check
     */
    private function isPasswordComplex(string $password): bool
    {
        // Must be at least 12 characters
        if (strlen($password) < 12) {
            return false;
        }

        // Must contain uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            return false;
        }

        // Must contain lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            return false;
        }

        // Must contain number
        if (!preg_match('/[0-9]/', $password)) {
            return false;
        }

        // Must contain special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            return false;
        }

        // Must not contain common patterns
        $commonPatterns = [
            '/123456/',
            '/password/i',
            '/admin/i',
            '/qwerty/i',
            '/abc/i',
            '/111111/',
            '/000000/',
        ];

        foreach ($commonPatterns as $pattern) {
            if (preg_match($pattern, $password)) {
                return false;
            }
        }

        // Must not be too repetitive
        if ($this->isRepetitive($password)) {
            return false;
        }

        return true;
    }

    /**
     * Check if password is too repetitive
     */
    private function isRepetitive(string $password): bool
    {
        // Check for repeated characters (more than 3 in a row)
        if (preg_match('/(.)\1{3,}/', $password)) {
            return true;
        }

        // Check for sequential patterns
        $sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            '0123456789',
            'qwertyuiopasdfghjklzxcvbnm',
            'QWERTYUIOPASDFGHJKLZXCVBNM'
        ];

        foreach ($sequences as $sequence) {
            for ($i = 0; $i <= strlen($sequence) - 4; $i++) {
                $substr = substr($sequence, $i, 4);
                if (strpos($password, $substr) !== false) {
                    return true;
                }
            }
        }

        return false;
    }
}