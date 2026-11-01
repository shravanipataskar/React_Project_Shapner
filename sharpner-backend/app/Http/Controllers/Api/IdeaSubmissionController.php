<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IdeaSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdeaSubmissionController extends Controller
{
    /**
     * Create a Creative Idea submission.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'reel_idea' => ['required', 'string'],
            'hook_line' => ['required', 'string'],
            'viral_reason' => ['required', 'string'],
            'credit_permission' => ['required', 'boolean'],
        ]);

        /*
         * Transaction purpose: Ensure the Creative Idea creation is completed
         * atomically. If the database operation fails, the transaction is
         * rolled back so an incomplete record is not retained.
         */
        try {
            DB::beginTransaction();

            $idea = IdeaSubmission::create([
                ...$validated,
                'status' => 1,
                'review_status' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Creative idea created successfully.',
                'data' => $idea,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Display Creative Idea submissions.
     */
    public function index(Request $request)
    {
        try {
            $query = IdeaSubmission::query();

            /*
            |--------------------------------------------------------------------------
            | Active / Inactive
            |--------------------------------------------------------------------------
            |
            | status = 1 => Active
            | status = 0 => Inactive
            |
            */
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', (int) $request->status);
            } else {
                // Default to active records
                $query->where('status', 1);
            }

            /*
            |--------------------------------------------------------------------------
            | Search
            |--------------------------------------------------------------------------
            */
            if ($request->filled('search')) {
                $search = trim($request->search);

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('reel_idea', 'like', "%{$search}%")
                        ->orWhere('hook_line', 'like', "%{$search}%")
                        ->orWhere('instagram', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Pagination
            |--------------------------------------------------------------------------
            */
            $perPage = (int) $request->get('per_page', 10);

            // Prevent an excessively large request
            if ($perPage < 1) {
                $perPage = 10;
            }

            if ($perPage > 100) {
                $perPage = 100;
            }

            $ideas = $query
                ->orderByDesc('id')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Creative ideas fetched successfully.',
                'data' => $ideas->items(),
                'pagination' => [
                    'current_page' => $ideas->currentPage(),
                    'last_page' => $ideas->lastPage(),
                    'per_page' => $ideas->perPage(),
                    'total' => $ideas->total(),
                    'from' => $ideas->firstItem(),
                    'to' => $ideas->lastItem(),
                ],
            ]);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Display one Creative Idea.
     */
    public function show($id)
    {
        try {
            $idea = IdeaSubmission::find($id);

            if (!$idea) {
                return response()->json([
                    'success' => false,
                    'message' => 'Creative idea not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Creative idea fetched successfully.',
                'data' => $idea,
            ]);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Update editable Creative Idea submission fields.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'review_status' => ['required', 'integer', 'in:0,1,2'],
            'reel_idea' => ['required', 'string'],
            'hook_line' => ['required', 'string'],
            'viral_reason' => ['required', 'string'],
            'credit_permission' => ['required', 'boolean'],
        ]);

        /*
         * Transaction purpose: Ensure all Creative Idea updates are committed
         * atomically. If the database update fails, the transaction is rolled
         * back so the existing record remains unchanged.
         */
        try {
            DB::beginTransaction();

            $idea = IdeaSubmission::find($id);

            if (!$idea) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Creative idea not found.',
                ], 404);
            }

            $idea->fill($validated);
            $idea->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Creative idea updated successfully.',
                'data' => $idea,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Update active/inactive status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => ['required', 'integer', 'in:0,1'],
        ]);

        /*
         * Transaction purpose: Ensure the Creative Idea status update is
         * completed atomically. If saving the new status fails, the
         * transaction is rolled back and the previous status is preserved.
         */
        try {
            DB::beginTransaction();

            $idea = IdeaSubmission::find($id);

            if (!$idea) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Creative idea not found.',
                ], 404);
            }

            $idea->status = (int) $request->status;
            $idea->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Creative idea status updated successfully.',
                'data' => $idea,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }
}