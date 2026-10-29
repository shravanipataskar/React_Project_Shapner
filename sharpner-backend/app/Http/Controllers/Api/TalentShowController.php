<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TalentShow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TalentShowController extends Controller
{
    /**
     * Return paginated Talent Show applications.
     */
    public function index(Request $request)
    {
        $query = TalentShow::query();

        // Filter active or inactive applications.
        if ($request->has('status')) {
            $status = strtolower($request->query('status'));

            if ($status === 'active') {
                $query->where('status', 1);
            } elseif ($status === 'inactive') {
                $query->where('status', 0);
            }
        }

        // Search child name, parent name, age, city and contact number.
        if ($request->filled('search')) {
            $search = $request->query('search');

            $query->where(function ($q) use ($search) {
                $q->where('child_name', 'like', '%' . $search . '%')
                    ->orWhere('parent_name', 'like', '%' . $search . '%')
                    ->orWhere('age', 'like', '%' . $search . '%')
                    ->orWhere('city', 'like', '%' . $search . '%')
                    ->orWhere('contact_number', 'like', '%' . $search . '%');
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate(10)
        );
    }

    /**
     * Return one application.
     */
    public function show($id)
    {
        $application = TalentShow::findOrFail($id);

        return response()->json($application);
    }

    /**
     * Update an application without changing its existing record.
     */
    public function update(Request $request, $id)
    {
        $application = TalentShow::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'child_name' => 'sometimes|required|string|max:255',
            'parent_name' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|required|integer|min:0|max:120',
            'city' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:255',
            'what_makes_unique' => 'nullable|string',
            'talent_description' => 'nullable|string',
            'talent_video' => 'sometimes|file|mimes:mp4,mov,avi|max:512000',
            'social_media' => 'nullable|url|max:2048',
            'declaration_true' => 'sometimes|boolean',
            'declaration_review' => 'sometimes|boolean',
            'declaration_parent_presence' => 'sometimes|boolean',
            'digital_signature' => 'sometimes|required|string|max:255',
            'signature_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('talent_video')) {
            $data['talent_video'] = $request->file('talent_video')
                ->store('talent-videos', 'public');
        }

        $application->update($data);

        return response()->json([
            'message' => 'Talent Show application updated successfully.',
            'data' => $application->fresh(),
        ]);
    }
}
