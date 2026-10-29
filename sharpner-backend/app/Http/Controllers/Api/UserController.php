<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get all users.
     */
    public function index(Request $request)
    {
        $query = DB::table('users');

        // Active / inactive filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', (int) $request->status);
        }

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('phone_number', 'like', '%' . $search . '%');
            });
        }

        $users = $query
            ->select([
                'id',
                'name',
                'username',
                'email',
                'phone_number',
                'whatsapp_number',
                'user_type',
                'status',
                'created_at',
                'updated_at',
            ])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Users fetched successfully.',
            'data' => $users,
        ]);
    }

    /**
     * Get a single user.
     */
    public function show($id)
    {
        $user = DB::table('users')
            ->select([
                'id',
                'name',
                'username',
                'email',
                'phone_number',
                'whatsapp_number',
                'user_type',
                'status',
                'created_at',
                'updated_at',
            ])
            ->where('id', $id)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User fetched successfully.',
            'data' => $user,
        ]);
    }

    /**
     * Activate / deactivate user.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = DB::table('users')
            ->where('id', $id)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        DB::table('users')
            ->where('id', $id)
            ->update([
                'status' => $request->boolean('status') ? 1 : 0,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
        ]);
    }
}