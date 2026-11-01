<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollaborationRequestController extends Controller
{
    /**
     * Create a Brand Deal request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'brand_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'collaboration_type' => ['required', 'in:brand'],
            'email' => ['required', 'email', 'max:255'],
            'instagram_or_website' => ['nullable', 'string', 'max:2048'],
            'type_of_promotion' => ['required', 'string', 'max:255'],
            'campaign_goal' => ['required', 'string'],
            'budget_range' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string'],
            'commercial_inquiry' => ['required', 'boolean'],
            'review_status' => ['sometimes', 'integer', 'in:0,1,2'],
        ]);

        /*
         * Transaction purpose: Ensure the Brand Deal creation is completed
         * atomically. If the database operation fails, all changes made
         * within this transaction are rolled back.
         */
        try {
            DB::beginTransaction();

            $collaboration = CollaborationRequest::create([
                ...$validated,
                'status' => 1,
                'review_status' => $validated['review_status'] ?? 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Brand Deal created successfully.',
                'data' => $collaboration,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Display collaboration requests.
     */
    public function index(Request $request)
    {
        try {
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
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Display one collaboration request.
     */
    public function show($id)
    {
        try {
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
        } catch (\Throwable $e) {
            throw $e;
        }
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

        /*
         * Transaction purpose: Ensure all changes to the Brand Deal are
         * committed together. If the update fails, the database changes
         * are rolled back to preserve the previous record state.
         */
        try {
            DB::beginTransaction();

            $collaboration = CollaborationRequest::find($id);

            if (!$collaboration) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Collaboration request not found.',
                ], 404);
            }

            $collaboration->fill($validated);
            $collaboration->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Brand Deal updated successfully.',
                'data' => $collaboration,
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
        /*
         * Transaction purpose: Ensure the status update is completed as
         * one atomic database operation. If saving the updated status
         * fails, the transaction is rolled back.
         */
        try {
            DB::beginTransaction();

            $collaboration = CollaborationRequest::find($id);

            if (!$collaboration) {
                DB::rollBack();

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

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully.',
                'data' => $collaboration,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Update review status.
     */
    public function updateReviewStatus(Request $request, $id)
    {
        /*
         * Transaction purpose: Ensure the review status change is completed
         * atomically. If the database update fails, the transaction is
         * rolled back so the existing review status remains unchanged.
         */
        try {
            DB::beginTransaction();

            $collaboration = CollaborationRequest::find($id);

            if (!$collaboration) {
                DB::rollBack();

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

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Review status updated successfully.',
                'data' => $collaboration,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }
}