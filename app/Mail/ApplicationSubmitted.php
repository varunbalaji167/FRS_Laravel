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

class ApplicationSubmitted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public JobApplication $application;

    public string $pdfPath;

    public function __construct(JobApplication $application, string $pdfPath)
    {
        $this->application = $application;
        $this->pdfPath = $pdfPath;
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

    public function attachments(): array
    {
        // Safely pull the PDF from the public disk during the background job
        return [
            Attachment::fromStorageDisk('public', $this->pdfPath)
                ->as('IIT_Indore_Application.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
