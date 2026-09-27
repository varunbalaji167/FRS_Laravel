<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Services\Applications\DossierExporter;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(private readonly DossierExporter $exporter)
    {
        //
    }

    public function exportPdf(int|string $id): Response
    {
        return $this->exporter->exportPdf($this->ownedSubmittedApplication($id));
    }

    public function exportExcel(int|string $id): StreamedResponse
    {
        return $this->exporter->exportExcel($this->ownedSubmittedApplication($id));
    }

    /**
     * A draft 404s, as it does for admin/HOD. Shortlisted and rejected stay
     * exportable: a review decision can't revoke the applicant's own copy.
     */
    private function ownedSubmittedApplication(int|string $id): JobApplication
    {
        return JobApplication::with(['user', 'advertisement'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->findOrFail($id);
    }
}
