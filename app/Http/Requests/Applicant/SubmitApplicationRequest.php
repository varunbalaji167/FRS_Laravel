<?php

namespace App\Http\Requests\Applicant;

use App\Exceptions\DomainException;
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
use App\Models\JobApplication;
use App\Support\ErrorCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

/**
 * Submit tier — all 11 steps, composed from the same Rules/Step{Name}Rules
 * classes ValidateStepRequest uses, so the two can't drift.
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
            throw new DomainException(ErrorCode::APP_AD_INACTIVE);
        }

        if ($advertisement->deadline && Carbon::parse($advertisement->deadline)->isPast()) {
            throw new DomainException(ErrorCode::APP_AD_DEADLINE_PASSED);
        }

        // Fail fast before any upload is written to disk. SubmissionService
        // repeats this check under a row lock, which is the real race guard.
        $existing = JobApplication::where('user_id', $this->user()->id)
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($existing && $existing->status !== 'draft') {
            throw new DomainException(ErrorCode::APP_ALREADY_SUBMITTED, ['application_id' => $existing->id]);
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return array_merge(
            ...array_map(fn (string $rules) => $rules::rules($currentYear), self::ALL_STEP_RULES)
        );
    }
}
