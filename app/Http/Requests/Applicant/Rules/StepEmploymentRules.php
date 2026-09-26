<?php

namespace App\Http\Requests\Applicant\Rules;

use Illuminate\Validation\Rule;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepEmploymentRules
{
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.employment.present.position' => ['required', 'string', 'max:255'],
            'form_data.employment.present.organization' => ['required', 'string', 'max:255'],
            'form_data.employment.present.date_joining' => ['required', 'date', 'before_or_equal:today'],
            'form_data.employment.present.date_leaving' => ['nullable', 'string', 'max:50'],
            'form_data.employment.has_three_years_exp' => ['required', 'string', Rule::in(['Yes', 'No'])],

            'form_data.employment.history' => ['nullable', 'array'],
            'form_data.employment.history.*.position' => ['nullable', 'string', 'max:255'],
            'form_data.employment.history.*.organization' => ['nullable', 'string', 'max:255'],
            'form_data.employment.history.*.date_joining' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.employment.history.*.date_leaving' => ['nullable', 'date', 'before_or_equal:today'],

            'form_data.employment.teaching' => ['nullable', 'array'],
            'form_data.employment.teaching.*.position' => ['nullable', 'string', 'max:255'],
            'form_data.employment.teaching.*.employer' => ['nullable', 'string', 'max:255'],
            'form_data.employment.teaching.*.courses' => ['nullable', 'string', 'max:500'],
            'form_data.employment.teaching.*.level' => ['nullable', 'string', 'max:100'],
            'form_data.employment.teaching.*.students' => ['nullable', 'integer', 'min:0'],
            'form_data.employment.teaching.*.date_joining' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.employment.teaching.*.date_leaving' => ['nullable', 'date', 'before_or_equal:today'],

            'form_data.employment.research' => ['nullable', 'array'],
            'form_data.employment.research.*.position' => ['nullable', 'string', 'max:255'],
            'form_data.employment.research.*.institute' => ['nullable', 'string', 'max:255'],
            'form_data.employment.research.*.supervisor' => ['nullable', 'string', 'max:255'],
            'form_data.employment.research.*.date_joining' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.employment.research.*.date_leaving' => ['nullable', 'date', 'before_or_equal:today'],

            'form_data.employment.industrial' => ['nullable', 'array'],
            'form_data.employment.industrial.*.organization' => ['nullable', 'string', 'max:255'],
            'form_data.employment.industrial.*.profile' => ['nullable', 'string', 'max:500'],
            'form_data.employment.industrial.*.date_joining' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.employment.industrial.*.date_leaving' => ['nullable', 'date', 'before_or_equal:today'],
        ];
    }
}
