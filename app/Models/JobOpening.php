<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobOpening extends Model
{
    use HasFactory;

    // This array tells Laravel these fields are safe to be saved via a form
    protected $fillable = [
        'title',
        'department',
        'description_and_criteria',
        'deadline',
        'is_active',
    ];
}
