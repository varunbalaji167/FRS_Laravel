<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_name_is_trimmed_and_lowercased_before_saving(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/departments', [
            'name' => '  Computer Science  ',
        ]);

        $this->assertDatabaseHas('departments', ['name' => 'computer science']);
        $this->assertDatabaseMissing('departments', ['name' => '  Computer Science  ']);
    }

    public function test_duplicate_department_name_is_rejected_case_insensitively(): void
    {
        Department::create(['name' => 'computer science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/departments', [
            'name' => 'Computer Science',
        ]);

        $response->assertSessionHasErrors('name');
    }
}
