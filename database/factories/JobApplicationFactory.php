<?php

namespace Database\Factories;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    protected $model = JobApplication::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'advertisement_id' => Advertisement::factory(),
            'department_id' => Department::firstOrCreate(['name' => 'Computer Science'])->id,
            'grade' => 'Assistant Professor',
            'form_data' => [
                'personal_details' => [
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                ],
            ],
            'status' => 'draft',
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }

    public function submitted(): static
    {
        return $this->state(['status' => 'submitted']);
    }
}
