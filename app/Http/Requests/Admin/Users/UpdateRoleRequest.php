<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // ADMIN_SELF_DEMOTE_FORBIDDEN is thrown from the controller, which
        // already has the route-bound $user to compare.
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(['admin', 'hod', 'applicant'])],
            'department' => ['required_if:role,hod', 'nullable', 'string', Rule::exists('departments', 'name')],
        ];
    }
}
