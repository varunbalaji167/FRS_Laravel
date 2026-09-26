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

    public function rules(): array
    {
        return [
            // 'draft' is intentionally excluded — draft -> * is not a valid
            // admin/HOD transition, and getScopedQuery() already excludes
            // draft rows from the query this status update runs against.
            'status' => ['required', Rule::in(['submitted', 'shortlisted', 'rejected'])],
        ];
    }
}
