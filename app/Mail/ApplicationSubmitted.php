<?php

namespace App\Mail;

use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ApplicationSubmitted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public int $timeout = 60;

    public JobApplication $application;

    public string $pdfPath;

    public function __construct(JobApplication $application, string $pdfPath)
    {
        $this->application = $application;
        $this->pdfPath = $pdfPath;
    }

    public function failed(Throwable $exception): void
    {
        Log::error('ApplicationSubmitted mail failed permanently', [
            'application_id' => $this->application->id,
            'exception' => $exception->getMessage(),
        ]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Successfully Submitted - IIT Indore FRS',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application_submitted',
        );
    }

    /**
     * @return list<Attachment>
     */
    public function attachments(): array
    {
        // Pulled off the private disk inside the queued job.
        return [
            Attachment::fromStorageDisk('local', $this->pdfPath)
                ->as('IIT_Indore_Application.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
