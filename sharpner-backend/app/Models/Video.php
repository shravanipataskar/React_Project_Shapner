<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $table = 'videos';

    protected $fillable = [
        'title',
        'video_url',
        'video_id',
        'platform',
        'type',
        'thumbnail',
        'display_order',
        'status',
        'updated_by_id',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'status' => 'integer',
        'updated_by_id' => 'integer',
    ];
}