<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DholPathak extends Model
{
    protected $table = 'dhol_pathaks';

    protected $fillable = [
        'age_group',
        'full_name',
        'parent_name',
        'mobile_number',
        'city',
        'address',
        'school_college_name',
        'previous_dhol_experience',
        'can_bring_instrument',
        'medical_conditions',
        'preferred_location',
        'emergency_contact',
        'available_practice_days',
        'weekly_availability',
        'declaration_pune',
        'declaration_discipline',
        'declaration_physical',
        'declaration_true',
        'digital_signature',
        'signature_date',
        'status',
        'updated_by_id',
    ];

    protected $casts = [
        'declaration_pune' => 'boolean',
        'declaration_discipline' => 'boolean',
        'declaration_physical' => 'boolean',
        'declaration_true' => 'boolean',
        'signature_date' => 'date',
        'status' => 'integer',
    ];
}