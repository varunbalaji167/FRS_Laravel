<?php

namespace App\Mail;

use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefereeNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public JobApplication $application;
    public string $applicantName;
    public array $referee;

    public function __construct(JobApplication $application, string $applicantName, array $referee)
    {
        $this->application = $application;
        $this->applicantName = $applicantName;
        $this->referee = $referee;
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

    public function attachments(): array
    {
        return [];
    }
}