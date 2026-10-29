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
     * Update editable Brand Deal fields.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'brand_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'collaboration_type' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'instagram_or_website' => ['nullable', 'string', 'max:2048'],
            'type_of_promotion' => ['nullable', 'string', 'max:255'],
            'campaign_goal' => ['nullable', 'string'],
            'budget_range' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
            'commercial_inquiry' => ['required', 'boolean'],
            'review_status' => ['required', 'integer', 'in:0,1,2'],
        ]);

        $collaboration = CollaborationRequest::find($id);

        if (!$collaboration) {
            return response()->json([
                'success' => false,
                'message' => 'Collaboration request not found.',
            ], 404);
        }

        $collaboration->fill($validated);
        $collaboration->save();

        return response()->json([
            'success' => true,
            'message' => 'Brand Deal updated successfully.',
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