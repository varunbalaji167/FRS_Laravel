<?php

namespace App\Http\Requests\Applicant\Rules;

use Illuminate\Validation\Rule;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepPersonalRules
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.personal_details.profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'form_data.personal_details.first_name' => ['required', 'string', 'max:255'],
            'form_data.personal_details.middle_name' => ['nullable', 'string', 'max:255'],
            'form_data.personal_details.last_name' => ['required', 'string', 'max:255'],
            'form_data.personal_details.fathers_name' => ['nullable', 'string', 'max:255'],
            'form_data.personal_details.dob' => ['required', 'date', 'before:today'],
            'form_data.personal_details.gender' => ['required', 'string', Rule::in(['Male', 'Female', 'Transgender', 'Prefer not to say'])],
            'form_data.personal_details.marital_status' => ['nullable', 'string', Rule::in(['Unmarried', 'Married', 'Divorced', 'Widowed'])],
            'form_data.personal_details.category' => ['required', 'string', Rule::in(['UR', 'OBC', 'SC', 'ST', 'EWS'])],
            'form_data.personal_details.nationality' => ['required', 'string', Rule::in(['Indian', 'OCI', 'Foreign National'])],
            'form_data.personal_details.id_proof_type' => ['nullable', 'string', Rule::in(['Aadhar', 'PAN', 'Passport', 'Voter ID', 'Driving License'])],
            'form_data.personal_details.id_proof_number' => ['nullable', 'string', 'max:255'],
            'form_data.personal_details.corr_address' => ['nullable', 'string', 'max:1000'],
            'form_data.personal_details.corr_city' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.corr_state' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.corr_country' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.corr_pincode' => ['nullable', 'string', 'max:20'],
            'form_data.personal_details.perm_address' => ['nullable', 'string', 'max:1000'],
            'form_data.personal_details.perm_city' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.perm_state' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.perm_country' => ['nullable', 'string', 'max:100'],
            'form_data.personal_details.perm_pincode' => ['nullable', 'string', 'max:20'],
            'form_data.personal_details.email' => ['required', 'email', 'max:255'],
            'form_data.personal_details.alt_email' => ['nullable', 'email', 'max:255'],
            'form_data.personal_details.phone_code' => ['nullable', 'string', 'regex:/^\+?\d{1,4}$/'],
            'form_data.personal_details.phone' => ['required', 'regex:/^\d{10}$/'],
            'form_data.personal_details.alt_phone_code' => ['nullable', 'string', 'regex:/^\+?\d{1,4}$/'],
            'form_data.personal_details.alt_phone' => ['nullable', 'regex:/^\d{10}$/'],
        ];
    }
}
