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

class RefereeNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public int $timeout = 60;

    public JobApplication $application;

    public string $applicantName;

    /** @var array<string, mixed> */
    public array $referee;

    /**
     * @param  array<string, mixed>  $referee
     */
    public function __construct(JobApplication $application, string $applicantName, array $referee)
    {
        $this->application = $application;
        $this->applicantName = $applicantName;
        $this->referee = $referee;
    }

    public function failed(Throwable $exception): void
    {
        Log::error('RefereeNotification mail failed permanently', [
            'application_id' => $this->application->id,
            'referee_email' => $this->referee['email'] ?? null,
            'exception' => $exception->getMessage(),
        ]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reference Notification: Application of {$this->applicantName} at IIT Indore",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.referee_notification',
        );
    }

    /**
     * @return list<Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
