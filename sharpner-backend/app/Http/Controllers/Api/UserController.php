<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Return user types already configured in the database.
     */
    public function createOptions()
    {
        $userTypes = DB::table('user_roles')
            ->where('status', 1)
            ->whereNotNull('user_type')
            ->distinct()
            ->orderBy('user_type')
            ->pluck('user_type');

        if ($userTypes->isEmpty()) {
            $userTypes = DB::table('users')
                ->whereNotNull('user_type')
                ->distinct()
                ->orderBy('user_type')
                ->pluck('user_type');
        }

        return response()->json([
            'data' => [
                'user_types' => $userTypes,
            ],
        ]);
    }

    /**
     * Create a user using the existing users table.
     */
    public function store(Request $request)
    {
        $userTypes = DB::table('user_roles')
            ->where('status', 1)
            ->whereNotNull('user_type')
            ->distinct()
            ->pluck('user_type');

        if ($userTypes->isEmpty()) {
            $userTypes = DB::table('users')
                ->whereNotNull('user_type')
                ->distinct()
                ->pluck('user_type');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:255'],
            'user_type' => ['required', 'string', 'max:255', Rule::in($userTypes->all())],
        ]);

        $roleId = DB::table('user_roles')
            ->where('status', 1)
            ->where('user_type', $validated['user_type'])
            ->value('id');

        $userId = DB::table('users')->insertGetId([
            'user_role_id' => $roleId,
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'whatsapp_number' => $validated['whatsapp_number'] ?? null,
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['user_type'],
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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
            ])
            ->where('id', $userId)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

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
     * Update an existing user and optionally replace their password.
     */
    public function update(Request $request, $id)
    {
        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $userTypes = DB::table('user_roles')
            ->where('status', 1)
            ->whereNotNull('user_type')
            ->distinct()
            ->pluck('user_type');

        if ($userTypes->isEmpty()) {
            $userTypes = DB::table('users')
                ->whereNotNull('user_type')
                ->distinct()
                ->pluck('user_type');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($id),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($id),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:255'],
            'user_type' => ['required', 'string', 'max:255', Rule::in($userTypes->all())],
            'status' => ['required', 'boolean'],
        ]);

        $roleId = DB::table('user_roles')
            ->where('status', 1)
            ->where('user_type', $validated['user_type'])
            ->value('id');

        $updates = [
            'user_role_id' => $roleId,
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'whatsapp_number' => $validated['whatsapp_number'] ?? null,
            'user_type' => $validated['user_type'],
            'status' => $request->boolean('status') ? 1 : 0,
            'updated_at' => now(),
        ];

        if (!empty($validated['password'])) {
            $updates['password'] = Hash::make($validated['password']);
        }

        DB::table('users')->where('id', $id)->update($updates);

        $updatedUser = DB::table('users')
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

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $updatedUser,
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