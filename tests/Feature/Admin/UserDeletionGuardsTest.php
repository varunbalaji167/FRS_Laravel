<?php

namespace Tests\Feature\Admin;

use App\Http\Middleware\CheckRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Guards on /admin/users delete and role-update. The last-admin guard is
 * unreachable under `role:admin`, so those tests drop the middleware.
 */
class UserDeletionGuardsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->deleteJson("/admin/users/{$admin->id}");

        $response->assertStatus(403)
            ->assertJson(['code' => 'ADMIN_SELF_DEMOTE_FORBIDDEN']);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        Mail::assertNothingSent();
    }

    public function test_deleting_the_last_admin_is_refused_with_the_user_last_admin_code(): void
    {
        $onlyAdmin = User::factory()->create(['role' => 'admin']);
        $actor = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($actor)
            ->withoutMiddleware(CheckRole::class)
            ->deleteJson("/admin/users/{$onlyAdmin->id}");

        $response->assertStatus(409)
            ->assertJson(['code' => 'USER_LAST_ADMIN']);
        $this->assertDatabaseHas('users', ['id' => $onlyAdmin->id]);
        Mail::assertNothingSent();
    }

    public function test_demoting_the_last_admin_is_refused_with_the_user_last_admin_code(): void
    {
        $onlyAdmin = User::factory()->create(['role' => 'admin']);
        $actor = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($actor)
            ->withoutMiddleware(CheckRole::class)
            ->patchJson("/admin/users/{$onlyAdmin->id}/role", ['role' => 'applicant']);

        $response->assertStatus(409)
            ->assertJson(['code' => 'USER_LAST_ADMIN']);
        $this->assertSame('admin', $onlyAdmin->fresh()->role);
    }
}
