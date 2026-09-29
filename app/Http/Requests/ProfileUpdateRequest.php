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
        'first_name', 'middle_name', 'last_name', 'fathers_name', 'dob', 'gender',
        'marital_status', 'category', 'nationality', 'id_proof_type', 'id_proof_number',
        'phone', 'phone_code', 'alt_phone',
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

            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'fathers_name' => ['nullable', 'string', 'max:255'],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female', 'Transgender', 'Prefer not to say'])],
            'marital_status' => ['nullable', 'string', Rule::in(['Unmarried', 'Married', 'Divorced', 'Widowed'])],
            'category' => ['nullable', 'string', Rule::in(['UR', 'OBC', 'SC', 'ST', 'EWS'])],
            'nationality' => ['nullable', 'string', Rule::in(['Indian', 'OCI', 'Foreign National'])],
            'id_proof_type' => ['nullable', 'string', Rule::in(['Aadhar', 'PAN', 'Passport', 'Voter ID', 'Driving License'])],
            'id_proof_number' => ['nullable', 'string', 'max:255'],

            'phone' => ['nullable', 'string', 'regex:/^\d{10}$/'],
            'phone_code' => ['nullable', 'string', 'regex:/^\+?\d{1,4}$/'],
            'alt_phone' => ['nullable', 'string', 'regex:/^\d{10}$/'],
            'alt_phone_code' => ['nullable', 'string', 'regex:/^\+?\d{1,4}$/'],
            'alt_email' => ['nullable', 'email', 'max:255'],

            'corr_address' => ['nullable', 'string', 'max:1000'],
            'corr_city' => ['nullable', 'string', 'max:100'],
            'corr_state' => ['nullable', 'string', 'max:100'],
            'corr_pincode' => ['nullable', 'string', 'max:20'],
            'corr_country' => ['nullable', 'string', 'max:100'],

            'perm_address' => ['nullable', 'string', 'max:1000'],
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
