<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepEducationRules
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(int $currentYear): array
    {
        return [
            // PhD — single object, mandatory fields per docs/wizard-steps.md
            'form_data.education.phd.university' => ['required', 'string', 'max:255'],
            'form_data.education.phd.department' => ['required', 'string', 'max:255'],
            'form_data.education.phd.supervisor' => ['nullable', 'string', 'max:255'],
            'form_data.education.phd.date_joining' => [
                'required', 'date', 'before_or_equal:today',
                'after_or_equal:1950-01-01', 'before_or_equal:'.$currentYear.'-12-31',
            ],
            'form_data.education.phd.date_defence' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.education.phd.date_award' => ['nullable', 'date', 'before_or_equal:today'],
            'form_data.education.phd.title' => ['nullable', 'string', 'max:1000'],

            // PG — array, no min/max count
            'form_data.education.pg' => ['nullable', 'array'],
            'form_data.education.pg.*.degree' => ['nullable', 'string', 'max:255'],
            'form_data.education.pg.*.university' => ['nullable', 'string', 'max:255'],
            'form_data.education.pg.*.subjects' => ['nullable', 'string', 'max:500'],
            'form_data.education.pg.*.date_joining' => ['nullable', 'date'],
            'form_data.education.pg.*.date_graduation' => ['nullable', 'date'],
            'form_data.education.pg.*.percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'form_data.education.pg.*.division' => ['nullable', 'string', 'max:100'],

            // UG — array, same shape as PG
            'form_data.education.ug' => ['nullable', 'array'],
            'form_data.education.ug.*.degree' => ['nullable', 'string', 'max:255'],
            'form_data.education.ug.*.university' => ['nullable', 'string', 'max:255'],
            'form_data.education.ug.*.subjects' => ['nullable', 'string', 'max:500'],
            'form_data.education.ug.*.date_joining' => ['nullable', 'date'],
            'form_data.education.ug.*.date_graduation' => ['nullable', 'date'],
            'form_data.education.ug.*.percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'form_data.education.ug.*.division' => ['nullable', 'string', 'max:100'],

            // School — always 2 fixed entries (12th/HSC/Diploma, 10th)
            'form_data.education.school' => ['nullable', 'array'],
            'form_data.education.school.*.level' => ['nullable', 'string', 'max:100'],
            'form_data.education.school.*.school' => ['nullable', 'string', 'max:255'],
            'form_data.education.school.*.year_passing' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.education.school.*.percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'form_data.education.school.*.division' => ['nullable', 'string', 'max:100'],
        ];
    }
}
