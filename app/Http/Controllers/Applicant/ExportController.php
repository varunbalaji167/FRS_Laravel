<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Services\Applications\DossierExporter;
use Illuminate\Support\Facades\Auth;

class ExportController extends Controller
{
    public function __construct(private readonly DossierExporter $exporter)
    {
        //
    }

    /**
     * Applicant: securely export their own PDF. Scoped to `submitted` — a
     * draft has nothing to export yet, and hiding it as 404 keeps this
     * consistent with how HOD/admin already hide drafts.
     */
    public function exportPdf($id)
    {
        $application = $this->ownedSubmittedApplication($id);

        return $this->exporter->exportPdf($application);
    }

    /**
     * Applicant: securely export their own dossier CSV.
     */
    public function exportExcel($id)
    {
        $application = $this->ownedSubmittedApplication($id);

        return $this->exporter->exportExcel($application);
    }

    private function ownedSubmittedApplication($id): JobApplication
    {
        return JobApplication::with(['user', 'advertisement'])
            ->where('user_id', Auth::id())
            ->where('status', 'submitted')
            ->findOrFail($id);
    }
}
