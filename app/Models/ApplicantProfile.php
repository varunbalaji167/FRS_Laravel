<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantProfile extends Model
{
    protected $fillable = [
        'photo_path',
        'father_name',
        'date_of_birth',
        'gender',
        'marital_status',
        'category',
        'nationality',
        'id_proof',
        'phone',
        'phone_code',
        'alt_phone',
        'alt_phone_code',
        'alt_email',
        'corr_address',
        'corr_city',
        'corr_state',
        'corr_pincode',
        'corr_country',
        'perm_address',
        'perm_city',
        'perm_state',
        'perm_pincode',
        'perm_country',
        'designation',
        'affiliation',
        'google_scholar_url',
        'orcid_url',
        'linkedin_url',
        'github_url',
        'cv_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
