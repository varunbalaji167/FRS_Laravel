<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * department_id is an HOD-only attribute. Admins and applicants never carry
 * one, by default or otherwise.
 */
class UserDepartmentAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_factory_defaults_to_no_department(): void
    {
        $this->assertNull(User::factory()->create()->department_id);
        $this->assertNull(User::factory()->create(['role' => 'admin'])->department_id);
        $this->assertNull(User::factory()->create(['role' => 'applicant'])->department_id);
    }

    public function test_provisioning_an_admin_never_stores_a_department_even_if_one_is_submitted(): void
    {
        Department::firstOrCreate(['name' => 'Computer Science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New Admin',
            'email' => 'new.admin@iiti.ac.in',
            'role' => 'admin',
            'department' => 'Computer Science',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'new.admin@iiti.ac.in', 'department_id' => null]);
    }

    public function test_demoting_an_hod_to_applicant_clears_their_department(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $department = Department::firstOrCreate(['name' => 'Computer Science']);
        $hod = User::factory()->create(['role' => 'hod', 'department_id' => $department->id]);

        $this->actingAs($admin)->patch("/admin/users/{$hod->id}/role", ['role' => 'applicant']);

        $this->assertNull($hod->fresh()->department_id);
    }
}
