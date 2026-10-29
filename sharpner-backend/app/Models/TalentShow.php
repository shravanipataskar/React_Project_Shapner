<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TalentShow extends Model
{
    protected $table = 'talent_shows';

    protected $fillable = [
        'child_name',
        'parent_name',
        'age',
        'city',
        'contact_number',
        'what_makes_unique',
        'talent_description',
        'talent_video',
        'social_media',
        'declaration_true',
        'declaration_review',
        'declaration_parent_presence',
        'digital_signature',
        'signature_date',
        'status',
        'updated_by_id',
    ];

    protected $casts = [
        'declaration_true' => 'boolean',
        'declaration_review' => 'boolean',
        'declaration_parent_presence' => 'boolean',
        'status' => 'integer',
    ];
}