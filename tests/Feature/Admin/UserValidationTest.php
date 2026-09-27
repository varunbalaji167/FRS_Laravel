<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_admin_can_provision_an_hod_for_a_known_department(): void
    {
        Department::create(['name' => 'computer science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New Hod',
            'email' => 'newhod@iiti.ac.in',
            'role' => 'hod',
            'department' => 'computer science',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['email' => 'newhod@iiti.ac.in', 'role' => 'hod']);
    }

    public function test_store_user_rejects_a_non_institute_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New Hod',
            'email' => 'newhod@gmail.com',
            'role' => 'hod',
            'department' => 'computer science',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_store_user_rejects_an_hod_department_that_does_not_exist(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New Hod',
            'email' => 'newhod@iiti.ac.in',
            'role' => 'hod',
            'department' => 'Not A Real Department',
        ]);

        $response->assertSessionHasErrors('department');
    }

    public function test_admin_cannot_demote_their_own_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}/role", [
            'role' => 'applicant',
        ]);

        $response->assertStatus(403)->assertJson(['code' => 'ADMIN_SELF_DEMOTE_FORBIDDEN']);
        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_admin_self_demote_is_flashed_back_for_a_real_inertia_visit(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
            ->patch("/admin/users/{$admin->id}/role", ['role' => 'applicant']);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_update_role_rejects_an_invalid_role_value(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($admin)->patch("/admin/users/{$target->id}/role", [
            'role' => 'superuser',
        ]);

        $response->assertSessionHasErrors('role');
    }
}
