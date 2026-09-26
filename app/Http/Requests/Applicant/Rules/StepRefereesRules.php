<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
//
// The first 3 referees are mandatory (index 0-2); any further referees are
// optional but still format-checked if present. Explicit numeric-index rules
// are merged by Laravel's validator alongside the `*` wildcard rules below,
// so both apply to indices 0-2 — this is what makes those three required.
class StepRefereesRules
{
    public static function rules(int $currentYear): array
    {
        $rules = [
            'form_data.referees_section.referees' => ['required', 'array', 'min:3'],
            'form_data.referees_section.referees.*.name' => ['nullable', 'string', 'max:255'],
            'form_data.referees_section.referees.*.position' => ['nullable', 'string', 'max:255'],
            'form_data.referees_section.referees.*.association' => ['nullable', 'string', 'max:255'],
            'form_data.referees_section.referees.*.institute' => ['nullable', 'string', 'max:255'],
            'form_data.referees_section.referees.*.email' => ['nullable', 'email', 'max:255'],
            'form_data.referees_section.referees.*.contact_code' => ['nullable', 'string', 'regex:/^\+?\d{1,4}$/'],
            'form_data.referees_section.referees.*.contact_number' => ['nullable', 'regex:/^\d{10}$/'],
        ];

        foreach ([0, 1, 2] as $i) {
            $rules["form_data.referees_section.referees.{$i}.name"] = ['required', 'string', 'max:255'];
            $rules["form_data.referees_section.referees.{$i}.position"] = ['required', 'string', 'max:255'];
            $rules["form_data.referees_section.referees.{$i}.association"] = ['required', 'string', 'max:255'];
            $rules["form_data.referees_section.referees.{$i}.institute"] = ['required', 'string', 'max:255'];
            $rules["form_data.referees_section.referees.{$i}.email"] = ['required', 'email', 'max:255'];
            $rules["form_data.referees_section.referees.{$i}.contact_number"] = ['required', 'regex:/^\d{10}$/'];
        }

        return $rules;
    }
}
