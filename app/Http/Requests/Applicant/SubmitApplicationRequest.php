<?php

namespace App\Http\Requests\Applicant;

use App\Http\Requests\Applicant\Rules\StepAdditionalInfoRules;
use App\Http\Requests\Applicant\Rules\StepAwardsProjectsRules;
use App\Http\Requests\Applicant\Rules\StepDetailedPubsRules;
use App\Http\Requests\Applicant\Rules\StepDocumentsRules;
use App\Http\Requests\Applicant\Rules\StepEducationRules;
use App\Http\Requests\Applicant\Rules\StepEmploymentRules;
use App\Http\Requests\Applicant\Rules\StepPersonalRules;
use App\Http\Requests\Applicant\Rules\StepPositionRules;
use App\Http\Requests\Applicant\Rules\StepRefereesRules;
use App\Http\Requests\Applicant\Rules\StepResearchRules;
use App\Http\Requests\Applicant\Rules\StepStatementsRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

/**
 * Submit tier — strict, all 11 steps. Composes every Rules/Step{Name}Rules
 * class so it can never drift from ValidateStepRequest's per-step rules. See
 * docs/validation.md.
 */
class SubmitApplicationRequest extends FormRequest
{
    private const ALL_STEP_RULES = [
        StepPositionRules::class,
        StepPersonalRules::class,
        StepEducationRules::class,
        StepEmploymentRules::class,
        StepResearchRules::class,
        StepAdditionalInfoRules::class,
        StepAwardsProjectsRules::class,
        StepStatementsRules::class,
        StepDetailedPubsRules::class,
        StepRefereesRules::class,
        StepDocumentsRules::class,
    ];

    public function authorize(): bool
    {
        $advertisement = $this->route('advertisement');

        if (! $advertisement->is_active) {
            // TODO(Phase 3): replace with throw new DomainException(ErrorCode::APP_AD_INACTIVE)
            abort(422, 'This advertisement is no longer accepting applications.');
        }

        if ($advertisement->deadline && Carbon::parse($advertisement->deadline)->isPast()) {
            // TODO(Phase 3): replace with throw new DomainException(ErrorCode::APP_AD_DEADLINE_PASSED)
            abort(422, 'The deadline for this advertisement has passed.');
        }

        // Re-submit is intentionally allowed (a network retry or a user
        // double-clicking Submit shouldn't error) — WizardController's
        // isNewSubmission check is what keeps that idempotent, only
        // suppressing the duplicate mail dispatch. Blocking it outright
        // here would break that already-established behaviour; the
        // applicant is stopped from even reaching the form again by
        // showApplyForm() redirecting once status is 'submitted'.
        return true;
    }

    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return array_merge(
            ...array_map(fn (string $rules) => $rules::rules($currentYear), self::ALL_STEP_RULES)
        );
    }
}
