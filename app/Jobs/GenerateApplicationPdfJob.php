<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

// TODO(Phase 4): dispatch from SubmissionService; store the generated PDF to
// the private disk then dispatch ApplicationSubmitted. Set $tries/$backoff/
// $timeout/failed() per docs/architecture.md.
class GenerateApplicationPdfJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
