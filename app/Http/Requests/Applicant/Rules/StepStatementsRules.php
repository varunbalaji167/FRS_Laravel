<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepStatementsRules
{
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.statements.research_plan' => ['required', 'string', 'max:10000'],
            'form_data.statements.teaching_plan' => ['required', 'string', 'max:10000'],
            'form_data.statements.professional_service' => ['nullable', 'string', 'max:10000'],
            'form_data.statements.other_info' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
