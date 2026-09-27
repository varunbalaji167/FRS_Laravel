<?php

namespace App\Http\Requests\Admin\Applications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusRequest extends FormRequest
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
            // 'draft' is excluded: it is not a valid admin/HOD transition,
            // and getScopedQuery() already hides draft rows.
            'status' => ['required', Rule::in(['submitted', 'shortlisted', 'rejected'])],
        ];
    }
}
