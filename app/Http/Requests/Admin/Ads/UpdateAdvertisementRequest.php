<?php

namespace App\Http\Requests\Admin\Ads;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Backs the one editable field on an advertisement: its deadline. There is
 * no broader "edit advertisement" endpoint — reference number, title,
 * departments and the PDF are set once at creation.
 */
class UpdateAdvertisementRequest extends FormRequest
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
            'deadline' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}
