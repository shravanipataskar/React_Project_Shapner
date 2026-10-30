<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuditionController extends Controller
{
    /**
     * Save an audition and its related records in the existing child tables.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->auditionRules());

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $now = now();

        $application = DB::transaction(function () use ($data, $now) {
            $childId = DB::table('child_auditions')->insertGetId([
                'audition_type' => $data['audition_type'],
                'full_name' => $data['full_name'],
                'nickname' => $data['nickname'] ?? null,
                'date_of_birth' => $data['date_of_birth'],
                'age' => $data['age'],
                'gender' => $data['gender'],
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'height' => $data['height'] ?? null,
                'school_name' => $data['school_name'] ?? null,
                'hobbies' => $data['hobbies'] ?? null,
                'primary_language' => $data['primary_language'] ?? null,
                'speaking_confidence' => $data['speaking_confidence'] ?? null,
                'can_read_script' => $data['can_read_script'] ?? null,
                'previous_experience' => $data['previous_experience'],
                'experience_details' => $data['experience_details'] ?? null,
                'social_media_links' => $data['social_media_links'] ?? null,
                'has_medical_condition' => $data['has_medical_condition'],
                'has_allergies' => $data['has_allergies'],
                'on_regular_medication' => $data['on_regular_medication'],
                'blood_group' => $data['blood_group'] ?? null,
                'weekly_availability' => $data['weekly_availability'],
                'preferred_time_slot' => $data['preferred_time_slot'],
                'outdoor_shoot_comfort' => $data['outdoor_shoot_comfort'],
                'outstation_travel' => $data['outstation_travel'],
                'application_status' => 'pending',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('child_parents')->insert([
                'child_id' => $childId,
                'parent_name' => $data['parent_name'],
                'relationship' => $data['relationship'] ?? null,
                'mobile_number' => $data['mobile_number'],
                'whatsapp_number' => $data['whatsapp_number'] ?? null,
                'email' => $data['email'],
                'parent_city' => $data['parent_city'],
                'emergency_contact' => $data['emergency_contact'],
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('child_audition_media')->insert([
                'child_id' => $childId,
                'closeup_photo' => $data['closeup_photo'],
                'full_length_photo' => $data['full_length_photo'],
                'audition_video' => $data['audition_video'],
                'previous_work' => $data['previous_work'] ?? null,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $languages = array_values(array_unique(array_filter([
                ...($data['languages'] ?? []),
                $data['other_language'] ?? null,
            ])));
            if ($languages !== []) {
                DB::table('child_languages')->insert(array_map(
                    fn ($language) => [
                        'child_id' => $childId,
                        'language_name' => $language,
                        'status' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    $languages
                ));
            }

            $talents = array_values(array_unique(array_filter([
                ...($data['talents'] ?? []),
                $data['other_talent'] ?? null,
            ])));
            if ($talents !== []) {
                DB::table('child_talents')->insert(array_map(
                    fn ($talent) => [
                        'child_id' => $childId,
                        'talent_type' => $talent,
                        'status' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    $talents
                ));
            }

            $conditions = [];
            foreach ([
                'has_medical_condition' => 'Medical condition',
                'has_allergies' => 'Allergy',
                'on_regular_medication' => 'Regular medication',
            ] as $field => $label) {
                if ($data[$field]) {
                    $conditions[] = [
                        'child_id' => $childId,
                        'condition_name' => $label,
                        'details' => $data['medical_details'] ?? null,
                        'status' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            if ($conditions !== []) {
                DB::table('child_medical_conditions')->insert($conditions);
            }

            DB::table('child_consents')->insert([
                'child_id' => $childId,
                'consent_information' => $data['consent_information'],
                'consent_media_use' => $data['consent_media_use'],
                'consent_promotion' => $data['consent_promotion'],
                'consent_safety_rules' => $data['consent_safety_rules'],
                'consent_selection_process' => $data['consent_selection_process'],
                'consent_education_priority' => $data['consent_education_priority'],
                'digital_signature' => $data['digital_signature'],
                'signature_date' => $data['signature_date'],
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            return DB::table('child_auditions')->where('id', $childId)->first();
        });

        return response()->json([
            'message' => 'Audition application created successfully.',
            'data' => $application,
        ], 201);
    }

    private function auditionRules(): array
    {
        return [
            'audition_type' => ['required', 'string', 'max:255'],
            'full_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date'],
            'age' => ['required', 'integer', 'min:0', 'max:120'],
            'gender' => ['required', 'string', 'max:255'],
            'height' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'hobbies' => ['nullable', 'string'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:255'],
            'other_language' => ['nullable', 'string', 'max:255'],
            'primary_language' => ['nullable', 'string', 'max:255'],
            'speaking_confidence' => ['nullable', 'string', 'max:255'],
            'can_read_script' => ['nullable', 'string', 'max:255'],
            'parent_name' => ['required', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
            'mobile_number' => ['required', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'parent_city' => ['required', 'string', 'max:255'],
            'emergency_contact' => ['required', 'string', 'max:255'],
            'talents' => ['nullable', 'array'],
            'talents.*' => ['string', 'max:255'],
            'other_talent' => ['nullable', 'string', 'max:255'],
            'previous_experience' => ['required', 'boolean'],
            'experience_details' => ['nullable', 'string'],
            'social_media_links' => ['nullable', 'string'],
            'closeup_photo' => ['required', 'url:http,https', 'max:255'],
            'full_length_photo' => ['required', 'url:http,https', 'max:255'],
            'audition_video' => ['required', 'url:http,https', 'max:255'],
            'previous_work' => ['nullable', 'url:http,https', 'max:255'],
            'has_medical_condition' => ['required', 'boolean'],
            'has_allergies' => ['required', 'boolean'],
            'on_regular_medication' => ['required', 'boolean'],
            'medical_details' => ['nullable', 'string'],
            'blood_group' => ['nullable', 'string', 'max:255'],
            'weekly_availability' => ['nullable', 'string', 'max:255'],
            'preferred_time_slot' => ['nullable', 'string', 'max:255'],
            'outdoor_shoot_comfort' => ['required', 'boolean'],
            'outstation_travel' => ['nullable', 'string', 'max:255'],
            'consent_information' => ['required', 'boolean'],
            'consent_media_use' => ['required', 'boolean'],
            'consent_promotion' => ['required', 'boolean'],
            'consent_safety_rules' => ['required', 'boolean'],
            'consent_selection_process' => ['required', 'boolean'],
            'consent_education_priority' => ['required', 'boolean'],
            'digital_signature' => ['required', 'string', 'max:255'],
            'signature_date' => ['required', 'date'],
        ];
    }

    /**
     * Display audition applications with search,
     * status filtering, and pagination.
     */
    public function index(Request $request)
    {
        $query = DB::table('child_auditions')
            ->select([
                'child_auditions.id',
                'child_auditions.full_name',
                'child_auditions.age',
                'child_auditions.city',
                'child_auditions.status',
                'child_auditions.application_status',
                'child_auditions.created_at',
            ])
            ->selectSub(function ($subquery) {
                $subquery->from('child_parents')
                    ->select('mobile_number')
                    ->whereColumn(
                        'child_parents.child_id',
                        'child_auditions.id'
                    )
                    ->where('child_parents.status', 1)
                    ->orderBy('child_parents.id')
                    ->limit(1);
            }, 'mobile_number');

        // Active or inactive applications.
        if ($request->has('status')) {
            $status = $request->query('status');

            if (! in_array((string) $status, ['0', '1'], true)) {
                return response()->json([
                    'message' => 'Status must be 0 or 1.',
                ], 422);
            }

            $query->where('child_auditions.status', (int) $status);
        }

        // Search by applicant name, city, or parent mobile number.
        $search = trim((string) $request->query('search', ''));

        if ($search !== '') {
            $query->where(function ($subquery) use ($search) {
                $subquery
                    ->where(
                        'child_auditions.full_name',
                        'like',
                        '%'.$search.'%'
                    )
                    ->orWhere(
                        'child_auditions.city',
                        'like',
                        '%'.$search.'%'
                    )
                    ->orWhereExists(function ($parentQuery) use ($search) {
                        $parentQuery->select(DB::raw(1))
                            ->from('child_parents')
                            ->whereColumn(
                                'child_parents.child_id',
                                'child_auditions.id'
                            )
                            ->where(
                                'child_parents.mobile_number',
                                'like',
                                '%'.$search.'%'
                            );
                    });
            });
        }

        // Most recent applications first.
        $query->orderByDesc('child_auditions.id');

        $perPage = 10;

        $auditions = $query->paginate($perPage);

        return response()->json($auditions);
    }

    /**
     * Display one audition application with its related form data.
     */
    public function show($id)
    {
        $audition = $this->getAuditionRecord($id);

        if ($audition === null) {
            return response()->json([
                'message' => 'Audition application not found.',
            ], 404);
        }

        return response()->json([
            'data' => $audition,
        ]);
    }

    /**
     * Update an audition and its related records without discarding omitted
     * fields from clients that submit a partial payload.
     */
    public function update(Request $request, $id)
    {
        $existing = $this->getAuditionRecord($id);
        if ($existing === null) {
            return response()->json([
                'message' => 'Audition application not found.',
            ], 404);
        }

        $validator = Validator::make(
            array_merge($existing, $request->all()),
            $this->auditionRules()
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $now = now();

        DB::transaction(function () use ($id, $data, $now) {
            DB::table('child_auditions')
                ->where('id', $id)
                ->update([
                    'audition_type' => $data['audition_type'],
                    'full_name' => $data['full_name'],
                    'nickname' => $data['nickname'] ?? null,
                    'date_of_birth' => $data['date_of_birth'],
                    'age' => $data['age'],
                    'gender' => $data['gender'],
                    'city' => $data['city'],
                    'state' => $data['state'] ?? null,
                    'height' => $data['height'] ?? null,
                    'school_name' => $data['school_name'] ?? null,
                    'hobbies' => $data['hobbies'] ?? null,
                    'primary_language' => $data['primary_language'] ?? null,
                    'speaking_confidence' => $data['speaking_confidence'] ?? null,
                    'can_read_script' => $data['can_read_script'] ?? null,
                    'previous_experience' => $data['previous_experience'],
                    'experience_details' => $data['experience_details'] ?? null,
                    'social_media_links' => $data['social_media_links'] ?? null,
                    'has_medical_condition' => $data['has_medical_condition'],
                    'has_allergies' => $data['has_allergies'],
                    'on_regular_medication' => $data['on_regular_medication'],
                    'blood_group' => $data['blood_group'] ?? null,
                    'weekly_availability' => $data['weekly_availability'] ?? null,
                    'preferred_time_slot' => $data['preferred_time_slot'] ?? null,
                    'outdoor_shoot_comfort' => $data['outdoor_shoot_comfort'],
                    'outstation_travel' => $data['outstation_travel'] ?? null,
                    'updated_at' => $now,
                ]);

            $this->updateAuditionRelatedRecord(
                'child_parents',
                $id,
                [
                    'parent_name' => $data['parent_name'],
                    'relationship' => $data['relationship'] ?? null,
                    'mobile_number' => $data['mobile_number'],
                    'whatsapp_number' => $data['whatsapp_number'] ?? null,
                    'email' => $data['email'],
                    'parent_city' => $data['parent_city'],
                    'emergency_contact' => $data['emergency_contact'],
                ],
                $now
            );
            $this->updateAuditionRelatedRecord(
                'child_audition_media',
                $id,
                [
                    'closeup_photo' => $data['closeup_photo'],
                    'full_length_photo' => $data['full_length_photo'],
                    'audition_video' => $data['audition_video'],
                    'previous_work' => $data['previous_work'] ?? null,
                ],
                $now
            );

            $languages = array_values(array_filter(array_unique([
                ...($data['languages'] ?? []),
                $data['other_language'] ?? null,
            ])));
            $this->syncAuditionChoices(
                'child_languages',
                'language_name',
                $id,
                $languages,
                $now
            );

            $talents = array_values(array_filter(array_unique([
                ...($data['talents'] ?? []),
                $data['other_talent'] ?? null,
            ])));
            $this->syncAuditionChoices(
                'child_talents',
                'talent_type',
                $id,
                $talents,
                $now
            );

            DB::table('child_medical_conditions')
                ->where('child_id', $id)
                ->where('status', 1)
                ->update(['status' => 0, 'updated_at' => $now]);
            $conditions = [];
            foreach ([
                'has_medical_condition' => 'Medical condition',
                'has_allergies' => 'Allergy',
                'on_regular_medication' => 'Regular medication',
            ] as $field => $label) {
                if ($data[$field]) {
                    $conditions[] = [
                        'child_id' => $id,
                        'condition_name' => $label,
                        'details' => $data['medical_details'] ?? null,
                        'status' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            if ($conditions !== []) {
                DB::table('child_medical_conditions')->insert($conditions);
            }

            $this->updateAuditionRelatedRecord(
                'child_consents',
                $id,
                [
                    'consent_information' => $data['consent_information'],
                    'consent_media_use' => $data['consent_media_use'],
                    'consent_promotion' => $data['consent_promotion'],
                    'consent_safety_rules' => $data['consent_safety_rules'],
                    'consent_selection_process' => $data['consent_selection_process'],
                    'consent_education_priority' => $data['consent_education_priority'],
                    'digital_signature' => $data['digital_signature'],
                    'signature_date' => $data['signature_date'],
                ],
                $now
            );
        });

        return response()->json([
            'message' => 'Audition application updated successfully.',
            'data' => $this->getAuditionRecord($id),
        ]);
    }

    private function getAuditionRecord($id): ?array
    {
        $audition = DB::table('child_auditions')->where('id', $id)->first();
        if (! $audition) {
            return null;
        }

        $record = (array) $audition;
        $parent = DB::table('child_parents')
            ->where('child_id', $id)
            ->where('status', 1)
            ->orderBy('id')
            ->first();
        $media = DB::table('child_audition_media')
            ->where('child_id', $id)
            ->where('status', 1)
            ->orderBy('id')
            ->first();
        $consent = DB::table('child_consents')
            ->where('child_id', $id)
            ->where('status', 1)
            ->orderBy('id')
            ->first();

        foreach ([
            'parent_name',
            'relationship',
            'mobile_number',
            'whatsapp_number',
            'email',
            'parent_city',
            'emergency_contact',
        ] as $field) {
            $record[$field] = $parent->{$field} ?? $record[$field] ?? null;
        }
        foreach ([
            'closeup_photo',
            'full_length_photo',
            'audition_video',
            'previous_work',
        ] as $field) {
            $record[$field] = $media->{$field} ?? $record[$field] ?? null;
        }
        foreach ([
            'consent_information',
            'consent_media_use',
            'consent_promotion',
            'consent_safety_rules',
            'consent_selection_process',
            'consent_education_priority',
            'digital_signature',
            'signature_date',
        ] as $field) {
            $record[$field] = $consent->{$field} ?? $record[$field] ?? null;
        }

        $knownLanguages = ['Marathi', 'Hindi', 'English', 'Other'];
        $languages = DB::table('child_languages')
            ->where('child_id', $id)
            ->where('status', 1)
            ->orderBy('id')
            ->pluck('language_name')
            ->all();
        $record['languages'] = array_values(array_intersect(
            $languages,
            $knownLanguages
        ));
        $record['other_language'] = implode(
            ', ',
            array_diff($languages, $knownLanguages)
        );

        $knownTalents = [
            'Acting',
            'Anchoring',
            'Dancing',
            'Comedy',
            'Storytelling',
            'Podcast Participation',
            'Other',
        ];
        $talents = DB::table('child_talents')
            ->where('child_id', $id)
            ->where('status', 1)
            ->orderBy('id')
            ->pluck('talent_type')
            ->all();
        $record['talents'] = array_values(array_intersect(
            $talents,
            $knownTalents
        ));
        $record['other_talent'] = implode(
            ', ',
            array_diff($talents, $knownTalents)
        );
        $record['medical_details'] = DB::table('child_medical_conditions')
            ->where('child_id', $id)
            ->where('status', 1)
            ->whereNotNull('details')
            ->orderBy('id')
            ->value('details') ?? $record['medical_details'] ?? null;

        return $record;
    }

    private function updateAuditionRelatedRecord(
        string $table,
        $childId,
        array $fields,
        $now
    ): void {
        $existing = DB::table($table)
            ->where('child_id', $childId)
            ->where('status', 1)
            ->orderBy('id')
            ->first();

        if ($existing) {
            DB::table($table)->where('id', $existing->id)->update([
                ...$fields,
                'updated_at' => $now,
            ]);

            return;
        }

        DB::table($table)->insert([
            ...$fields,
            'child_id' => $childId,
            'status' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function syncAuditionChoices(
        string $table,
        string $column,
        $childId,
        array $values,
        $now
    ): void {
        $values = array_values(array_unique(array_filter(array_map(
            static fn ($value) => trim((string) $value),
            $values
        ))));
        $activeRecords = DB::table($table)
            ->where('child_id', $childId)
            ->where('status', 1)
            ->get();

        foreach ($activeRecords as $record) {
            $existingIndex = array_search($record->{$column}, $values, true);
            if ($existingIndex === false) {
                DB::table($table)->where('id', $record->id)->update([
                    'status' => 0,
                    'updated_at' => $now,
                ]);

                continue;
            }
            unset($values[$existingIndex]);
        }

        foreach ($values as $value) {
            DB::table($table)->insert([
                'child_id' => $childId,
                $column => $value,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * Activate or deactivate an audition application.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $updated = DB::table('child_auditions')
            ->where('id', $id)
            ->update([
                'status' => (int) $validated['status'],
            ]);

        if ($updated === 0) {
            $exists = DB::table('child_auditions')
                ->where('id', $id)
                ->exists();

            if (! $exists) {
                return response()->json([
                    'message' => 'Audition application not found.',
                ], 404);
            }
        }

        return response()->json([
            'message' => $validated['status']
                ? 'Audition activated successfully.'
                : 'Audition deactivated successfully.',
            'data' => [
                'id' => $id,
                'status' => (int) $validated['status'],
            ],
        ]);
    }
}
