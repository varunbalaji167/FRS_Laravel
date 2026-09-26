<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepAdditionalInfoRules
{
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.additional_info.patents' => ['nullable', 'array'],
            'form_data.additional_info.patents.*.inventors' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.patents.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.patents.*.country' => ['nullable', 'string', 'max:100'],
            'form_data.additional_info.patents.*.number' => ['nullable', 'string', 'max:100'],
            'form_data.additional_info.patents.*.date_filed' => ['nullable', 'date'],
            'form_data.additional_info.patents.*.date_published' => ['nullable', 'date'],
            'form_data.additional_info.patents.*.status' => ['nullable', 'string', 'max:100'],

            'form_data.additional_info.books' => ['nullable', 'array'],
            'form_data.additional_info.books.*.authors' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.books.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.books.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.additional_info.books.*.isbn' => ['nullable', 'string', 'max:50'],

            'form_data.additional_info.book_chapters' => ['nullable', 'array'],
            'form_data.additional_info.book_chapters.*.authors' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.book_chapters.*.title' => ['nullable', 'string', 'max:500'],
            'form_data.additional_info.book_chapters.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.additional_info.book_chapters.*.isbn' => ['nullable', 'string', 'max:50'],

            'form_data.additional_info.google_scholar' => ['nullable', 'url', 'max:255'],

            'form_data.additional_info.societies' => ['nullable', 'array'],
            'form_data.additional_info.societies.*.name' => ['nullable', 'string', 'max:255'],
            'form_data.additional_info.societies.*.status' => ['nullable', 'string', 'max:100'],

            'form_data.additional_info.training' => ['nullable', 'array'],
            'form_data.additional_info.training.*.type' => ['nullable', 'string', 'max:255'],
            'form_data.additional_info.training.*.organization' => ['nullable', 'string', 'max:255'],
            'form_data.additional_info.training.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            'form_data.additional_info.training.*.duration' => ['nullable', 'string', 'max:100'],
        ];
    }
}
