<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollaborationRequest extends Model
{
    use HasFactory;

    protected $table = 'collaboration_requests';

    protected $fillable = [
        'name',
        'organization_name',
        'brand_name',
        'contact_person',
        'collaboration_type',
        'email',
        'instagram_or_website',
        'type_of_promotion',
        'campaign_goal',
        'budget_range',
        'phone_number',
        'message',
        'commercial_inquiry',
        'status',
        'review_status',
        'updated_by_id',
    ];

    protected $casts = [
        'commercial_inquiry' => 'boolean',
        'status' => 'integer',
        'review_status' => 'integer',
    ];
}