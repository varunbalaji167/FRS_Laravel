<?php

namespace App\Services\Applications;

use App\Models\JobApplication;
use Symfony\Component\HttpFoundation\Response;

/**
 * One place for PDF + Excel + CSV export, shared by Applicant\ExportController
 * and Admin\ApplicationController. Filled in Phase 4 — behaviour still lives
 * inline in those controllers until then.
 */
class DossierExporter
{
    public function __construct()
    {
        //
    }

    public function exportPdf(JobApplication $application): Response
    {
        throw new \LogicException('Not implemented — filled in Phase 4.');
    }

    public function exportExcel(JobApplication $application): Response
    {
        throw new \LogicException('Not implemented — filled in Phase 4.');
    }
}
