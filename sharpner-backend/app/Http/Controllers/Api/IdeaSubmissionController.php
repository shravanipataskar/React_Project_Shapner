<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IdeaSubmission;
use Illuminate\Http\Request;

class IdeaSubmissionController extends Controller
{
    /**
     * Display Creative Idea submissions.
     */
    public function index(Request $request)
    {
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
    }

    /**
     * Display one Creative Idea.
     */
    public function show($id)
    {
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
    }

    /**
     * Update active/inactive status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => ['required', 'integer', 'in:0,1'],
        ]);

        $idea = IdeaSubmission::find($id);

        if (!$idea) {
            return response()->json([
                'success' => false,
                'message' => 'Creative idea not found.',
            ], 404);
        }

        $idea->status = (int) $request->status;
        $idea->save();

        return response()->json([
            'success' => true,
            'message' => 'Creative idea status updated successfully.',
            'data' => $idea,
        ]);
    }
}