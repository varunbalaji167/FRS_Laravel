<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepDetailedPubsRules
{
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.detailed_pubs.journals' => ['nullable', 'array'],
            'form_data.detailed_pubs.journals.*.authors' => ['nullable', 'string', 'max:500'],
            'form_data.detailed_pubs.journals.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.detailed_pubs.journals.*.journal_name' => ['nullable', 'string', 'max:255'],
            'form_data.detailed_pubs.journals.*.volume' => ['nullable', 'string', 'max:50'],
            'form_data.detailed_pubs.journals.*.issue' => ['nullable', 'string', 'max:50'],
            'form_data.detailed_pubs.journals.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.detailed_pubs.journals.*.pages' => ['nullable', 'string', 'max:50'],
            'form_data.detailed_pubs.journals.*.impact_factor' => ['nullable', 'numeric', 'min:0'],
            'form_data.detailed_pubs.journals.*.doi' => ['nullable', 'string', 'max:255'],
            'form_data.detailed_pubs.journals.*.status' => ['nullable', 'string', 'max:100'],

            'form_data.detailed_pubs.conferences' => ['nullable', 'array'],
            'form_data.detailed_pubs.conferences.*.authors' => ['nullable', 'string', 'max:500'],
            'form_data.detailed_pubs.conferences.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.detailed_pubs.conferences.*.conference_name' => ['nullable', 'string', 'max:255'],
            'form_data.detailed_pubs.conferences.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.detailed_pubs.conferences.*.pages' => ['nullable', 'string', 'max:50'],
            'form_data.detailed_pubs.conferences.*.doi' => ['nullable', 'string', 'max:255'],
        ];
    }
}
