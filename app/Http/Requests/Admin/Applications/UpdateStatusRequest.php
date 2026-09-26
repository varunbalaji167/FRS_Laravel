<?php

namespace App\Http\Requests\Admin\Applications;

use Illuminate\Foundation\Http\FormRequest;

// TODO(Phase 2): fill in per docs/validation.md.
class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
