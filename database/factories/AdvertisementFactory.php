<?php

namespace Database\Factories;

use App\Models\Advertisement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Advertisement>
 */
class AdvertisementFactory extends Factory
{
    protected $model = Advertisement::class;

    public function definition(): array
    {
        return [
            'reference_number' => 'REF-'.fake()->unique()->numerify('####'),
            'title' => fake()->jobTitle(),
            'document_path' => 'advertisements/sample.pdf',
            'deadline' => now()->addMonth(),
            'departments' => ['Computer Science'],
            'is_active' => true,
        ];
    }
}
