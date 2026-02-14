<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailBlastLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'mode',
        'subject',
        'intended_recipients',
        'sent_count',
        'status',
        'sent_by',
        'error_message',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'intended_recipients' => 'array',
    ];
}
