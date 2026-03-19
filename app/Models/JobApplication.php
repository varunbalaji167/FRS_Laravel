<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'advertisement_id',
        'department',
        'grade',
        'form_data', 
        'sop',
        'research_interest',
        'status',
        'submitted_at', 
    ];

    protected $casts = [
        'form_data' => 'array',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the application.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the advertisement that this application is for.
     */
    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }
}