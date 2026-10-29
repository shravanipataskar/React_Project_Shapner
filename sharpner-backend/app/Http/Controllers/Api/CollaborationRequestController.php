<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use Illuminate\Http\Request;

class CollaborationRequestController extends Controller
{
    /**
     * Display collaboration requests.
     */
    public function index(Request $request)
    {
        $query = CollaborationRequest::query();

        /*
        |--------------------------------------------------------------------------
        | Brand Deals
        |--------------------------------------------------------------------------
        | This page is "Manage Brand Deals", so we only show requests where
        | collaboration_type = brand.
        |--------------------------------------------------------------------------
        */
        $query->where('collaboration_type', 'brand');

        /*
        |--------------------------------------------------------------------------
        | Active / Inactive
        |--------------------------------------------------------------------------
        */
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('brand_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $collaborations = $query
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Collaboration requests fetched successfully.',
            'data' => $collaborations,
        ]);
    }

    /**
     * Display one collaboration request.
     */
    public function show($id)
    {
        $collaboration = CollaborationRequest::find($id);

        if (!$collaboration) {
            return response()->json([
                'success' => false,
                'message' => 'Collaboration request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Collaboration request fetched successfully.',
            'data' => $collaboration,
        ]);
    }

    /**
     * Update active/inactive status.
     */
    public function updateStatus(Request $request, $id)
    {
        $collaboration = CollaborationRequest::find($id);

        if (!$collaboration) {
            return response()->json([
                'success' => false,
                'message' => 'Collaboration request not found.',
            ], 404);
        }

        $request->validate([
            'status' => 'required|in:0,1',
        ]);

        $collaboration->status = (int) $request->status;
        $collaboration->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully.',
            'data' => $collaboration,
        ]);
    }

    /**
     * Update review status.
     */
    public function updateReviewStatus(Request $request, $id)
    {
        $collaboration = CollaborationRequest::find($id);

        if (!$collaboration) {
            return response()->json([
                'success' => false,
                'message' => 'Collaboration request not found.',
            ], 404);
        }

        $request->validate([
            'review_status' => 'required|integer',
        ]);

        $collaboration->review_status = (int) $request->review_status;
        $collaboration->save();

        return response()->json([
            'success' => true,
            'message' => 'Review status updated successfully.',
            'data' => $collaboration,
        ]);
    }
}