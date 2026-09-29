<?php

namespace Database\Factories;

use App\Models\Advertisement;
use App\Models\Department;
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
            'departments' => ['Computer Science' => ['Assistant Professor Grade II']],
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Advertisement $advertisement) {
            $ids = collect(array_keys($advertisement->departments))
                ->map(fn ($name) => Department::firstOrCreate(['name' => $name])->id)
                ->all();

            $advertisement->departmentModels()->sync($ids);
        });
    }
}
