<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const MODULE_NAMES = [
        'Auditions',
        'Brand Deals',
        'Creative Ideas',
        'Dhol Pathak',
        'Other',
        'Talent Show',
        'Users',
        'Videos & Shorts',
    ];

    public function up(): void
    {
        $applicationId = DB::table('applications')
            ->where('app_name', 'sharpner')
            ->orderBy('id')
            ->value('id');

        if (!$applicationId) {
            throw new RuntimeException(
                'Cannot add ticket modules because the Sharpner application does not exist.'
            );
        }

        $now = now();

        foreach (self::MODULE_NAMES as $moduleName) {
            $exists = DB::table('modules')
                ->where('application_id', $applicationId)
                ->where('module_name', $moduleName)
                ->exists();

            if (!$exists) {
                DB::table('modules')->insert([
                    'application_id' => $applicationId,
                    'module_name' => $moduleName,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Keep module records because existing tickets may reference them.
    }
};
