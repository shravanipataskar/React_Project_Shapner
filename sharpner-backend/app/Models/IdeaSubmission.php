<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdeaSubmission extends Model
{
    use HasFactory;

    protected $table = 'idea_submissions';

    protected $fillable = [
        'name',
        'reel_idea',
        'hook_line',
        'viral_reason',
        'credit_permission',
        'instagram',
        'email',
        'status',
        'review_status',
        'updated_by_id',
    ];

    protected $casts = [
        'credit_permission' => 'boolean',
        'status' => 'integer',
        'review_status' => 'integer',
    ];
}