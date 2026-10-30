<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthTest extends TestCase
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
            $table->unsignedBigInteger('user_role_id')->nullable();
            $table->string('name');
            $table->string('username')->nullable()->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('user_type')->nullable();
            $table->boolean('status')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
    }

    public function test_admin_can_login_refresh_session_and_logout(): void
    {
        DB::table('users')->insert([
            'name' => 'Admin User',
            'username' => 'admin-user',
            'email' => 'admin@example.test',
            'password' => Hash::make('secure-password'),
            'user_type' => '00',
            'status' => 1,
        ]);

        $origin = ['Origin' => 'http://localhost:5173'];

        $this->withHeaders($origin)
            ->postJson('/api/auth/login', [
                'username' => 'admin-user',
                'password' => 'secure-password',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonMissingPath('user.password');

        $this->withHeaders($origin)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.username', 'admin-user');

        $this->withHeaders($origin)
            ->postJson('/api/auth/logout')
            ->assertOk();

        Auth::forgetGuards();
        $this->withHeaders($origin)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_invalid_inactive_and_non_admin_accounts_are_rejected_generically(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Inactive Admin',
                'username' => 'inactive-admin',
                'email' => 'inactive@example.test',
                'password' => Hash::make('secure-password'),
                'user_type' => 'admin',
                'status' => 0,
            ],
            [
                'name' => 'Regular User',
                'username' => 'regular-user',
                'email' => 'regular@example.test',
                'password' => Hash::make('secure-password'),
                'user_type' => 'member',
                'status' => 1,
            ],
        ]);

        foreach ([
            ['username' => 'missing-user', 'password' => 'secure-password'],
            ['username' => 'inactive-admin', 'password' => 'secure-password'],
            ['username' => 'regular-user', 'password' => 'secure-password'],
            ['username' => 'regular-user', 'password' => 'wrong-password'],
        ] as $credentials) {
            $this->postJson('/api/auth/login', $credentials)
                ->assertUnauthorized()
                ->assertJsonPath('message', 'Invalid username or password.');
        }
    }

    public function test_admin_data_endpoints_reject_unauthenticated_requests(): void
    {
        $this->getJson('/api/tickets')->assertUnauthorized();
        $this->getJson('/api/tickets/1')->assertUnauthorized();
        $this->getJson('/api/users')->assertUnauthorized();
        $this->putJson('/api/users/1', [])->assertUnauthorized();
        $this->getJson('/api/auditions')->assertUnauthorized();
        $this->getJson('/api/admin/videos')->assertUnauthorized();
        $this->putJson('/api/admin/videos/1', [])->assertUnauthorized();
        $this->postJson('/api/admin/auditions', [])->assertUnauthorized();
        $this->postJson('/api/admin/dhol-pathaks', [])->assertUnauthorized();
        $this->postJson('/api/admin/creative-ideas', [])->assertUnauthorized();
        $this->postJson('/api/admin/collaborations', [])->assertUnauthorized();
        $this->postJson('/api/talent-shows', [])->assertUnauthorized();
    }
}
