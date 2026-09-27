<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The master profile and the wizard's Step 2 used to offer different values
 * for gender ("Other" vs "Transgender"/"Prefer not to say") and category
 * ("General" vs "UR"). A profile saved with the old value passed the wizard's
 * client-side check (a non-empty string) but failed its server-side
 * Rule::in — see resources/js/lib/profileFieldMapping.js.
 */
class ProfileGenderCategoryValuesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_profile_saved_before_this_fix_can_still_be_resaved_unchanged(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile', ['name' => $user->name, 'gender' => 'Other', 'category' => 'General'])
            ->assertSessionHasNoErrors();

        $this->assertSame('Other', $user->applicantProfile->fresh()->gender);
        $this->assertSame('General', $user->applicantProfile->fresh()->category);
    }

    public function test_the_profile_form_accepts_the_wizards_canonical_values(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile', ['name' => $user->name, 'gender' => 'Transgender', 'category' => 'UR'])
            ->assertSessionHasNoErrors();
    }
}
