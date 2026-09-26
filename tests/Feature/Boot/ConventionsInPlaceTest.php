<?php

namespace Tests\Feature\Boot;

use App\Exceptions\DomainException;
use App\Exceptions\Handler;
use App\Exceptions\Reporter;
use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Applicant\DashboardController as ApplicantDashboardController;
use App\Http\Controllers\Applicant\ExportController;
use App\Http\Controllers\Applicant\WizardController;
use App\Http\Controllers\FileAccessController;
use App\Http\Controllers\Public\WelcomeController;
use App\Http\Middleware\AttachRequestId;
use App\Http\Requests\Admin\Ads\StoreAdvertisementRequest;
use App\Http\Requests\Admin\Ads\UpdateAdvertisementRequest;
use App\Http\Requests\Admin\Applications\UpdateStatusRequest;
use App\Http\Requests\Admin\Users\StoreDepartmentRequest;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateRoleRequest;
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
use App\Http\Requests\Applicant\SaveDraftRequest;
use App\Http\Requests\Applicant\SubmitApplicationRequest;
use App\Http\Requests\Applicant\ValidateStepRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Jobs\GenerateApplicationPdfJob;
use App\Services\Applications\DossierExporter;
use App\Services\Applications\DraftService;
use App\Services\Applications\SubmissionService;
use App\Services\Files\DossierFileStore;
use App\Services\Referees\RefereeNotificationDispatcher;
use App\Services\Reporting\DashboardAggregator;
use App\Support\ErrorCode;
use Tests\TestCase;

/**
 * Fails loudly if a later PR quietly moves or deletes a Phase 1 file. See
 * docs/architecture.md for what should live where.
 */
class ConventionsInPlaceTest extends TestCase
{
    public function test_error_framework_classes_exist(): void
    {
        $this->assertTrue(enum_exists(ErrorCode::class));
        $this->assertTrue(class_exists(DomainException::class));
        $this->assertTrue(class_exists(Handler::class));
        $this->assertTrue(class_exists(Reporter::class));
    }

    public function test_attach_request_id_middleware_is_registered(): void
    {
        $this->assertTrue(class_exists(AttachRequestId::class));

        $bootstrapSource = file_get_contents(base_path('bootstrap/app.php'));
        $this->assertStringContainsString('AttachRequestId::class', $bootstrapSource);
    }

    public function test_attach_request_id_sets_the_response_header(): void
    {
        // /login renders through the 'web' middleware group without touching
        // the database — unlike /up, which bypasses 'web' entirely and so
        // never carries AttachRequestId.
        $response = $this->get('/login');

        $response->assertHeader('X-Request-Id');
    }

    public function test_every_controller_in_the_conventions_exists(): void
    {
        foreach ([
            WizardController::class,
            ApplicantDashboardController::class,
            ExportController::class,
            AdminDashboardController::class,
            AdvertisementController::class,
            ApplicationController::class,
            UserController::class,
            DepartmentController::class,
            WelcomeController::class,
            FileAccessController::class,
        ] as $controller) {
            $this->assertTrue(class_exists($controller), "{$controller} should exist per docs/architecture.md");
        }
    }

    public function test_every_scaffolded_service_exists(): void
    {
        foreach ([
            SubmissionService::class,
            DraftService::class,
            DossierExporter::class,
            DossierFileStore::class,
            DashboardAggregator::class,
            RefereeNotificationDispatcher::class,
        ] as $service) {
            $this->assertTrue(class_exists($service), "{$service} should exist per docs/architecture.md");
        }
    }

    public function test_every_scaffolded_form_request_exists(): void
    {
        foreach ([
            SaveDraftRequest::class,
            ValidateStepRequest::class,
            SubmitApplicationRequest::class,
            StoreAdvertisementRequest::class,
            UpdateAdvertisementRequest::class,
            StoreUserRequest::class,
            UpdateRoleRequest::class,
            StoreDepartmentRequest::class,
            UpdateStatusRequest::class,
            RegisterRequest::class,
        ] as $formRequest) {
            $this->assertTrue(class_exists($formRequest), "{$formRequest} should exist per docs/architecture.md");
        }
    }

    public function test_every_step_rules_class_exists(): void
    {
        foreach ([
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
        ] as $rules) {
            $this->assertTrue(class_exists($rules), "{$rules} should exist per docs/wizard-steps.md");
            $this->assertTrue(method_exists($rules, 'rules'));
        }
    }

    public function test_generate_application_pdf_job_exists(): void
    {
        $this->assertTrue(class_exists(GenerateApplicationPdfJob::class));
    }
}
