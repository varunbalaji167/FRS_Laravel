<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <p>Dear {{ $referee['name'] ?? 'Professor/Dr.' }},</p>

        <p>We are writing to formally notify you that <strong>{{ $applicantName }}</strong> has submitted an application for the position of <strong>{{ $application->grade }}</strong> in the Department of <strong>{{ $application->department }}</strong> at the Indian Institute of Technology (IIT) Indore.</p>

        <p>In their application dossier, the candidate has listed you as a referee.</p>

        <p><strong>Please note:</strong> At this preliminary stage, no action is required from your end. If the candidate is shortlisted for the next phase of the recruitment process, the candidate will reach out to you with a request to kindly send your letter of recommendation directly to <a href="mailto:fac.rec@iit.ac.in" style="font-weight: bold; color: #2563eb; text-decoration: underline;">fac.rec@iit.ac.in</a> before the stipulated deadline.</p>
        <p>We appreciate your time and support.</p>

        <br>
        <p>Sincerely,</p>
        <p><strong>Faculty Recruitment Cell</strong><br>
        Indian Institute of Technology Indore</p>
        
        <div class="footer">
            <p><em>This is an automated message from the IIT Indore Faculty Recruitment Portal. Please do not reply directly to this email.</em></p>
        </div>
    </div>
</body>
</html>