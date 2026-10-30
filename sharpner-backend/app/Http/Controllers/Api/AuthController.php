<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $query = User::query();
        $identifier = $credentials['username'];

        if (Schema::hasColumn('users', 'username')) {
            $query->where('username', $identifier)
                ->orWhere('email', $identifier);
        } else {
            $query->where('email', $identifier);
        }

        $user = $query->first();

        if (
            !$user ||
            !Hash::check($credentials['password'], $user->getAuthPassword()) ||
            !AdminUser::isActive($user)
        ) {
            return response()->json([
                'message' => 'Invalid username or password.',
            ], 401);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        if (!AdminUser::isActive($request->user())) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    private function userPayload(User $user): array
    {
        $username = $user->getAttribute('username') ?: $user->getAttribute('email');

        return [
            'id' => $user->getKey(),
            'name' => $user->getAttribute('name'),
            'username' => $username,
            'email' => $user->getAttribute('email'),
            'role' => AdminUser::roleFor($user),
        ];
    }
}
