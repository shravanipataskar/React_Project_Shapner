<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Tests\TestCase;

class VideoTitleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
            'database.connections.sqlite.foreign_key_constraints' => false,
        ]);
        DB::purge('sqlite');
        DB::setDefaultConnection('sqlite');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('user_type')->default('admin');
            $table->boolean('status')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('video_url');
            $table->string('video_id');
            $table->string('platform');
            $table->string('type');
            $table->text('thumbnail')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });

        $adminId = DB::table('users')->insertGetId([
            'name' => 'Admin User',
            'email' => 'admin@example.test',
            'password' => Hash::make('secure-admin-password'),
            'user_type' => 'admin',
            'status' => 1,
        ]);
        $this->actingAs(User::findOrFail($adminId), 'web');
    }

    public function test_youtube_title_is_fetched_and_saved_from_oembed(): void
    {
        Http::fake([
            'www.youtube.com/oembed*' => Http::response([
                'title' => 'Saved YouTube title',
            ]),
        ]);

        $response = $this->postJson('/api/admin/videos', [
            'video_url' => 'https://youtu.be/abc123',
            'video_id' => 'abc123',
            'platform' => 'youtube',
            'type' => 'video',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Saved YouTube title');

        $this->assertDatabaseHas('videos', [
            'video_id' => 'abc123',
            'title' => 'Saved YouTube title',
        ]);

        Http::assertSentCount(1);
    }

    public function test_instagram_keeps_its_submitted_title_without_oembed_lookup(): void
    {
        Http::fake();

        $response = $this->postJson('/api/admin/videos', [
            'title' => 'Instagram clip title',
            'video_url' => 'https://www.instagram.com/reel/abc123/',
            'video_id' => 'abc123',
            'platform' => 'instagram',
            'type' => 'short',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Instagram clip title');

        Http::assertNothingSent();
    }

    public function test_youtube_uses_a_fallback_when_oembed_has_no_title(): void
    {
        Http::fake([
            'www.youtube.com/oembed*' => Http::response([], 503),
        ]);

        $response = $this->postJson('/api/admin/videos', [
            'video_url' => 'https://www.youtube.com/watch?v=abc123',
            'video_id' => 'abc123',
            'platform' => 'youtube',
            'type' => 'short',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Untitled video');
    }

    public function test_public_video_feed_never_returns_inactive_videos(): void
    {
        DB::table('videos')->insert([
            [
                'title' => 'Active video',
                'video_url' => 'https://youtu.be/active',
                'video_id' => 'active',
                'platform' => 'youtube',
                'type' => 'video',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Inactive video',
                'video_url' => 'https://youtu.be/inactive',
                'video_id' => 'inactive',
                'platform' => 'youtube',
                'type' => 'video',
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->getJson('/api/videos?status=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Active video');
    }
}
