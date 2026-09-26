<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExportController extends Controller
{
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
    public function exportExcel(Request $request, $id)
    {
        // Ensure the applicant actually owns this application
        JobApplication::where('user_id', Auth::id())->findOrFail($id);

        return app(AdminApplicationController::class)->exportExcel($request, $id);
    }
}
