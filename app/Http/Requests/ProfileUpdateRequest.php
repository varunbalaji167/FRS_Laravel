<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Every profile key, minus `profile_image` — the controller turns that
     * into `photo_path` once the file is stored.
     */
    public const PROFILE_FIELDS = [
        'father_name', 'date_of_birth', 'gender', 'marital_status', 'category',
        'nationality', 'id_proof', 'phone', 'phone_code', 'alt_phone',
        'alt_phone_code', 'alt_email', 'corr_address', 'corr_city', 'corr_state',
        'corr_pincode', 'corr_country', 'perm_address', 'perm_city', 'perm_state',
        'perm_pincode', 'perm_country', 'designation', 'affiliation',
        'google_scholar_url', 'orcid_url', 'linkedin_url', 'github_url',
    ];

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],

            'father_name' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            // 'Other' and 'General' are no longer offered by the form but
            // stay accepted so a profile saved before this change can still
            // be re-submitted unchanged; the wizard's own Step 2 rules
            // (StepPersonalRules) require the canonical values only.
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female', 'Transgender', 'Prefer not to say', 'Other'])],
            'marital_status' => ['nullable', 'string', Rule::in(['Married', 'Unmarried'])],
            'category' => ['nullable', 'string', Rule::in(['UR', 'OBC', 'SC', 'ST', 'EWS', 'General'])],
            'nationality' => ['nullable', 'string', 'max:100'],
            'id_proof' => ['nullable', 'string', 'max:255'],

            'phone' => ['nullable', 'string', 'max:20'],
            'phone_code' => ['nullable', 'string', 'max:6'],
            'alt_phone' => ['nullable', 'string', 'max:20'],
            'alt_phone_code' => ['nullable', 'string', 'max:6'],
            'alt_email' => ['nullable', 'email', 'max:255'],

            'corr_address' => ['nullable', 'string', 'max:500'],
            'corr_city' => ['nullable', 'string', 'max:100'],
            'corr_state' => ['nullable', 'string', 'max:100'],
            'corr_pincode' => ['nullable', 'string', 'max:20'],
            'corr_country' => ['nullable', 'string', 'max:100'],

            'perm_address' => ['nullable', 'string', 'max:500'],
            'perm_city' => ['nullable', 'string', 'max:100'],
            'perm_state' => ['nullable', 'string', 'max:100'],
            'perm_pincode' => ['nullable', 'string', 'max:20'],
            'perm_country' => ['nullable', 'string', 'max:100'],

            'designation' => ['nullable', 'string', 'max:150'],
            'affiliation' => ['nullable', 'string', 'max:200'],
            'google_scholar_url' => ['nullable', 'url', 'max:255'],
            'orcid_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
