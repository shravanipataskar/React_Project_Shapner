<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DholPathak;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DholPathakController extends Controller
{
    /**
     * Display paginated Dhol Pathak applications.
     */
    public function index(Request $request)
    {
        try {
            $query = DholPathak::query();

            // Active = 1, Inactive = 0.
            if ($request->has('status') && $request->status !== '') {
                $query->where(
                    'status',
                    (int) $request->input('status')
                );
            }

            // Search by applicant name, parent name, city or mobile.
            if ($request->filled('search')) {
                $search = trim($request->input('search'));

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('full_name', 'LIKE', "%{$search}%")
                        ->orWhere('parent_name', 'LIKE', "%{$search}%")
                        ->orWhere('mobile_number', 'LIKE', "%{$search}%")
                        ->orWhere('city', 'LIKE', "%{$search}%");
                });
            }

            // Return the latest applications first.
            $applications = $query
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString();

            return response()->json($applications);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Display a single application.
     */
    public function show($id)
    {
        try {
            $application = DholPathak::findOrFail($id);

            return response()->json($application);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Create a new application.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'age_group' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
            'school_college_name' => 'nullable|string|max:255',
            'previous_dhol_experience' => 'nullable|string|max:255',
            'can_bring_instrument' => 'nullable|string|max:255',
            'medical_conditions' => 'nullable|string',
            'preferred_location' => 'nullable|string|max:255',
            'emergency_contact' => 'required|string|max:255',
            'available_practice_days' => 'nullable|string',
            'weekly_availability' => 'nullable|string|max:255',
            'declaration_pune' => 'sometimes|boolean',
            'declaration_discipline' => 'sometimes|boolean',
            'declaration_physical' => 'sometimes|boolean',
            'declaration_true' => 'sometimes|boolean',
            'digital_signature' => 'required|string|max:255',
            'signature_date' => 'required|date',
            'status' => 'sometimes|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $data['status'] = $data['status'] ?? 1;

        /*
         * Transaction purpose: Ensure the new Dhol Pathak application is
         * created atomically. If the database insert fails, the transaction
         * is rolled back so no incomplete database operation is retained.
         */
        try {
            DB::beginTransaction();

            $application = DholPathak::create($data);

            DB::commit();

            return response()->json([
                'message' => 'Dhol Pathak application created successfully.',
                'data' => $application,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Update an application.
     */
    public function update(Request $request, $id)
    {
        /*
         * Transaction purpose: Ensure the Dhol Pathak application update is
         * completed atomically. If the database update fails, all changes
         * made during the transaction are rolled back.
         */
        try {
            DB::beginTransaction();

            $application = DholPathak::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'age_group' => 'sometimes|required|string|max:255',
                'full_name' => 'sometimes|required|string|max:255',
                'parent_name' => 'sometimes|required|string|max:255',
                'mobile_number' => 'sometimes|required|string|max:255',
                'city' => 'sometimes|required|string|max:255',
                'address' => 'nullable|string',
                'school_college_name' => 'nullable|string|max:255',
                'previous_dhol_experience' => 'nullable|string|max:255',
                'can_bring_instrument' => 'nullable|string|max:255',
                'medical_conditions' => 'nullable|string',
                'preferred_location' => 'nullable|string|max:255',
                'emergency_contact' => 'sometimes|required|string|max:255',
                'available_practice_days' => 'nullable|string',
                'weekly_availability' => 'nullable|string|max:255',
                'declaration_pune' => 'sometimes|boolean',
                'declaration_discipline' => 'sometimes|boolean',
                'declaration_physical' => 'sometimes|boolean',
                'declaration_true' => 'sometimes|boolean',
                'digital_signature' => 'sometimes|required|string|max:255',
                'signature_date' => 'sometimes|required|date',
                'status' => 'sometimes|required|in:0,1',
            ]);

            if ($validator->fails()) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $application->update($validator->validated());

            DB::commit();

            return response()->json([
                'message' => 'Dhol Pathak application updated successfully.',
                'data' => $application->fresh(),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Delete an application.
     */
    public function destroy($id)
    {
        /*
         * Transaction purpose: Ensure the Dhol Pathak application deletion
         * is completed atomically. If the delete operation fails, the
         * transaction is rolled back and the existing record is preserved.
         */
        try {
            DB::beginTransaction();

            $application = DholPathak::findOrFail($id);

            $application->delete();

            DB::commit();

            return response()->json([
                'message' => 'Dhol Pathak application deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
    }
}