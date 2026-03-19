<!DOCTYPE html>
<html>
<body>
    @php
        // Decode the JSON data so we can read it in the email
        $data = is_string($application->form_data) ? json_decode($application->form_data, true) : $application->form_data;
        $firstName = $data['personal_details']['first_name'] ?? 'Applicant';
        $lastName = $data['personal_details']['last_name'] ?? '';
    @endphp

    <h2>Dear {{ $firstName }} {{ $lastName }},</h2>
    
    <p>Thank you for applying to the Indian Institute of Technology Indore.</p>
    
    <p>Your application for the position under advertisement <strong>{{ $application->advertisement->reference_number ?? 'IIT Indore' }}</strong> has been successfully received.</p>
    
    <p>Please find attached a PDF copy of your submitted application for your records.</p>
    
    <br>
    <p>Best Regards,</p>
    <p>Faculty Affairs Office<br>IIT Indore</p>
</body>
</html>