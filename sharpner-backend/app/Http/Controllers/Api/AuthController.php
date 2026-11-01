<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        // Transaction purpose: ensure the authentication-related database
        // operations complete safely as a single unit and can be rolled back
        // if an unexpected database exception occurs.
        try {
            DB::beginTransaction();

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
                DB::rollBack();

                return response()->json([
                    'message' => 'Invalid username or password.',
                ], 401);
            }

            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            DB::commit();

            return response()->json([
                'success' => true,
                'user' => $this->userPayload($user),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Unable to login.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function me(Request $request)
    {
        // Transaction purpose: protect the database read from unexpected
        // database exceptions while preserving the existing authentication flow.
        try {
            DB::beginTransaction();

            if (!AdminUser::isActive($request->user())) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            $response = response()->json([
                'success' => true,
                'user' => $this->userPayload($request->user()),
            ]);

            DB::commit();

            return $response;
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Unable to retrieve authenticated user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        // Transaction purpose: ensure the logout-related authentication
        // operation is handled safely if an unexpected database exception occurs.
        try {
            DB::beginTransaction();

            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Unable to logout.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function userPayload(User $user): array
    {
        $username = $user->getAttribute('username') ?: $user->getAttribute('email');

        return [
            'id' => $user->getKey(),
            'name' => $user->getAttribute('name'),
            'username' => $username,
            'email' => $user->getAttribute('email'),
            'user_type' => $user->getAttribute('user_type'),
            'role' => AdminUser::roleFor($user),
        ];
    }
}