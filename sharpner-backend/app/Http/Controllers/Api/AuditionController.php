<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditionController extends Controller
{
    /**
     * Display audition applications with search,
     * status filtering, and pagination.
     */
    public function index(Request $request)
    {
        $query = DB::table('child_auditions')
            ->select([
                'child_auditions.id',
                'child_auditions.full_name',
                'child_auditions.age',
                'child_auditions.city',
                'child_auditions.status',
                'child_auditions.application_status',
                'child_auditions.created_at',
            ])
            ->selectSub(function ($subquery) {
                $subquery->from('child_parents')
                    ->select('mobile_number')
                    ->whereColumn(
                        'child_parents.child_id',
                        'child_auditions.id'
                    )
                    ->where('child_parents.status', 1)
                    ->orderBy('child_parents.id')
                    ->limit(1);
            }, 'mobile_number');

        // Active or inactive applications.
        if ($request->has('status')) {
            $status = $request->query('status');

            if (!in_array((string) $status, ['0', '1'], true)) {
                return response()->json([
                    'message' => 'Status must be 0 or 1.',
                ], 422);
            }

            $query->where('child_auditions.status', (int) $status);
        }

        // Search by applicant name, city, or parent mobile number.
        $search = trim((string) $request->query('search', ''));

        if ($search !== '') {
            $query->where(function ($subquery) use ($search) {
                $subquery
                    ->where(
                        'child_auditions.full_name',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'child_auditions.city',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhereExists(function ($parentQuery) use ($search) {
                        $parentQuery->select(DB::raw(1))
                            ->from('child_parents')
                            ->whereColumn(
                                'child_parents.child_id',
                                'child_auditions.id'
                            )
                            ->where(
                                'child_parents.mobile_number',
                                'like',
                                '%' . $search . '%'
                            );
                    });
            });
        }

        // Most recent applications first.
        $query->orderByDesc('child_auditions.id');

        $perPage = 10;

        $auditions = $query->paginate($perPage);

        return response()->json($auditions);
    }

    /**
     * Display one audition application.
     */
    public function show($id)
    {
        $audition = DB::table('child_auditions')
            ->select([
                'child_auditions.*',
            ])
            ->selectSub(function ($subquery) {
                $subquery->from('child_parents')
                    ->select('mobile_number')
                    ->whereColumn(
                        'child_parents.child_id',
                        'child_auditions.id'
                    )
                    ->where('child_parents.status', 1)
                    ->orderBy('child_parents.id')
                    ->limit(1);
            }, 'mobile_number')
            ->where('child_auditions.id', $id)
            ->first();

        if (!$audition) {
            return response()->json([
                'message' => 'Audition application not found.',
            ], 404);
        }

        return response()->json([
            'data' => $audition,
        ]);
    }

    /**
     * Activate or deactivate an audition application.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $updated = DB::table('child_auditions')
            ->where('id', $id)
            ->update([
                'status' => (int) $validated['status'],
            ]);

        if ($updated === 0) {
            $exists = DB::table('child_auditions')
                ->where('id', $id)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'message' => 'Audition application not found.',
                ], 404);
            }
        }

        return response()->json([
            'message' => $validated['status']
                ? 'Audition activated successfully.'
                : 'Audition deactivated successfully.',
            'data' => [
                'id' => $id,
                'status' => (int) $validated['status'],
            ],
        ]);
    }
}