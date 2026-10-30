<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminUser
{
    public static function isActive(User $user): bool
    {
        if (Schema::hasColumn('users', 'status')) {
            $status = strtolower((string) $user->getAttribute('status'));

            if (!in_array($status, ['1', 'active', 'enabled'], true)) {
                return false;
            }
        }

        if (
            $user->getAttribute('user_role_id') &&
            Schema::hasTable('user_roles') &&
            Schema::hasColumn('user_roles', 'status')
        ) {
            $roleStatus = DB::table('user_roles')
                ->where('id', $user->getAttribute('user_role_id'))
                ->value('status');

            if (
                $roleStatus !== null &&
                !in_array(strtolower((string) $roleStatus), ['1', 'active', 'enabled'], true)
            ) {
                return false;
            }
        }

        return true;
    }

    public static function roleFor(User $user): string
    {
        $userType = trim((string) $user->getAttribute('user_type'));

        if ($userType !== '') {
            $roleValue = strtolower($userType);
            $normalized = preg_replace('/[^a-z]/', '', $roleValue);

            if ($roleValue === '00' || in_array($normalized, ['superadmin', 'superadministrator'], true)) {
                return 'super_admin';
            }

            if (
                $roleValue === '11' ||
                in_array($normalized, ['admin', 'administrator'], true)
            ) {
                return 'admin';
            }

            return $normalized !== '' ? $normalized : 'user';
        }

        $roleNames = [$user->getAttribute('role')];

        if (
            $user->getAttribute('user_role_id') &&
            Schema::hasTable('user_roles') &&
            Schema::hasColumn('user_roles', 'name')
        ) {
            $role = DB::table('user_roles')
                ->where('id', $user->getAttribute('user_role_id'))
                ->value('name');
            array_unshift($roleNames, $role);
        }

        foreach ($roleNames as $roleName) {
            $roleValue = strtolower(trim((string) $roleName));
            $normalized = preg_replace('/[^a-z]/', '', $roleValue);

            if ($roleValue === '00' || in_array($normalized, ['superadmin', 'superadministrator'], true)) {
                return 'super_admin';
            }
        }

        foreach ($roleNames as $roleName) {
            $roleValue = strtolower(trim((string) $roleName));
            $normalized = preg_replace('/[^a-z]/', '', $roleValue);
            if (
                $roleValue === '11' ||
                in_array($normalized, ['admin', 'administrator'], true)
            ) {
                return 'admin';
            }
        }

        foreach ($roleNames as $roleName) {
            $roleValue = strtolower(trim((string) $roleName));
            $normalized = preg_replace('/[^a-z]/', '', $roleValue);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return 'user';
    }

    public static function allows(User $user): bool
    {
        return self::isActive($user) && in_array(
            self::roleFor($user),
            ['admin', 'super_admin'],
            true,
        );
    }

    public static function allowsSuperAdmin(User $user): bool
    {
        return self::isActive($user) && self::roleFor($user) === 'super_admin';
    }
}
