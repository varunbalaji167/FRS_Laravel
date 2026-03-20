<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantProfile extends Model
{
    protected $guarded = []; // Allow mass assignment for all fields since we control the form

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}