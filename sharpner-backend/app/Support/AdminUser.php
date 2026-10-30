<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminUser
{
    public static function allows(User $user): bool
    {
        if (Schema::hasColumn('users', 'status')) {
            $status = strtolower((string) $user->getAttribute('status'));

            if (!in_array($status, ['1', 'active', 'enabled'], true)) {
                return false;
            }
        }

        $roleNames = [
            $user->getAttribute('user_type'),
            $user->getAttribute('role'),
        ];

        if (
            $user->getAttribute('user_role_id') &&
            Schema::hasTable('user_roles') &&
            Schema::hasColumn('user_roles', 'name')
        ) {
            $role = DB::table('user_roles')
                ->where('id', $user->getAttribute('user_role_id'))
                ->first();

            if (
                $role &&
                Schema::hasColumn('user_roles', 'status') &&
                !in_array(strtolower((string) $role->status), ['1', 'active', 'enabled'], true)
            ) {
                return false;
            }

            $roleNames[] = $role->name ?? null;
        }

        foreach ($roleNames as $roleName) {
            $roleValue = strtolower(trim((string) $roleName));
            $normalized = preg_replace('/[^a-z]/', '', $roleValue);

            if (
                $roleValue === '00' ||
                in_array($normalized, ['admin', 'administrator', 'superadmin', 'superadministrator'], true)
            ) {
                return true;
            }
        }

        return false;
    }
}
