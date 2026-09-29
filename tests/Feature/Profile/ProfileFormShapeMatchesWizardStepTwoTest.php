<?php

namespace Tests\Feature\Profile;

use App\Http\Requests\Applicant\Rules\StepPersonalRules;
use App\Http\Requests\ProfileUpdateRequest;
use Tests\TestCase;

/**
 * Structural regression guard: the profile's personal-details fields and the
 * wizard's Step 2 fields are supposed to mirror each other exactly (see
 * docs/FRS_Maintenance.md). This test introspects both rule sets so future
 * drift between them fails here instead of silently reappearing as a 422 a
 * user hits on "Copy from Profile".
 */
class ProfileFormShapeMatchesWizardStepTwoTest extends TestCase
{
    /**
     * Wizard `form_data.personal_details.*` key => equivalent
     * `ApplicantProfile` / `ProfileUpdateRequest` key.
     *
     * `email` has no profile equivalent by design — it's the account's login
     * email (tied to Google/local auth), never user-editable through
     * `ProfileUpdateRequest`. Every other key is an identical name on both
     * sides.
     *
     * @var array<string, string|null>
     */
    private const FIELD_ALIASES = [
        'profile_image' => 'profile_image',
        'first_name' => 'first_name',
        'middle_name' => 'middle_name',
        'last_name' => 'last_name',
        'fathers_name' => 'fathers_name',
        'dob' => 'dob',
        'gender' => 'gender',
        'marital_status' => 'marital_status',
        'category' => 'category',
        'nationality' => 'nationality',
        'id_proof_type' => 'id_proof_type',
        'id_proof_number' => 'id_proof_number',
        'corr_address' => 'corr_address',
        'corr_city' => 'corr_city',
        'corr_state' => 'corr_state',
        'corr_country' => 'corr_country',
        'corr_pincode' => 'corr_pincode',
        'perm_address' => 'perm_address',
        'perm_city' => 'perm_city',
        'perm_state' => 'perm_state',
        'perm_country' => 'perm_country',
        'perm_pincode' => 'perm_pincode',
        'email' => null,
        'alt_email' => 'alt_email',
        'phone_code' => 'phone_code',
        'phone' => 'phone',
        'alt_phone_code' => 'alt_phone_code',
        'alt_phone' => 'alt_phone',
    ];

    /**
     * Fields whose `Rule::in` value sets must match exactly on both sides.
     *
     * @var list<string>
     */
    private const SHARED_ENUM_FIELDS = ['gender', 'category', 'marital_status', 'nationality', 'id_proof_type'];

    private const PROFESSIONAL_FIELDS = [
        'designation', 'affiliation', 'google_scholar_url', 'orcid_url', 'linkedin_url', 'github_url',
    ];

    public function test_every_wizard_step_2_field_has_an_editable_profile_equivalent(): void
    {
        $profileRules = (new ProfileUpdateRequest)->rules();
        $wizardRules = StepPersonalRules::rules(now()->year);

        foreach ($this->wizardFieldNames($wizardRules) as $wizardField) {
            $this->assertArrayHasKey(
                $wizardField,
                self::FIELD_ALIASES,
                "Wizard field '{$wizardField}' has no alias entry — add one to FIELD_ALIASES (or null it out with a reason)."
            );

            $profileField = self::FIELD_ALIASES[$wizardField];

            if ($profileField === null) {
                continue;
            }

            $this->assertArrayHasKey(
                $profileField,
                $profileRules,
                "Wizard field '{$wizardField}' has no editable equivalent in ProfileUpdateRequest::rules() ('{$profileField}')."
            );
        }
    }

    public function test_shared_enum_fields_use_identical_value_sets(): void
    {
        $profileRules = (new ProfileUpdateRequest)->rules();
        $wizardRules = StepPersonalRules::rules(now()->year);

        foreach (self::SHARED_ENUM_FIELDS as $field) {
            $profileValues = $this->inValues($profileRules[$field] ?? []);
            $wizardValues = $this->inValues($wizardRules["form_data.personal_details.{$field}"] ?? []);

            $this->assertNotEmpty($profileValues, "Profile field '{$field}' has no Rule::in — expected a shared enum.");
            $this->assertNotEmpty($wizardValues, "Wizard field '{$field}' has no Rule::in — expected a shared enum.");

            sort($profileValues);
            sort($wizardValues);

            $this->assertSame(
                $wizardValues,
                $profileValues,
                "Profile and wizard Rule::in value sets for '{$field}' have diverged."
            );
        }
    }

    public function test_professional_fields_are_profile_only_and_excluded_from_wizard_step_2(): void
    {
        $profileRules = (new ProfileUpdateRequest)->rules();
        $wizardFields = $this->wizardFieldNames(StepPersonalRules::rules(now()->year));

        foreach (self::PROFESSIONAL_FIELDS as $field) {
            $this->assertArrayHasKey($field, $profileRules, "Professional field '{$field}' should stay on the profile.");
            $this->assertNotContains($field, $wizardFields, "Professional field '{$field}' must not participate in the wizard's Step 2.");
        }
    }

    /**
     * @param  array<string, mixed>  $wizardRules
     * @return list<string>
     */
    private function wizardFieldNames(array $wizardRules): array
    {
        return array_values(array_map(
            static fn (string $key) => str_replace('form_data.personal_details.', '', $key),
            array_keys($wizardRules)
        ));
    }

    /**
     * Extract the accepted values out of a `Rule::in(...)` inside a rule set,
     * regardless of where in the array it sits.
     *
     * @return list<string>
     */
    private function inValues(mixed $rules): array
    {
        if (! is_array($rules)) {
            return [];
        }

        foreach ($rules as $rule) {
            if (is_object($rule) && str_starts_with((string) $rule, 'in:')) {
                $encoded = substr((string) $rule, 3);
                preg_match_all('/"((?:[^"]|"")*)"/', $encoded, $matches);

                return array_map(
                    static fn (string $value) => str_replace('""', '"', $value),
                    $matches[1]
                );
            }
        }

        return [];
    }
}
