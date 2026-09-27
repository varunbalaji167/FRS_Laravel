<?php

namespace App\Jobs;

use App\Mail\ApplicationSubmitted;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Generates the dossier PDF off the web request, stores it privately, then
 * queues the applicant's confirmation mail with it attached.
 */
class GenerateApplicationPdfJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public int $timeout = 60;

    public function __construct(public readonly JobApplication $application)
    {
        //
    }

    public function handle(): void
    {
        $application = $this->application->fresh(['user', 'advertisement']);

        $pdf = Pdf::loadView('pdf.application_format', [
            'application' => $application,
            'user' => $application->user,
            'advertisement' => $application->advertisement,
            'data' => $application->form_data,
        ]);

        $pdfPath = "applications/{$application->user_id}/{$application->advertisement_id}/Final_Application_Form.pdf";
        Storage::disk('local')->put($pdfPath, $pdf->output());

        Mail::to($application->user->email)->queue(new ApplicationSubmitted($application, $pdfPath));
    }

    public function failed(Throwable $exception): void
    {
        Log::error('GenerateApplicationPdfJob failed permanently', [
            'application_id' => $this->application->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
