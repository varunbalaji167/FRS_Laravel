<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Draft tier — lax. Types and sizes only, no required checks; see
 * docs/validation.md. `uploaded_documents` is stripped so an applicant can't
 * spoof already-stored file paths through the draft endpoint, and the
 * serialised form_data payload is bounded so a runaway client can't write an
 * unbounded JSON blob into the row.
 */
class SaveDraftRequest extends FormRequest
{
    private const MAX_FORM_DATA_BYTES = 1024 * 1024;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $formData = $this->input('form_data', []);

        if (is_array($formData) && array_key_exists('uploaded_documents', $formData)) {
            unset($formData['uploaded_documents']);
            $this->merge(['form_data' => $formData]);
        }
    }

    public function rules(): array
    {
        return [
            'department' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:255'],
            'form_data' => [
                'nullable', 'array',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (is_array($value) && strlen(json_encode($value)) > self::MAX_FORM_DATA_BYTES) {
                        $fail('The application data is too large to save.');
                    }
                },
            ],
            'form_data.current_step' => ['nullable', 'integer', 'min:1', 'max:11'],
            'form_data.personal_details.profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ];
    }
}
