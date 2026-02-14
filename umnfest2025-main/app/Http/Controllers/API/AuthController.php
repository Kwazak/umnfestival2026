<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login user and create API token
     */
    public function login(Request $request)
    {
        // Check if this is a ticket purchase login (name, email, phone)
        if ($request->has('name') && $request->has('email') && $request->has('phone')) {
            return $this->ticketPurchaseLogin($request);
        }

        // Regular login with email and password
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create token with user's role as ability
        $token = $user->createToken('api-token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]
        ], 200);
    }

    /**
     * Logout user and revoke API token
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Get authenticated user information
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]
        ], 200);
    }

    /**
     * Handle login/registration for ticket purchase
     * Creates a temporary token without creating a user
     */
    public function ticketPurchaseLogin(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
            ]);

            // Create a temporary token without creating a user
            // This token will be used only for the purchase session
            $token = Str::random(60);
            
            // Store the purchase data in cache for 24 hours
            cache()->put('purchase_token_' . $token, [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'created_at' => now()
            ], now()->addDay());

            return response()->json([
                'success' => true,
                'message' => 'Purchase session created',
                'data' => [
                    'user' => [
                        'id' => 0, // Temporary ID for compatibility
                        'name' => $request->name,
                        'email' => $request->email,
                        'phone' => $request->phone,
                        'role' => 'guest',
                    ],
                    'token' => $token,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
