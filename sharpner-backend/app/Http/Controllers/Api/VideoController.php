<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VideoController extends Controller
{
    /**
     * Display active videos and shorts for the public site.
     *
     * GET /api/videos
     */
    public function index(Request $request)
    {
        return $this->videosResponse($request, false);
    }

    public function adminIndex(Request $request)
    {
        return $this->videosResponse($request, true);
    }

    private function videosResponse(Request $request, bool $allowStatusFilter)
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
        if ($allowStatusFilter && $request->filled('status')) {
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
     * Display a single video for the admin interface.
     *
     * GET /api/admin/videos/{id}
     */
    public function show($id)
    {
        $video = Video::findOrFail($id);

        return response()->json($video);
    }

    /**
     * Create a video.
     *
     * POST /api/admin/videos
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required_if:platform,instagram', 'nullable', 'string', 'max:255'],
            'video_url' => ['required', 'url:http,https'],
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

        if ($validated['platform'] === 'youtube') {
            $validated['title'] = $this->youtubeTitleOrFallback(
                $this->fetchYouTubeTitle($validated['video_url']),
                $validated['title'] ?? null,
            );
        }

        $video = Video::create($validated);

        return response()->json([
            'message' => 'Video created successfully.',
            'data' => $video,
        ], 201);
    }

    /**
     * Update a video.
     *
     * PUT /api/admin/videos/{id}
     */
    public function update(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'video_url' => ['sometimes', 'required', 'url:http,https'],
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

        if (
            ($validated['platform'] ?? $video->platform) === 'youtube' &&
            array_key_exists('video_url', $validated)
        ) {
            $validated['title'] = $this->youtubeTitleOrFallback(
                $this->fetchYouTubeTitle($validated['video_url']),
                $validated['title'] ?? $video->title,
            );
        }

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

    private function fetchYouTubeTitle(string $videoUrl): ?string
    {
        $host = strtolower((string) parse_url($videoUrl, PHP_URL_HOST));
        if (! in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'], true)) {
            return null;
        }

        try {
            $response = Http::acceptJson()
                ->timeout(4)
                ->get('https://www.youtube.com/oembed', [
                    'url' => $videoUrl,
                    'format' => 'json',
                ]);
        } catch (ConnectionException $exception) {
            report($exception);

            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $title = trim((string) $response->json('title'));

        return $title !== '' ? $title : null;
    }

    private function youtubeTitleOrFallback(?string $title, ?string $fallback): string
    {
        $title = trim((string) $title);
        if ($title !== '') {
            return $title;
        }

        $fallback = trim((string) $fallback);

        return $fallback !== '' ? $fallback : 'Untitled video';
    }
}