<?php

namespace App\Http\Controllers;

use App\Mail\ApplicationSubmitted;
use App\Models\Advertisement;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobOpeningController extends Controller
{
    /**
     * Display active advertisements on the dashboard.
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
                if ($app->status === 'submitted') {
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
     * Admin: Create Advertisement View
     */
    public function create()
    {
        return Inertia::render('Admin/Jobs/Create');
    }

    /**
     * Admin: Store Advertisement & Upload PDF
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference_number' => 'required|string|unique:advertisements,reference_number',
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'document' => 'required|file|mimes:pdf|max:5120',
            'departments' => 'required|array|min:1',
            'departments.*' => 'required|array|min:1',
        ], [
            'departments.*.min' => 'Every selected department must have at least one grade assigned to it.',
        ]);

        $filePath = $request->file('document')->store('advertisements', 'public');

        Advertisement::create([
            'reference_number' => $validated['reference_number'],
            'title' => $validated['title'],
            'deadline' => $validated['deadline'],
            'departments' => $validated['departments'],
            'document_path' => $filePath,
        ]);

        return redirect()->route('jobs.create')->with('success', 'Advertisement published successfully!');
    }

    /**
     * Show the long-form application wizard.
     */
    public function showApplyForm(Advertisement $advertisement)
    {
        $application = JobApplication::where('user_id', Auth::id())
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($application && $application->status === 'submitted') {
            return redirect()->route('dashboard')->with('error', 'You have already submitted an application for this advertisement.');
        }

        return Inertia::render('Applicant/ApplyForm', [
            'advertisement' => $advertisement,
            'existingDraft' => $application ? $application->form_data : null,
            'existingDepartment' => $application ? $application->department : '',
            'existingGrade' => $application ? $application->grade : '',
        ]);
    }

    /**
     * SAVE AS DRAFT: Handles partial saves without strict validation
     */
    public function saveDraft(Request $request, Advertisement $advertisement)
    {
        JobApplication::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'advertisement_id' => $advertisement->id,
            ],
            [
                'department' => $request->input('department', ''),
                'grade' => $request->input('grade', ''),
                'form_data' => $request->input('form_data', []),
                'status' => 'draft',
            ]
        );

        return redirect()->back();
    }

    /**
     * FINAL SUBMIT: Process files, lock in the application, generate PDF, and send Email
     */
    public function submitApplication(Request $request, Advertisement $advertisement)
    {
        $validated = $request->validate([
            'department' => 'required|string',
            'grade' => 'required|string',
            'form_data' => 'required|array',
        ]);

        $user = Auth::user();
        $formData = $validated['form_data'];
        $documentPaths = [];

        // 1. Process File Uploads (From Step 11)
        // Inertia passes the `documents` object containing all uploaded files.
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                // Store safely in storage/app/public/applications/{user_id}/{adv_id}/
                $path = $file->store("applications/{$user->id}/{$advertisement->id}", 'public');
                $documentPaths[$key] = $path;
            }
        }

        // Attach the paths of the uploaded files to the form_data JSON so we don't lose them
        $formData['uploaded_documents'] = $documentPaths;

        // 2. Lock-in Database Record
        $application = JobApplication::updateOrCreate(
            [
                'user_id' => $user->id,
                'advertisement_id' => $advertisement->id,
            ],
            [
                'department' => $validated['department'],
                'grade' => $validated['grade'],
                'form_data' => $formData,
                'status' => 'submitted',
            ]
        );

        // 3. Generate the PDF
        $pdf = Pdf::loadView('pdf.application_format', [
            'application' => $application,
            'user' => $user,
            'advertisement' => $advertisement,
            'data' => $formData,
        ]);

        // Save a permanent copy of the generated PDF alongside their uploaded certificates
        Storage::disk('public')->put("applications/{$user->id}/{$advertisement->id}/Final_Application_Form.pdf", $pdf->output());

        // 4. Send the Email Confirmation
        Mail::to($user->email)->send(new ApplicationSubmitted($application, $pdf->output()));

        // 5. Redirect User
        return redirect()->route('dashboard')->with('success', 'Application submitted successfully! A copy has been sent to your email.');
    }

    /**
     * Admin: List all advertisements
     */
    public function adminIndex()
    {
        $advertisements = Advertisement::latest()->get();
        return Inertia::render('Admin/Jobs/Index', [
            'advertisements' => $advertisements,
        ]);
    }
}
