<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ApplicationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public $application;
    public $pdfContent;

    public function __construct($application, $pdfContent)
    {
        $this->application = $application;
        $this->pdfContent = $pdfContent;
    }

    public function build()
    {
        return $this->subject('Application Successfully Submitted - IIT Indore FRS')
                    ->view('emails.application_submitted') 
                    ->attachData($this->pdfContent, 'IIT_Indore_Application.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }
}