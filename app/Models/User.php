<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'photo_path',
        'phone',
        'designation',
        'affiliation',
        'location',
        'date_of_birth',
        'gender',
        'category',
        'caste',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'highest_qualification',
        'education_institution',
        'education_year',
        'education_details',
        'thesis_details',
        'supervisors',
        'research_areas',
        'research_statement',
        'publications',
        'achievements',
        'teaching_experience',
        'teaching_philosophy',
        'projects_research_work',
        'professional_experience',
        'skills',
        'curriculum_contributions',
        'certifications',
        'academic_service',
        'google_scholar_url',
        'orcid_url',
        'linkedin_url',
        'github_url',
        'personal_website_url',
        'statement',
        'cv_path',
        'research_statement_document_path',
        'teaching_statement_document_path',
        'password',
        'role',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
        ];
    }
}
