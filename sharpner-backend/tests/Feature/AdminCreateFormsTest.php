<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Tests\TestCase;

class AdminCreateFormsTest extends TestCase
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

        $this->createUserTables();
        $this->createAuditionTables();
        $this->createTalentShowTable();
        $this->createCreativeIdeaTable();
        $this->createCollaborationTable();
        $this->createTicketTables();
        $this->createDholPathakTable();

        $superAdminRoleId = DB::table('user_roles')->insertGetId([
            'name' => 'Super Admin',
            'user_type' => null,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $adminId = DB::table('users')->insertGetId([
            'id' => 9999,
            'user_role_id' => $superAdminRoleId,
            'name' => 'Admin User',
            'username' => 'admin-user',
            'email' => 'admin@example.test',
            'password' => Hash::make('secure-admin-password'),
            'user_type' => null,
            'status' => 1,
        ]);
        $this->actingAs(User::findOrFail($adminId), 'web');
    }

    public function test_user_create_uses_database_user_types_and_hashes_password(): void
    {
        DB::table('users')->insert([
            'name' => 'Existing User',
            'email' => 'existing@example.test',
            'password' => Hash::make('existing-password'),
            'user_type' => '00',
            'status' => 1,
        ]);

        $this->getJson('/api/users/options')
            ->assertOk()
            ->assertJsonPath('data.user_types', ['00']);

        $this->postJson('/api/users', [
            'name' => 'New User',
            'username' => 'new-user',
            'email' => 'new@example.test',
            'password' => 'secure-pass-123',
            'password_confirmation' => 'secure-pass-123',
            'phone_number' => '1234567890',
            'whatsapp_number' => '1234567890',
            'user_type' => '00',
        ])->assertCreated()
            ->assertJsonPath('data.user_type', '00');

        $user = DB::table('users')->where('email', 'new@example.test')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('secure-pass-123', $user->password));
    }

    public function test_super_admin_can_update_user_details_and_optionally_change_password(): void
    {
        DB::table('user_roles')->insert([
            'name' => 'Member',
            'user_type' => '11',
            'status' => 1,
        ]);
        $userId = DB::table('users')->insertGetId([
            'name' => 'Old Name',
            'username' => 'old-name',
            'email' => 'old@example.test',
            'password' => Hash::make('old-password'),
            'user_type' => '11',
            'status' => 1,
        ]);

        $this->putJson("/api/users/{$userId}", [
            'name' => 'Updated Name',
            'username' => 'updated-name',
            'email' => 'updated@example.test',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
            'phone_number' => '9876543211',
            'whatsapp_number' => '9876543212',
            'user_type' => '11',
            'status' => 0,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.user_type', '11')
            ->assertJsonPath('data.status', 0)
            ->assertJsonMissingPath('data.password');

        $updatedUser = DB::table('users')->where('id', $userId)->first();
        $this->assertSame('updated-name', $updatedUser->username);
        $this->assertSame('updated@example.test', $updatedUser->email);
        $this->assertSame('9876543211', $updatedUser->phone_number);
        $this->assertTrue(Hash::check('new-secure-password', $updatedUser->password));
    }

    public function test_user_update_preserves_password_when_no_new_password_is_submitted(): void
    {
        $passwordHash = Hash::make('current-password');
        $userId = DB::table('users')->insertGetId([
            'name' => 'Current Name',
            'email' => 'current@example.test',
            'password' => $passwordHash,
            'user_type' => '11',
            'status' => 1,
        ]);

        $this->putJson("/api/users/{$userId}", [
            'name' => 'Updated Name',
            'email' => 'current@example.test',
            'user_type' => '11',
            'status' => 1,
        ])->assertOk();

        $this->assertSame($passwordHash, DB::table('users')->where('id', $userId)->value('password'));
    }

    public function test_audition_create_saves_the_application_and_related_records(): void
    {
        $this->postJson('/api/auditions', $this->auditionPayload())
            ->assertCreated()
            ->assertJsonPath('data.application_status', 'pending');

        $this->assertDatabaseCount('child_auditions', 1);
        $this->assertDatabaseCount('child_parents', 1);
        $this->assertDatabaseCount('child_audition_media', 1);
        $this->assertDatabaseCount('child_languages', 2);
        $this->assertDatabaseCount('child_talents', 1);
        $this->assertDatabaseCount('child_medical_conditions', 1);
        $this->assertDatabaseCount('child_consents', 1);
    }

    public function test_audition_edit_loads_related_fields_and_preserves_them_on_partial_update(): void
    {
        $firstPayload = $this->auditionPayload();
        $firstPayload['other_language'] = 'Sanskrit';
        $firstPayload['other_talent'] = 'Singing';
        $created = $this->postJson('/api/auditions', $firstPayload)
            ->assertCreated();
        $id = $created->json('data.id');
        $secondPayload = $this->auditionPayload();
        $secondPayload['full_name'] = 'Second Applicant';
        $secondPayload['email'] = 'second-parent@example.test';
        $secondCreated = $this->postJson('/api/auditions', $secondPayload)
            ->assertCreated();
        $secondId = $secondCreated->json('data.id');

        $this->getJson("/api/auditions/{$id}")
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Child Applicant')
            ->assertJsonPath('data.parent_name', 'Parent')
            ->assertJsonPath('data.mobile_number', '1234567890')
            ->assertJsonPath('data.closeup_photo', 'https://example.test/closeup')
            ->assertJsonPath('data.languages', ['Marathi', 'English'])
            ->assertJsonPath('data.other_language', 'Sanskrit')
            ->assertJsonPath('data.talents', ['Acting'])
            ->assertJsonPath('data.other_talent', 'Singing')
            ->assertJsonPath('data.medical_details', 'Details')
            ->assertJsonPath('data.consent_information', 1)
            ->assertJsonPath('data.digital_signature', 'Parent')
            ->assertJsonPath('data.signature_date', '2025-01-01');

        $this->putJson("/api/auditions/{$id}", [
            'nickname' => 'Updated Nickname',
        ])->assertOk()
            ->assertJsonPath('data.nickname', 'Updated Nickname')
            ->assertJsonPath('data.full_name', 'Child Applicant')
            ->assertJsonPath('data.city', 'Pune')
            ->assertJsonPath('data.parent_name', 'Parent')
            ->assertJsonPath('data.email', 'parent@example.test')
            ->assertJsonPath('data.closeup_photo', 'https://example.test/closeup')
            ->assertJsonPath('data.languages', ['Marathi', 'English'])
            ->assertJsonPath('data.other_language', 'Sanskrit')
            ->assertJsonPath('data.talents', ['Acting'])
            ->assertJsonPath('data.other_talent', 'Singing')
            ->assertJsonPath('data.medical_details', 'Details')
            ->assertJsonPath('data.digital_signature', 'Parent');

        $this->assertDatabaseHas('child_auditions', [
            'id' => $id,
            'nickname' => 'Updated Nickname',
            'full_name' => 'Child Applicant',
            'city' => 'Pune',
        ]);
        $this->assertDatabaseHas('child_parents', [
            'child_id' => $id,
            'parent_name' => 'Parent',
            'email' => 'parent@example.test',
        ]);
        $this->assertDatabaseHas('child_audition_media', [
            'child_id' => $id,
            'closeup_photo' => 'https://example.test/closeup',
        ]);
        $this->assertDatabaseHas('child_languages', [
            'child_id' => $id,
            'language_name' => 'Sanskrit',
            'status' => 1,
        ]);
        $this->assertDatabaseHas('child_talents', [
            'child_id' => $id,
            'talent_type' => 'Singing',
            'status' => 1,
        ]);

        $this->getJson("/api/auditions/{$secondId}")
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Second Applicant')
            ->assertJsonPath('data.email', 'second-parent@example.test')
            ->assertJsonPath('data.nickname', null);
    }

    public function test_talent_show_create_saves_to_the_existing_table(): void
    {
        Storage::fake('public');

        $response = $this->post('/api/talent-shows', [
            'child_name' => 'Applicant',
            'parent_name' => 'Guardian',
            'age' => 10,
            'city' => 'Pune',
            'contact_number' => '1234567890',
            'what_makes_unique' => 'Creative',
            'talent_description' => 'Singing',
            'social_media' => 'https://example.test/profile',
            'declaration_true' => true,
            'declaration_review' => true,
            'declaration_parent_presence' => true,
            'digital_signature' => 'Guardian',
            'signature_date' => '2025-01-01',
            'talent_video' => UploadedFile::fake()->create(
                'audition.mp4',
                2,
                'video/mp4'
            ),
        ])->assertCreated()
            ->assertJsonPath('data.status', 1);

        $this->assertDatabaseHas('talent_shows', [
            'child_name' => 'Applicant',
            'contact_number' => '1234567890',
            'status' => 1,
        ]);
        Storage::disk('public')->assertExists(
            $response->json('data.talent_video')
        );
    }

    public function test_creative_idea_and_brand_deal_create_use_existing_columns(): void
    {
        $this->postJson('/api/creative-ideas', [
            'name' => 'Idea author',
            'instagram' => '@author',
            'email' => 'idea@example.test',
            'reel_idea' => 'A creative concept',
            'hook_line' => 'A short hook',
            'viral_reason' => 'It is relatable',
            'credit_permission' => true,
        ])->assertCreated()
            ->assertJsonPath('data.review_status', 0);

        $this->assertDatabaseHas('idea_submissions', [
            'name' => 'Idea author',
            'reel_idea' => 'A creative concept',
            'status' => 1,
            'review_status' => 0,
        ]);

        $this->postJson('/api/collaborations', [
            'name' => 'Contact',
            'organization_name' => 'Company',
            'brand_name' => 'Brand',
            'contact_person' => 'Contact Person',
            'collaboration_type' => 'brand',
            'email' => 'brand@example.test',
            'instagram_or_website' => 'https://example.test',
            'type_of_promotion' => 'sponsored_video',
            'campaign_goal' => 'Reach more viewers',
            'budget_range' => '10k-50k',
            'phone_number' => '1234567890',
            'message' => 'Campaign details',
            'commercial_inquiry' => false,
            'review_status' => 0,
        ])->assertCreated()
            ->assertJsonPath('data.review_status', 0);

        $this->assertDatabaseHas('collaboration_requests', [
            'brand_name' => 'Brand',
            'type_of_promotion' => 'sponsored_video',
            'status' => 1,
        ]);
    }

    public function test_ticket_options_and_create_use_supported_choices_and_relations(): void
    {
        $this->seedTicketOptions();
        Storage::fake('public');

        $this->getJson('/api/ticket-options?application_id=1')
            ->assertOk()
            ->assertJsonPath('data.applications.0.app_name', 'Sharpner')
            ->assertJsonPath('data.modules.3.module_name', 'Dhol Pathak')
            ->assertJsonPath('data.categories', ['bug', 'development', 'both'])
            ->assertJsonPath('data.item_types', ['bug', 'development', 'enhancement'])
            ->assertJsonPath('data.priorities', ['low', 'medium', 'high', 'urgent'])
            ->assertJsonPath('data.severities', ['low', 'medium', 'high', 'critical']);

        $this->getJson('/api/ticket-options')
            ->assertOk()
            ->assertJsonCount(9, 'data.modules')
            ->assertJsonFragment(['id' => 2, 'application_id' => 1, 'module_name' => 'Auditions'])
            ->assertJsonFragment(['id' => 8, 'application_id' => 1, 'module_name' => 'Videos & Shorts']);

        $response = $this->post('/api/tickets', [
            'application_id' => 1,
            'module_id' => 1,
            'subject' => 'A ticket subject',
            'category' => 'development',
            'description' => 'Ticket description',
            'attachment' => UploadedFile::fake()->create(
                'ticket.pdf',
                2,
                'application/pdf'
            ),
            'items' => [
                [
                    'title' => 'Ticket item',
                    'item_type' => 'enhancement',
                    'priority' => 'high',
                    'severity' => 'critical',
                    'description' => 'Item description',
                    'attachment' => UploadedFile::fake()->create(
                        'item.pdf',
                        2,
                        'application/pdf'
                    ),
                ],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.ticket_status', 'Open');

        $this->assertDatabaseHas('tickets', [
            'subject' => 'A ticket subject',
            'application_id' => 1,
            'module_id' => 1,
            'user_id' => 9999,
            'category' => 'development',
        ]);
        $ticket = $response->json('data');
        $this->assertNotEmpty($ticket['attachment']);
        Storage::disk('public')->assertExists($ticket['attachment']);

        $ticketItem = DB::table('ticket_items')
            ->where('ticket_id', $ticket['id'])
            ->first();
        $this->assertNotNull($ticketItem);
        $this->assertNotEmpty($ticketItem->attachment);
        Storage::disk('public')->assertExists($ticketItem->attachment);
        $this->assertDatabaseHas('ticket_items', [
            'title' => 'Ticket item',
            'item_type' => 'enhancement',
            'priority' => 'high',
            'severity' => 'critical',
            'ticket_status' => 'Open',
        ]);
        $this->assertMatchesRegularExpression(
            '/^TK-\d{8}-[A-Z0-9]{6}$/',
            $response->json('data.ticket_no')
        );
    }

    public function test_ticket_edit_loads_items_and_updates_without_losing_existing_fields(): void
    {
        $this->seedTicketOptions();
        $item = DB::table('ticket_items')
            ->where('ticket_id', 1)
            ->where('status', 1)
            ->first();

        $this->getJson('/api/tickets/1')
            ->assertOk()
            ->assertJsonPath('data.subject', 'Existing ticket')
            ->assertJsonPath('data.items.0.title', 'Existing item');

        $this->putJson('/api/tickets/1', [
            'application_id' => 1,
            'module_id' => 1,
            'subject' => 'Updated ticket subject',
            'category' => 'development',
            'description' => 'Updated ticket description',
            'items' => [
                [
                    'id' => $item->id,
                    'title' => 'Updated item title',
                    'item_type' => 'enhancement',
                    'priority' => 'high',
                    'severity' => 'critical',
                    'description' => 'Updated item description',
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.subject', 'Updated ticket subject');

        $this->assertDatabaseHas('tickets', [
            'id' => 1,
            'application_id' => 1,
            'module_id' => 1,
            'subject' => 'Updated ticket subject',
            'description' => 'Updated ticket description',
            'category' => 'development',
            'ticket_status' => 'Open',
        ]);
        $this->assertDatabaseHas('ticket_items', [
            'id' => $item->id,
            'ticket_id' => 1,
            'title' => 'Updated item title',
            'item_type' => 'enhancement',
            'priority' => 'high',
            'severity' => 'critical',
            'ticket_status' => 'Open',
            'status' => 1,
        ]);
    }

    public function test_dhol_pathak_create_still_uses_its_existing_endpoint(): void
    {
        $this->postJson('/api/dhol-pathaks', [
            'age_group' => '11-14',
            'full_name' => 'Applicant',
            'parent_name' => 'Guardian',
            'mobile_number' => '1234567890',
            'city' => 'Pune',
            'emergency_contact' => '0987654321',
            'available_practice_days' => '["Monday","Tuesday","Wednesday","Thursday"]',
            'declaration_pune' => true,
            'declaration_discipline' => true,
            'declaration_physical' => true,
            'declaration_true' => true,
            'digital_signature' => 'Guardian',
            'signature_date' => '2025-01-01',
        ])->assertCreated()
            ->assertJsonPath('data.full_name', 'Applicant');

        $this->assertDatabaseHas('dhol_pathaks', [
            'full_name' => 'Applicant',
            'status' => 1,
        ]);
    }

    private function auditionPayload(): array
    {
        return [
            'audition_type' => 'Child Audition',
            'full_name' => 'Child Applicant',
            'date_of_birth' => '2015-01-01',
            'age' => 10,
            'gender' => 'Female',
            'city' => 'Pune',
            'languages' => ['Marathi', 'English'],
            'primary_language' => 'Marathi',
            'parent_name' => 'Parent',
            'relationship' => 'Mother',
            'mobile_number' => '1234567890',
            'email' => 'parent@example.test',
            'parent_city' => 'Pune',
            'emergency_contact' => '0987654321',
            'talents' => ['Acting'],
            'previous_experience' => false,
            'closeup_photo' => 'https://example.test/closeup',
            'full_length_photo' => 'https://example.test/full',
            'audition_video' => 'https://example.test/video',
            'has_medical_condition' => true,
            'has_allergies' => false,
            'on_regular_medication' => false,
            'medical_details' => 'Details',
            'weekly_availability' => '["Weekends"]',
            'preferred_time_slot' => null,
            'outdoor_shoot_comfort' => false,
            'outstation_travel' => null,
            'consent_information' => true,
            'consent_media_use' => true,
            'consent_promotion' => true,
            'consent_safety_rules' => true,
            'consent_selection_process' => true,
            'consent_education_priority' => true,
            'digital_signature' => 'Parent',
            'signature_date' => '2025-01-01',
        ];
    }

    private function createUserTables(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('user_type')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unsignedBigInteger('updated_by_id')->nullable();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_role_id')->nullable();
            $table->string('name');
            $table->string('username')->nullable()->unique();
            $table->string('email')->unique();
            $table->string('phone_number')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('password');
            $table->string('user_type')->nullable();
            $table->boolean('status')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    private function createAuditionTables(): void
    {
        Schema::create('child_auditions', function (Blueprint $table) {
            $table->id();
            $table->string('audition_type')->nullable();
            $table->string('full_name');
            $table->string('nickname')->nullable();
            $table->date('date_of_birth');
            $table->integer('age')->nullable();
            $table->string('gender');
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('height')->nullable();
            $table->string('school_name')->nullable();
            $table->text('hobbies')->nullable();
            $table->string('primary_language')->nullable();
            $table->string('speaking_confidence')->nullable();
            $table->string('can_read_script')->nullable();
            $table->boolean('previous_experience');
            $table->text('experience_details')->nullable();
            $table->text('social_media_links')->nullable();
            $table->boolean('has_medical_condition');
            $table->boolean('has_allergies');
            $table->boolean('on_regular_medication');
            $table->string('blood_group')->nullable();
            $table->string('weekly_availability')->nullable();
            $table->string('preferred_time_slot')->nullable();
            $table->boolean('outdoor_shoot_comfort');
            $table->string('outstation_travel')->nullable();
            $table->string('application_status');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });

        Schema::create('child_parents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->string('parent_name');
            $table->string('relationship');
            $table->string('mobile_number');
            $table->string('whatsapp_number')->nullable();
            $table->string('email');
            $table->string('parent_city');
            $table->string('emergency_contact');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });

        Schema::create('child_audition_media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->string('closeup_photo');
            $table->string('full_length_photo');
            $table->string('audition_video');
            $table->string('previous_work')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });

        foreach (['child_languages' => 'language_name', 'child_talents' => 'talent_type'] as $tableName => $valueColumn) {
            Schema::create($tableName, function (Blueprint $table) use ($valueColumn) {
                $table->id();
                $table->unsignedBigInteger('child_id');
                $table->string($valueColumn);
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('updated_by_id')->nullable();
                $table->timestamps();
            });
        }

        Schema::create('child_medical_conditions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->string('condition_name');
            $table->text('details')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });

        Schema::create('child_consents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->boolean('consent_information');
            $table->boolean('consent_media_use');
            $table->boolean('consent_promotion');
            $table->boolean('consent_safety_rules');
            $table->boolean('consent_selection_process');
            $table->boolean('consent_education_priority');
            $table->string('digital_signature');
            $table->date('signature_date');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });
    }

    private function createTalentShowTable(): void
    {
        Schema::create('talent_shows', function (Blueprint $table) {
            $table->id();
            $table->string('child_name');
            $table->string('parent_name');
            $table->unsignedInteger('age');
            $table->string('city');
            $table->string('contact_number');
            $table->text('what_makes_unique')->nullable();
            $table->text('talent_description')->nullable();
            $table->string('talent_video')->nullable();
            $table->string('social_media')->nullable();
            $table->boolean('declaration_true');
            $table->boolean('declaration_review');
            $table->boolean('declaration_parent_presence');
            $table->string('digital_signature');
            $table->date('signature_date');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });
    }

    private function createCreativeIdeaTable(): void
    {
        Schema::create('idea_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('reel_idea');
            $table->text('hook_line');
            $table->text('viral_reason');
            $table->boolean('credit_permission');
            $table->string('instagram')->nullable();
            $table->string('email')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedTinyInteger('review_status')->default(0);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });
    }

    private function createCollaborationTable(): void
    {
        Schema::create('collaboration_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('organization_name')->nullable();
            $table->string('brand_name');
            $table->string('contact_person');
            $table->string('collaboration_type');
            $table->string('email');
            $table->string('instagram_or_website')->nullable();
            $table->string('type_of_promotion')->nullable();
            $table->text('campaign_goal')->nullable();
            $table->string('budget_range')->nullable();
            $table->string('phone_number')->nullable();
            $table->text('message')->nullable();
            $table->boolean('commercial_inquiry')->default(false);
            $table->boolean('status')->default(true);
            $table->unsignedTinyInteger('review_status')->default(0);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });
    }

    private function createTicketTables(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->string('module_name');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_no', 30)->unique();
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('user_id');
            $table->string('subject');
            $table->text('description');
            $table->string('category', 50);
            $table->string('ticket_status', 30);
            $table->string('attachment')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('ticket_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id');
            $table->string('attachment')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('item_type', 30);
            $table->string('priority', 20);
            $table->string('severity', 20);
            $table->string('ticket_status', 30);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    private function seedTicketOptions(): void
    {
        DB::table('applications')->insert([
            'id' => 1,
            'app_name' => 'Sharpner',
            'status' => 1,
        ]);
        DB::table('applications')->insert([
            'id' => 2,
            'app_name' => 'Zeta App',
            'status' => 1,
        ]);
        foreach ([
            [1, 'Dhol Pathak'],
            [2, 'Auditions'],
            [3, 'Brand Deals'],
            [4, 'Creative Ideas'],
            [5, 'Other'],
            [6, 'Talent Show'],
            [7, 'Users'],
            [8, 'Videos & Shorts'],
            [9, 'Talent Show', 2],
        ] as $module) {
            DB::table('modules')->insert([
                'id' => $module[0],
                'application_id' => $module[2] ?? 1,
                'module_name' => $module[1],
                'status' => 1,
            ]);
        }
        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Requester',
            'email' => 'requester@example.test',
            'password' => Hash::make('secure-pass-123'),
            'status' => 1,
        ]);
        DB::table('tickets')->insert([
            'id' => 1,
            'ticket_no' => 'TK-20260717-HJKOGE',
            'application_id' => 1,
            'module_id' => 1,
            'user_id' => 1,
            'subject' => 'Existing ticket',
            'description' => 'Existing reference',
            'category' => 'both',
            'ticket_status' => 'Open',
            'status' => 1,
        ]);
        DB::table('ticket_items')->insert([
            'ticket_id' => 1,
            'title' => 'Existing item',
            'item_type' => 'bug',
            'priority' => 'medium',
            'severity' => 'medium',
            'ticket_status' => 'Open',
            'status' => 1,
        ]);
    }

    private function createDholPathakTable(): void
    {
        Schema::create('dhol_pathaks', function (Blueprint $table) {
            $table->id();
            $table->string('age_group');
            $table->string('full_name');
            $table->string('parent_name');
            $table->string('mobile_number');
            $table->string('city');
            $table->text('address')->nullable();
            $table->string('school_college_name')->nullable();
            $table->string('previous_dhol_experience')->nullable();
            $table->string('can_bring_instrument')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->string('preferred_location')->nullable();
            $table->string('emergency_contact');
            $table->string('available_practice_days')->nullable();
            $table->string('weekly_availability')->nullable();
            $table->boolean('declaration_pune')->default(false);
            $table->boolean('declaration_discipline')->default(false);
            $table->boolean('declaration_physical')->default(false);
            $table->boolean('declaration_true')->default(false);
            $table->string('digital_signature');
            $table->date('signature_date');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->timestamps();
        });
    }
}
