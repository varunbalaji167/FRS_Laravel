<?php

namespace Tests\Feature\Files;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileAccessScopeTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Advertisement $advertisement;

    private string $path;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->owner = User::factory()->create(['role' => 'applicant']);
        $this->advertisement = Advertisement::factory()->create();
        $this->path = "applications/{$this->owner->id}/{$this->advertisement->id}/cert.pdf";

        Storage::disk('local')->put($this->path, 'dossier');

        JobApplication::factory()->submitted()->create([
            'user_id' => $this->owner->id,
            'advertisement_id' => $this->advertisement->id,
            'department_id' => Department::firstOrCreate(['name' => 'Computer Science'])->id,
        ]);
    }

    public function test_the_owner_can_download_their_own_file(): void
    {
        $this->actingAs($this->owner)->get("/files/{$this->path}")->assertOk();
    }

    public function test_an_hod_from_another_department_gets_404(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'department_id' => Department::firstOrCreate(['name' => 'Mechanical Engineering'])->id,
        ]);

        $this->actingAs($hod)->get("/files/{$this->path}")->assertNotFound();
    }

    public function test_an_hod_from_the_same_department_can_download(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'department_id' => Department::firstOrCreate(['name' => 'Computer Science'])->id,
        ]);

        $this->actingAs($hod)->get("/files/{$this->path}")->assertOk();
    }

    public function test_another_applicant_gets_404(): void
    {
        $stranger = User::factory()->create(['role' => 'applicant']);

        $this->actingAs($stranger)->get("/files/{$this->path}")->assertNotFound();
    }

    public function test_a_traversal_path_is_refused(): void
    {
        $this->actingAs($this->owner)
            ->get("/files/applications/{$this->owner->id}/../../../.env")
            ->assertNotFound();
    }

    public function test_a_draft_dossier_file_is_hidden_from_staff(): void
    {
        $draftOwner = User::factory()->create(['role' => 'applicant']);
        $path = "applications/{$draftOwner->id}/{$this->advertisement->id}/cert.pdf";
        Storage::disk('local')->put($path, 'draft');

        JobApplication::factory()->draft()->create([
            'user_id' => $draftOwner->id,
            'advertisement_id' => $this->advertisement->id,
            'department_id' => Department::firstOrCreate(['name' => 'Computer Science'])->id,
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get("/files/{$path}")->assertNotFound();
        $this->actingAs($draftOwner)->get("/files/{$path}")->assertOk();
    }
}
