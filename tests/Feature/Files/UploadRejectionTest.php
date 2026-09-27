<?php

namespace Tests\Feature\Files;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadRejectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_a_wrong_file_type_reports_file_mime_rejected(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/draft", [
                'form_data' => [
                    'personal_details' => [
                        'profile_image' => UploadedFile::fake()->create('resume.pdf', 20, 'application/pdf'),
                    ],
                ],
            ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'FILE_MIME_REJECTED');
    }

    public function test_an_oversized_image_is_rejected_before_it_is_stored(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/draft", [
                'form_data' => [
                    'personal_details' => [
                        'profile_image' => UploadedFile::fake()->image('huge.jpg')->size(4096),
                    ],
                ],
            ])
            ->assertStatus(422);

        $this->assertEmpty(Storage::disk('local')->allFiles());
    }

    public function test_a_body_over_post_max_size_reports_file_too_large(): void
    {
        // ValidatePostSize is what throws this in production; CLI PHP has no
        // post_max_size to exceed, so the route raises it directly.
        Route::middleware('web')->post('/__test/post-too-large', function () {
            throw new PostTooLargeException;
        });

        $this->postJson('/__test/post-too-large')
            ->assertStatus(413)
            ->assertJsonPath('code', 'FILE_TOO_LARGE');
    }
}
