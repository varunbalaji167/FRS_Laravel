<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\ApplicationController;
use App\Mail\ApplicationSubmitted;
use App\Mail\RefereeNotification;
use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RecruitmentController extends Controller
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Simple email format check reused by multiple methods. */
    private function isValidEmail(?string $email): bool
    {
        return $email !== null && filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Build the validation error array for a single wizard step.
     * Returns an associative array of [ field_key => message ].
     * Keys deliberately mirror the frontend localErrors keys so the frontend
     * can merge them directly without any mapping.
     */
    private function errorsForStep(int $step, Request $request): array
    {
        $errors = [];
        $formData = $request->input('form_data', []);

        switch ($step) {
            // -----------------------------------------------------------------
            case 1:
                if (empty(trim((string) $request->input('department')))) {
                    $errors['department'] = 'Department is required.';
                }
                if (empty(trim((string) $request->input('grade')))) {
                    $errors['grade'] = 'Grade is required.';
                }
                break;

                // -----------------------------------------------------------------
            case 2:
                $p = $formData['personal_details'] ?? [];

                if (empty(trim((string) ($p['first_name'] ?? '')))) {
                    $errors['first_name'] = 'First name is required.';
                }
                if (empty(trim((string) ($p['last_name'] ?? '')))) {
                    $errors['last_name'] = 'Last name is required.';
                }
                if (empty($p['dob'] ?? '')) {
                    $errors['dob'] = 'Date of birth is required.';
                } elseif (strtotime($p['dob']) === false) {
                    $errors['dob'] = 'Invalid date of birth.';
                }
                if (empty($p['gender'] ?? '')) {
                    $errors['gender'] = 'Gender is required.';
                }
                if (empty($p['category'] ?? '')) {
                    $errors['category'] = 'Category is required.';
                }
                if (empty($p['nationality'] ?? '')) {
                    $errors['nationality'] = 'Nationality is required.';
                }
                $email = $p['email'] ?? '';
                if (empty(trim((string) $email))) {
                    $errors['email'] = 'Email is required.';
                } elseif (! $this->isValidEmail($email)) {
                    $errors['email'] = 'Invalid email format.';
                }
                // Alt email — only check format if present
                $altEmail = $p['alt_email'] ?? '';
                if (! empty(trim((string) $altEmail)) && ! $this->isValidEmail($altEmail)) {
                    $errors['alt_email'] = 'Invalid alternate email format.';
                }
                // Phone — strip non-digits and check length
                $phone = preg_replace('/\D/', '', (string) ($p['phone'] ?? ''));
                if (strlen($phone) < 10) {
                    $errors['phone'] = '10-digit phone number required.';
                }
                break;

                // -----------------------------------------------------------------
            case 3:
                $phd = $formData['education']['phd'] ?? [];

                if (empty(trim((string) ($phd['university'] ?? '')))) {
                    $errors['phd.university'] = 'University is required.';
                }
                if (empty(trim((string) ($phd['department'] ?? '')))) {
                    $errors['phd.department'] = 'Department is required.';
                }

                $dateJoining = $phd['date_joining'] ?? '';

                if (empty($dateJoining)) {
                    $errors['phd.date_joining'] = 'Year of joining is required.';
                } elseif (
                    ! is_numeric($dateJoining) ||
                    (int) $dateJoining < 1950 ||
                    (int) $dateJoining > (int) date('Y')
                ) {
                    $errors['phd.date_joining'] = 'Enter a valid year.';
                }
                break;

                // -----------------------------------------------------------------
            case 4:
                $emp = $formData['employment'] ?? [];
                $present = $emp['present'] ?? [];

                if (empty(trim((string) ($present['position'] ?? '')))) {
                    $errors['present.position'] = 'Position is required.';
                }
                if (empty(trim((string) ($present['organization'] ?? '')))) {
                    $errors['present.organization'] = 'Organization is required.';
                }
                if (empty($present['date_joining'] ?? '')) {
                    $errors['present.date_joining'] = 'Date of joining is required.';
                } elseif (strtotime($present['date_joining']) === false) {
                    $errors['present.date_joining'] = 'Invalid date.';
                }
                if (empty($emp['has_three_years_exp'] ?? '')) {
                    $errors['emp.has_three_years_exp'] = 'Please select Yes or No.';
                }
                break;

                // -----------------------------------------------------------------
            case 5:
                $spec = $formData['research']['specialization'] ?? [];

                if (empty(trim((string) ($spec['area_of_specialization'] ?? '')))) {
                    $errors['spec.area'] = 'Area of Specialization is required.';
                }
                if (empty(trim((string) ($spec['current_area_of_research'] ?? '')))) {
                    $errors['spec.current'] = 'Current Area of Research is required.';
                }
                break;

                // -----------------------------------------------------------------
            case 8:
                $statements = $formData['statements'] ?? [];

                if (empty(trim((string) ($statements['research_plan'] ?? '')))) {
                    $errors['statements.research_plan'] =
                        'Research contribution & future plans are required.';
                }
                if (empty(trim((string) ($statements['teaching_plan'] ?? '')))) {
                    $errors['statements.teaching_plan'] =
                        'Teaching contribution & future plans are required.';
                }
                break;

                // -----------------------------------------------------------------
            case 10:
                $refs = $formData['referees_section']['referees'] ?? [];

                if (count($refs) < 3) {
                    $errors['referees'] = 'You must provide at least 3 referees.';
                    break;
                }

                $hasFieldErrors = false;
                foreach ($refs as $i => $r) {
                    $mandatory = $i < 3;

                    if ($mandatory && empty(trim((string) ($r['name'] ?? '')))) {
                        $errors["referee_{$i}_name"] = 'Name is required.';
                        $hasFieldErrors = true;
                    }
                    if ($mandatory && empty(trim((string) ($r['position'] ?? '')))) {
                        $errors["referee_{$i}_position"] = 'Position is required.';
                        $hasFieldErrors = true;
                    }
                    if ($mandatory && empty(trim((string) ($r['association'] ?? '')))) {
                        $errors["referee_{$i}_association"] = 'Association is required.';
                        $hasFieldErrors = true;
                    }
                    if ($mandatory && empty(trim((string) ($r['institute'] ?? '')))) {
                        $errors["referee_{$i}_institute"] = 'Institute is required.';
                        $hasFieldErrors = true;
                    }
                    $refEmail = $r['email'] ?? '';
                    if ($mandatory && empty(trim((string) $refEmail))) {
                        $errors["referee_{$i}_email"] = 'Email is required.';
                        $hasFieldErrors = true;
                    } elseif (! empty(trim((string) $refEmail)) && ! $this->isValidEmail($refEmail)) {
                        $errors["referee_{$i}_email"] = 'Invalid email format.';
                        $hasFieldErrors = true;
                    }
                    $contactNumber = preg_replace('/\D/', '', (string) ($r['contact_number'] ?? ''));
                    if ($mandatory && strlen($contactNumber) === 0) {
                        $errors["referee_{$i}_contact"] = 'Contact number is required.';
                        $hasFieldErrors = true;
                    } elseif (strlen($contactNumber) > 0 && strlen($contactNumber) !== 10) {
                        $errors["referee_{$i}_contact"] = 'Phone must be exactly 10 digits.';
                        $hasFieldErrors = true;
                    }
                }

                if ($hasFieldErrors) {
                    $errors['referees'] =
                        'Please fill all required fields for at least 3 referees.';
                }
                break;

                // Steps 6, 7, 9 have no mandatory fields — nothing to validate here.
        }

        return $errors;
    }

    // PUBLIC ROUTES

    /**
     * Dashboard: Display active advertisements.
     */
    public function index()
    {
        $advertisements = Advertisement::where('is_active', true)->latest()->get();
        $submittedAdvtIds = [];
        $draftAdvtIds = [];

        if (Auth::check()) {
            $applications = JobApplication::where('user_id', Auth::id())
                ->get(['advertisement_id', 'status']);

            foreach ($applications as $app) {
                // Treat submitted, shortlisted, and rejected all as "Locked" applications
                if (in_array($app->status, ['submitted', 'shortlisted', 'rejected'])) {
                    $submittedAdvtIds[] = $app->advertisement_id;
                } elseif ($app->status === 'draft') {
                    $draftAdvtIds[] = $app->advertisement_id;
                }
            }
        }

        return Inertia::render('Dashboard', [
            'advertisements' => $advertisements,
            'submittedAdvtIds' => $submittedAdvtIds,
            'draftAdvtIds' => $draftAdvtIds,
        ]);
    }

    /**
     * Applicant: View their own application list.
     */
    public function myApplications()
    {
        $applications = JobApplication::with('advertisement')
            ->where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'advertisement' => $app->advertisement,
                    'department' => $app->department,
                    'grade' => $app->grade,
                    'status' => $app->status,
                    'current_step' => $app->form_data['current_step'] ?? 1,
                    'updated_at' => $app->updated_at->format('M d, Y - h:i A'),
                    'has_pdf' => $app->status === 'submitted',
                    'pdf_url' => $app->status === 'submitted'
                        ? route('applicant.applications.export.pdf', $app->id)
                        : null,
                ];
            });

        return Inertia::render('Applicant/MyApplications', [
            'applications' => $applications,
        ]);
    }

    /**
     * Applicant: View their detailed read-only application.
     */
    public function show($id)
    {
        $application = JobApplication::with('advertisement')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Applicant/ApplicationShow', [
            'application' => $application,
        ]);
    }

    /**
     * Applicant: Securely export their own PDF.
     */
    public function exportPdf($id)
    {
        $application = JobApplication::with(['user', 'advertisement'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $data = $application->form_data;
        $p = $data['personal_details'] ?? [];

        $pdf = Pdf::loadView('pdf.application_format', [
            'application' => $application,
            'advertisement' => $application->advertisement,
            'data' => $data,
        ]);

        $safeRef = str_replace(['/', '\\'], '_', $application->advertisement->reference_number ?? 'Ref');
        $name = str_replace(' ', '_', $p['first_name'] ?? 'Applicant');
        $fileName = "Application_{$name}_{$safeRef}.pdf";

        return $pdf->stream($fileName);
    }

    /**
     * Applicant: Securely export their own Excel data.
     */
    public function exportExcel(Request $request, $id) // 1. Inject the Request here
    {
        // Ensure the applicant actually owns this application
        $application = JobApplication::where('user_id', Auth::id())->findOrFail($id);

        // 2. Pass both $request and $id to the target controller
        return app(ApplicationController::class)->exportExcel($request, $id);
    }

    /**
     * Show the application form wizard.
     */
    public function showApplyForm(Advertisement $advertisement)
    {
        $application = JobApplication::where('user_id', Auth::id())
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($application && $application->status === 'submitted') {
            return redirect()->route('dashboard')
                ->with('error', 'Application already submitted for this position.');
        }

        return Inertia::render('Applicant/ApplyForm', [
            'advertisement' => $advertisement,
            'existingDraft' => $application ? $application->form_data : null,
            'existingDepartment' => $application ? $application->department : '',
            'existingGrade' => $application ? $application->grade : '',
        ]);
    }

    // SAVE AS DRAFT — No required-field validation; just persist.

    public function saveDraft(Request $request, Advertisement $advertisement)
    {
        $data = collect($request->only(['department', 'grade']))
            ->map(fn ($value) => $value ?? '')
            ->all();

        $formData = $request->input('form_data', []);

        if ($request->hasFile('form_data.personal_details.profile_image')) {
            $path = $request->file('form_data.personal_details.profile_image')
                ->store('applications/'.Auth::id()."/{$advertisement->id}/photos", 'public');
            $formData['personal_details']['profile_image'] = $path;
        }

        JobApplication::updateOrCreate(
            ['user_id' => Auth::id(), 'advertisement_id' => $advertisement->id],
            array_merge($data, [
                'form_data' => $formData,
                'status' => 'draft',
            ])
        );

        return redirect()->back();
    }

    // PER-STEP BACKEND VALIDATION (optional/future use).
    // All step rules are pure data checks that the frontend already enforces,
    // so this endpoint is NOT called during normal wizard navigation — backend
    // validation fires in full on submitApplication (the real security boundary).
    //
    // Keep this method available if you later add steps that require DB lookups
    // (e.g. email uniqueness). To enable, add to web.php:
    //   Route::post('/jobs/{advertisement}/validate-step',
    //       [RecruitmentController::class, 'validateStep'])
    //       ->name('applicant.validateStep')->middleware('auth');

    public function validateStep(Request $request, Advertisement $advertisement): JsonResponse
    {
        // Basic sanity: step must be a valid integer
        $step = (int) $request->input('step', 0);
        if ($step < 1 || $step > 11) {
            return response()->json(['valid' => false, 'errors' => ['step' => 'Invalid step.']], 422);
        }

        $errors = $this->errorsForStep($step, $request);

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors,
        ], empty($errors) ? 200 : 422);
    }
    // FINAL SUBMIT — Full server-side validation across every required step.

    public function submitApplication(Request $request, Advertisement $advertisement)
    {
        // ── Top-level required fields
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'grade' => 'required|string|max:255',
            'form_data' => 'required|array',
        ]);

        $user = Auth::user();
        $formData = $validated['form_data'];

        // ── Deep validation — mirror every frontend required field check
        $allErrors = [];
        foreach ([1, 2, 3, 4, 5, 8, 10] as $step) {
            $stepErrors = $this->errorsForStep($step, $request);
            $allErrors = array_merge($allErrors, $stepErrors);
        }

        // Declaration is required
        if (empty($formData['declaration'])) {
            $allErrors['declaration'] = 'You must agree to the final declaration.';
        }

        // Required file uploads presence checks
        if (! $request->hasFile('documents.phd_cert')) {
            $allErrors['phd_cert'] = 'PhD Certificate is required.';
        }
        if (! $request->hasFile('documents.ssc_cert')) {
            $allErrors['ssc_cert'] = '10th/SSC Certificate is required.';
        }
        if (! $request->hasFile('documents.signature')) {
            $allErrors['signature'] = 'Digital signature is required.';
        }

        // If any required fields are missing, return immediately before checking file sizes
        if (! empty($allErrors)) {
            return back()->withErrors($allErrors)->withInput();
        }

        // ── File size & MIME validation for general documents & signature
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                if (! $file->isValid()) {
                    return back()->withErrors([$key => 'Uploaded file is invalid.'])->withInput();
                }

                // Exception: Handle the Signature (Image) differently than the PDFs
                if ($key === 'signature') {
                    if (! in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/jpg'])) {
                        return back()->withErrors(['signature' => 'Only JPG/PNG images are accepted for signatures.'])->withInput();
                    }
                    if ($file->getSize() > 2 * 1024 * 1024) {
                        return back()->withErrors(['signature' => 'Signature must be smaller than 2 MB.'])->withInput();
                    }

                    continue; // Skip the PDF checks below for the signature
                }

                // Normal PDF Document checks
                if ($file->getMimeType() !== 'application/pdf') {
                    return back()->withErrors([$key => 'Only PDF files are accepted.'])->withInput();
                }
                if ($file->getSize() > 10 * 1024 * 1024) {
                    return back()->withErrors([$key => 'File must be smaller than 10 MB.'])->withInput();
                }
            }
        }

        // ── Best papers validation
        if ($request->hasFile('best_papers')) {
            foreach ($request->file('best_papers') as $key => $file) {
                if (! $file->isValid()) {
                    return back()->withErrors([$key => 'Uploaded paper is invalid.'])->withInput();
                }
                if ($file->getMimeType() !== 'application/pdf') {
                    return back()->withErrors([$key => 'Only PDF files are accepted for papers.'])->withInput();
                }
                if ($file->getSize() > 10 * 1024 * 1024) {
                    return back()->withErrors([$key => 'Paper file must be smaller than 10 MB.'])->withInput();
                }
            }
        }

        $documentPaths = $formData['uploaded_documents'] ?? [];

        // ── Profile image validation & storage
        if ($request->hasFile('form_data.personal_details.profile_image')) {
            $imgFile = $request->file('form_data.personal_details.profile_image');
            if (! in_array($imgFile->getMimeType(), ['image/jpeg', 'image/png', 'image/jpg'])) {
                return back()->withErrors(['profile_image' => 'Only JPG/PNG images are accepted.'])->withInput();
            }
            if ($imgFile->getSize() > 2 * 1024 * 1024) {
                return back()->withErrors(['profile_image' => 'Profile photo must be smaller than 2 MB.'])->withInput();
            }
            $path = $imgFile->store("applications/{$user->id}/{$advertisement->id}/photos", 'public');
            $formData['personal_details']['profile_image'] = $path;
        }

        // ── Saving Supporting Documents & Signature
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                $documentPaths[$key] = $file->store(
                    "applications/{$user->id}/{$advertisement->id}", 'public'
                );
            }
        }

        // ── Saving Best Papers
        if ($request->hasFile('best_papers')) {
            foreach ($request->file('best_papers') as $key => $file) {
                $documentPaths[$key] = $file->store(
                    "applications/{$user->id}/{$advertisement->id}/best_papers", 'public'
                );
            }
        }

        $formData['uploaded_documents'] = $documentPaths;

        // ── Persist
        $application = JobApplication::updateOrCreate(
            ['user_id' => $user->id, 'advertisement_id' => $advertisement->id],
            [
                'department' => $validated['department'],
                'grade' => $validated['grade'],
                'form_data' => $formData,
                'status' => 'submitted',
            ]
        );

        // ── Generate & store PDF
        $pdf = Pdf::loadView('pdf.application_format', [
            'application' => $application,
            'user' => $user,
            'advertisement' => $advertisement,
            'data' => $formData,
        ]);

        // 1. Define the path and save the PDF to the disk
        $pdfPath = "applications/{$user->id}/{$advertisement->id}/Final_Application_Form.pdf";
        Storage::disk('public')->put($pdfPath, $pdf->output());

        // 2. QUEUE the confirmation email, passing the PATH, not the raw output!
        Mail::to($user->email)->queue(new ApplicationSubmitted($application, $pdfPath));

        // ── Referee notification emails
        $referees = $formData['referees_section']['referees'] ?? [];
        $applicantName = trim(
            ($formData['personal_details']['first_name'] ?? '').' '.
            ($formData['personal_details']['last_name'] ?? '')
        );

        foreach ($referees as $referee) {
            if (! empty($referee['email']) && filter_var($referee['email'], FILTER_VALIDATE_EMAIL)) {
                // 3. QUEUE the referee emails
                Mail::to($referee['email'])->queue(
                    new RefereeNotification($application, $applicantName, $referee)
                );
            }
        }

        return redirect()->route('dashboard')
            ->with('success', 'Application Submitted! A confirmation copy has been sent to your email.');
    }

    // ADMIN — Advertisement management

    public function adminIndex()
    {
        return Inertia::render('Admin/Jobs/Index', [
            'advertisements' => Advertisement::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jobs/Create', [
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference_number' => 'required|string|unique:advertisements,reference_number',
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'document' => 'required|file|mimes:pdf|max:5120',
            'departments' => 'required|array|min:1',
        ]);

        $filePath = $request->file('document')->store('advertisements', 'public');

        Advertisement::create([
            'reference_number' => $validated['reference_number'],
            'title' => $validated['title'],
            'deadline' => $validated['deadline'],
            'departments' => $validated['departments'],
            'document_path' => $filePath,
        ]);

        return redirect()->route('admin.jobs.create')
            ->with('success', 'Advertisement published successfully!');
    }
}
