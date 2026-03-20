<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'photo' => ['nullable', 'image', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:25'],
            'designation' => ['nullable', 'string', 'max:150'],
            'affiliation' => ['nullable', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:150'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female', 'Other', 'Prefer not to say'])],
            'category' => ['nullable', 'string', Rule::in(['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'])],
            'caste' => ['nullable', 'string', 'max:80'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'highest_qualification' => ['nullable', 'string', 'max:150'],
            'education_institution' => ['nullable', 'string', 'max:200'],
            'education_year' => ['nullable', 'string', 'max:20'],
            'education_details' => ['nullable', 'string'],
            'thesis_details' => ['nullable', 'string'],
            'supervisors' => ['nullable', 'string'],
            'research_areas' => ['nullable', 'string'],
            'research_statement' => ['nullable', 'string'],
            'publications' => ['nullable', 'string'],
            'achievements' => ['nullable', 'string'],
            'teaching_experience' => ['nullable', 'string'],
            'teaching_philosophy' => ['nullable', 'string'],
            'projects_research_work' => ['nullable', 'string'],
            'professional_experience' => ['nullable', 'string'],
            'skills' => ['nullable', 'string'],
            'curriculum_contributions' => ['nullable', 'string'],
            'certifications' => ['nullable', 'string'],
            'academic_service' => ['nullable', 'string'],
            'google_scholar_url' => ['nullable', 'url', 'max:255'],
            'orcid_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'personal_website_url' => ['nullable', 'url', 'max:255'],
            'statement' => ['nullable', 'string'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'research_statement_document' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'teaching_statement_document' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ];
    }
}
