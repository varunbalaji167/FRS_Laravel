<?php

namespace Tests\Feature\Admin;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdvertisementValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_an_advertisement_with_valid_departments(): void
    {
        Storage::fake('public');
        Department::create(['name' => 'computer science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/jobs', [
            'reference_number' => 'REF-0001',
            'title' => 'Assistant Professor',
            'deadline' => now()->addMonth()->toDateString(),
            'document' => UploadedFile::fake()->create('ad.pdf', 100, 'application/pdf'),
            'departments' => ['computer science' => ['Assistant Professor']],
        ]);

        $response->assertRedirect(route('admin.jobs.create'));
        $this->assertDatabaseHas('advertisements', ['reference_number' => 'REF-0001']);
    }

    public function test_store_rejects_an_unknown_department(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/jobs', [
            'reference_number' => 'REF-0002',
            'title' => 'Assistant Professor',
            'deadline' => now()->addMonth()->toDateString(),
            'document' => UploadedFile::fake()->create('ad.pdf', 100, 'application/pdf'),
            'departments' => ['Not A Real Department' => ['Assistant Professor']],
        ]);

        $response->assertSessionHasErrors('departments');
    }

    public function test_store_rejects_a_deadline_that_is_not_in_the_future(): void
    {
        Storage::fake('public');
        Department::create(['name' => 'computer science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/jobs', [
            'reference_number' => 'REF-0003',
            'title' => 'Assistant Professor',
            'deadline' => now()->subDay()->toDateString(),
            'document' => UploadedFile::fake()->create('ad.pdf', 100, 'application/pdf'),
            'departments' => ['computer science' => ['Assistant Professor']],
        ]);

        $response->assertSessionHasErrors('deadline');
    }

    public function test_store_rejects_a_non_pdf_document(): void
    {
        Storage::fake('public');
        Department::create(['name' => 'computer science']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/jobs', [
            'reference_number' => 'REF-0004',
            'title' => 'Assistant Professor',
            'deadline' => now()->addMonth()->toDateString(),
            'document' => UploadedFile::fake()->create('ad.docx', 100, 'application/msword'),
            'departments' => ['computer science' => ['Assistant Professor']],
        ]);

        $response->assertSessionHasErrors('document');
    }

    public function test_admin_can_change_an_advertisements_deadline_at_any_time(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $advertisement = Advertisement::factory()->create(['deadline' => now()->addWeek()]);
        $newDeadline = now()->addMonths(2)->toDateString();

        $response = $this->actingAs($admin)
            ->patch("/admin/jobs/{$advertisement->id}/deadline", ['deadline' => $newDeadline]);

        $response->assertRedirect(route('admin.jobs.index'));
        $this->assertSame($newDeadline, $advertisement->fresh()->deadline->toDateString());
    }

    public function test_extending_a_lapsed_deadline_reactivates_the_advertisement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $advertisement = Advertisement::factory()->create(['deadline' => now()->subWeek()]);

        $this->assertFalse($advertisement->is_active);

        $this->actingAs($admin)->patch("/admin/jobs/{$advertisement->id}/deadline", [
            'deadline' => now()->addWeek()->toDateString(),
        ]);

        $this->assertTrue($advertisement->fresh()->is_active);
    }

    public function test_deadline_update_rejects_a_date_in_the_past(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $advertisement = Advertisement::factory()->create(['deadline' => now()->addWeek()]);

        $response = $this->actingAs($admin)->patch("/admin/jobs/{$advertisement->id}/deadline", [
            'deadline' => now()->subDay()->toDateString(),
        ]);

        $response->assertSessionHasErrors('deadline');
    }
}
