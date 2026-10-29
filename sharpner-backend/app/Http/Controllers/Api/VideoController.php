<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VideoController extends Controller
{
    /**
     * Display all videos and shorts.
     *
     * GET /api/videos
     */
    public function index(Request $request)
    {
        $query = Video::query();

        // Filter by type: video or short.
        if ($request->filled('type')) {
            $request->validate([
                'type' => ['required', Rule::in(['video', 'short'])],
            ]);

            $query->where('type', $request->type);
        }

        // Filter by platform: YouTube or Instagram.
        if ($request->filled('platform')) {
            $request->validate([
                'platform' => [
                    'required',
                    Rule::in(['youtube', 'instagram']),
                ],
            ]);

            $query->where('platform', $request->platform);
        }

        // Show only active videos unless status is explicitly supplied.
        if ($request->filled('status')) {
            $request->validate([
                'status' => ['required', 'boolean'],
            ]);

            $query->where('status', $request->boolean('status'));
        } else {
            $query->where('status', 1);
        }

        $videos = $query
            ->orderBy('display_order')
            ->orderByDesc('id')
            ->paginate(12);

        return response()->json($videos);
    }

    /**
     * Display a single video.
     *
     * GET /api/videos/{id}
     */
    public function show($id)
    {
        $video = Video::findOrFail($id);

        return response()->json($video);
    }

    /**
     * Create a video.
     *
     * POST /api/videos
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'video_url' => ['required', 'string'],
            'video_id' => ['required', 'string', 'max:255'],
            'platform' => [
                'required',
                Rule::in(['youtube', 'instagram']),
            ],
            'type' => [
                'required',
                Rule::in(['video', 'short']),
            ],
            'thumbnail' => ['nullable', 'string'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
            'updated_by_id' => ['nullable', 'integer'],
        ]);

        $video = Video::create($validated);

        return response()->json([
            'message' => 'Video created successfully.',
            'data' => $video,
        ], 201);
    }

    /**
     * Update a video.
     *
     * PUT /api/videos/{id}
     */
    public function update(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'video_url' => ['sometimes', 'required', 'string'],
            'video_id' => ['sometimes', 'required', 'string', 'max:255'],
            'platform' => [
                'sometimes',
                'required',
                Rule::in(['youtube', 'instagram']),
            ],
            'type' => [
                'sometimes',
                'required',
                Rule::in(['video', 'short']),
            ],
            'thumbnail' => ['sometimes', 'nullable', 'string'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
            'updated_by_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        $video->update($validated);

        return response()->json([
            'message' => 'Video updated successfully.',
            'data' => $video->fresh(),
        ]);
    }

    /**
     * Delete a video.
     *
     * DELETE /api/videos/{id}
     */
    public function destroy($id)
    {
        $video = Video::findOrFail($id);

        $video->delete();

        return response()->json([
            'message' => 'Video deleted successfully.',
        ]);
    }
}