<?php

namespace Tests\Feature\Files;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UnauthenticatedDownloadRejectedTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_instead_of_reading_the_file(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('applications/1/1/Final_Application_Form.pdf', 'pdf-bytes');

        $response = $this->get('/files/applications/1/1/Final_Application_Form.pdf');

        $response->assertRedirect(route('login'));
    }

    public function test_another_applicant_cannot_read_someone_elses_dossier_file(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => 'applicant']);
        $stranger = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();
        JobApplication::factory()->submitted()->create([
            'user_id' => $owner->id,
            'advertisement_id' => $advertisement->id,
        ]);

        $path = "applications/{$owner->id}/{$advertisement->id}/signature.png";
        Storage::disk('local')->put($path, 'fake-bytes');

        $response = $this->actingAs($stranger)->get("/files/{$path}");

        $response->assertNotFound();
    }

    public function test_owner_can_read_their_own_dossier_file(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();
        JobApplication::factory()->submitted()->create([
            'user_id' => $owner->id,
            'advertisement_id' => $advertisement->id,
        ]);

        $path = "applications/{$owner->id}/{$advertisement->id}/signature.png";
        Storage::disk('local')->put($path, 'fake-bytes');

        $response = $this->actingAs($owner)->get("/files/{$path}");

        $response->assertOk();
    }
}
