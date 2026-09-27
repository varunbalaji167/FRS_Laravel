<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepPositionRules
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(int $currentYear): array
    {
        return [
            'department' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:255'],
        ];
    }
}
