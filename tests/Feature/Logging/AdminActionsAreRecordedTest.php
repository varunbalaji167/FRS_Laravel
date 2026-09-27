<?php

namespace Tests\Feature\Logging;

use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * admin_actions is the Phase 6 audit trail for sensitive admin/HOD actions —
 * separate from application_status_events (Phase 4), which only covers the
 * status-transition case. See docs/architecture.md.
 */
class AdminActionsAreRecordedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_creating_a_user_records_an_admin_action(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Department::create(['name' => 'Computer Science']);

        $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New Hod',
            'email' => 'new.hod@iiti.ac.in',
            'role' => 'hod',
            'department' => 'Computer Science',
        ]);

        $user = User::where('email', 'new.hod@iiti.ac.in')->firstOrFail();

        $this->assertDatabaseHas('admin_actions', [
            'actor_id' => $admin->id,
            'action' => 'user.created',
            'subject_type' => $user->getMorphClass(),
            'subject_id' => $user->id,
        ]);
    }

    public function test_updating_a_role_records_before_and_after_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'hod', 'department' => 'Mechanical Engineering']);
        Department::create(['name' => 'Computer Science']);

        $this->actingAs($admin)->patch("/admin/users/{$target->id}/role", [
            'role' => 'hod',
            'department' => 'Computer Science',
        ]);

        $action = \App\Models\AdminAction::where('action', 'user.role_updated')
            ->where('subject_id', $target->id)
            ->firstOrFail();

        $this->assertSame('Mechanical Engineering', $action->before['department']);
        $this->assertSame('Computer Science', $action->after['department']);
    }

    public function test_deleting_a_user_records_an_admin_action(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'hod']);

        $this->actingAs($admin)->delete("/admin/users/{$target->id}");

        $this->assertDatabaseHas('admin_actions', [
            'actor_id' => $admin->id,
            'action' => 'user.deleted',
            'subject_id' => $target->id,
        ]);
    }

    public function test_department_crud_records_admin_actions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/departments', ['name' => 'Physics']);
        $department = Department::where('name', 'physics')->firstOrFail();

        $this->assertDatabaseHas('admin_actions', [
            'actor_id' => $admin->id,
            'action' => 'department.created',
            'subject_id' => $department->id,
        ]);

        $this->actingAs($admin)->delete("/admin/departments/{$department->id}");

        $this->assertDatabaseHas('admin_actions', [
            'actor_id' => $admin->id,
            'action' => 'department.deleted',
            'subject_id' => $department->id,
        ]);
    }

    public function test_status_update_records_an_admin_action_alongside_the_status_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $application = JobApplication::factory()->submitted()->create();

        $this->actingAs($admin)
            ->patch("/admin/applications/{$application->id}", ['status' => 'shortlisted']);

        $this->assertDatabaseHas('admin_actions', [
            'actor_id' => $admin->id,
            'action' => 'application.status_updated',
            'subject_id' => $application->id,
        ]);
    }
}
