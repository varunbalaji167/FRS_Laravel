<?php

namespace App\Http\Requests\Admin\Ads;

use Illuminate\Foundation\Http\FormRequest;

// Not yet wired to a controller method — AdvertisementController has no
// update() endpoint today. Filled for symmetry with StoreAdvertisementRequest
// so it's ready the moment that endpoint lands.
class UpdateAdvertisementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference_number' => ['sometimes', 'required', 'string', 'max:255', 'unique:advertisements,reference_number,'.$this->route('advertisement')?->id],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'deadline' => ['sometimes', 'required', 'date', 'after:today'],
            'document' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'departments' => ['sometimes', 'required', 'array', 'min:1'],
            'departments.*' => ['array', 'min:1'],
            'departments.*.*' => ['string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
