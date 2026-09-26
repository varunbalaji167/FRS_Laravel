<?php

namespace App\Http\Requests\Applicant\Rules;

// Composed by both ValidateStepRequest (single step) and
// SubmitApplicationRequest (all steps). See docs/validation.md.
class StepAwardsProjectsRules
{
    public static function rules(int $currentYear): array
    {
        $supervisionRow = fn (string $prefix) => [
            "form_data.awards_projects.{$prefix}" => ['nullable', 'array'],
            "form_data.awards_projects.{$prefix}.*.student_name" => ['nullable', 'string', 'max:255'],
            "form_data.awards_projects.{$prefix}.*.title" => ['nullable', 'string', 'max:500'],
            "form_data.awards_projects.{$prefix}.*.role" => ['nullable', 'string', 'max:100'],
            "form_data.awards_projects.{$prefix}.*.status" => ['nullable', 'string', 'max:100'],
            "form_data.awards_projects.{$prefix}.*.year" => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
        ];

        $projectRow = fn (string $prefix) => [
            "form_data.awards_projects.{$prefix}" => ['nullable', 'array'],
            "form_data.awards_projects.{$prefix}.*.agency" => ['nullable', 'string', 'max:255'],
            "form_data.awards_projects.{$prefix}.*.title" => ['nullable', 'string', 'max:500'],
            "form_data.awards_projects.{$prefix}.*.amount" => ['nullable', 'regex:/^\d*\.?\d*$/'],
            "form_data.awards_projects.{$prefix}.*.period" => ['nullable', 'string', 'max:100'],
            "form_data.awards_projects.{$prefix}.*.role" => ['nullable', 'string', 'max:100'],
            "form_data.awards_projects.{$prefix}.*.status" => ['nullable', 'string', 'max:100'],
        ];

        return array_merge(
            [
                'form_data.awards_projects.awards' => ['nullable', 'array'],
                'form_data.awards_projects.awards.*.name' => ['nullable', 'string', 'max:255'],
                'form_data.awards_projects.awards.*.awarded_by' => ['nullable', 'string', 'max:255'],
                'form_data.awards_projects.awards.*.year' => ['nullable', 'integer', 'min:1950', 'max:'.$currentYear],
            ],
            $supervisionRow('phd_supervision'),
            $supervisionRow('pg_supervision'),
            $supervisionRow('ug_supervision'),
            $projectRow('sponsored_projects'),
            $projectRow('consultancy_projects'),
        );
    }
}
