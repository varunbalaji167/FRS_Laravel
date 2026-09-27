<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            // Only admin/hod accounts are provisioned here (see `role` rule below),
            // so the institute-email requirement always applies.
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email', 'ends_with:iiti.ac.in'],
            'role' => ['required', Rule::in(['admin', 'hod'])],
            'department' => ['required_if:role,hod', 'nullable', 'string', Rule::exists('departments', 'name')],
        ];
    }
}
