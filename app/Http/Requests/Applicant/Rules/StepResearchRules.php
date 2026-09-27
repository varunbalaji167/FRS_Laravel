<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepResearchRules
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.research.specialization.area_of_specialization' => ['required', 'string', 'max:2000'],
            'form_data.research.specialization.current_area_of_research' => ['required', 'string', 'max:2000'],

            'form_data.research.summary.intl_journals' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.natl_journals' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.intl_conferences' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.natl_conferences' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.patents' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.books' => ['nullable', 'integer', 'min:0'],
            'form_data.research.summary.book_chapters' => ['nullable', 'integer', 'min:0'],

            'form_data.research.publications' => ['nullable', 'array', 'max:10'],
            'form_data.research.publications.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.research.publications.*.authors' => ['nullable', 'string', 'max:500'],
            'form_data.research.publications.*.journal' => ['nullable', 'string', 'max:255'],
            'form_data.research.publications.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.research.publications.*.vol_page' => ['nullable', 'string', 'max:100'],
            'form_data.research.publications.*.impact_factor' => ['nullable', 'numeric', 'min:0'],
            'form_data.research.publications.*.doi' => ['nullable', 'string', 'max:255'],
            'form_data.research.publications.*.status' => ['nullable', 'string', 'max:100'],
        ];
    }
}
