<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
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
        try {
            return $this->videosResponse($request, false);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    public function adminIndex(Request $request)
    {
        try {
            return $this->videosResponse($request, true);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    private function videosResponse(Request $request, bool $allowStatusFilter)
    {
        try {
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
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Display a single video for the admin interface.
     *
     * GET /api/admin/videos/{id}
     */
    public function show($id)
    {
        try {
            $video = Video::findOrFail($id);

            return response()->json($video);
        } catch (\Throwable $e) {
            throw $e;
        }
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

        /*
         * Transaction purpose: Ensure the video creation is completed atomically
         * so the database change is fully committed or rolled back if an exception occurs.
         */
        try {
            DB::beginTransaction();

            $video = Video::create($validated);

            DB::commit();

            return response()->json([
                'message' => 'Video created successfully.',
                'data' => $video,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a video.
     *
     * PUT /api/admin/videos/{id}
     */
    public function update(Request $request, $id)
    {
        try {
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

            /*
             * Transaction purpose: Ensure the video update is completed atomically
             * so all database changes are committed together or rolled back on exception.
             */
            DB::beginTransaction();

            $video->update($validated);

            $updatedVideo = $video->fresh();

            DB::commit();

            return response()->json([
                'message' => 'Video updated successfully.',
                'data' => $updatedVideo,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a video.
     *
     * DELETE /api/videos/{id}
     */
    public function destroy($id)
    {
        try {
            $video = Video::findOrFail($id);

            /*
             * Transaction purpose: Ensure the video deletion is committed atomically
             * and rolled back if the database deletion fails.
             */
            DB::beginTransaction();

            $video->delete();

            DB::commit();

            return response()->json([
                'message' => 'Video deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
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