<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountAccessNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    // Use safe strings instead of the Eloquent Model
    public string $name;
    public string $role;
    public ?string $department;
    public string $type;

    public function __construct(string $name, string $role, ?string $department, string $type)
    {
        $this->name = $name;
        $this->role = $role;
        $this->department = $department;
        $this->type = $type;
    }

    public function envelope(): Envelope
    {
        // Add the 'deleted' subject line
        $subject = match($this->type) {
            'created' => 'Welcome to the IIT Indore Recruitment Portal',
            'deleted' => 'Notice: Your Portal Access has been Revoked',
            default   => 'Security Alert: Your Access Level has changed',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.users.access-notification');
    }
}