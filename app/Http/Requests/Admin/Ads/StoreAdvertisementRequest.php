<?php

namespace App\Http\Requests\Admin\Ads;

use App\Models\Department;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * `departments` is a name-keyed map, not a list, so withValidator() checks
 * the keys — Rule::exists only ever checks values.
 */
class StoreAdvertisementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reference_number' => ['required', 'string', 'max:255', 'unique:advertisements,reference_number'],
            'title' => ['required', 'string', 'max:255'],
            'deadline' => ['required', 'date', 'after:today'],
            'document' => ['required', 'file', 'mimes:pdf', 'max:5120'],
            'departments' => ['required', 'array', 'min:1'],
            'departments.*' => ['array', 'min:1'],
            'departments.*.*' => ['string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $departments = $this->input('departments', []);

            if (! is_array($departments)) {
                return;
            }

            $known = Department::pluck('name')->all();

            foreach (array_keys($departments) as $name) {
                if (! in_array($name, $known, true)) {
                    $validator->errors()->add('departments', "Unknown department: {$name}");
                }
            }
        });
    }
}
