<x-mail::message>
@if($type === 'created')
# Welcome to the Portal!

Hello **{{ $name }}**,

An administrative account has been provisioned for you on the IIT Indore Faculty Recruitment Portal.
@elseif($type === 'deleted')
# Access Revoked

Hello **{{ $name }}**,

This is an automated notice to inform you that your administrative access to the IIT Indore Recruitment Portal has been removed by a System Administrator.
@else
# Account Update Notice

Hello **{{ $name }}**,

This is an automated security notice to inform you that your access level on the IIT Indore Recruitment Portal has been updated by an Administrator.
@endif

@if($type !== 'deleted')
### Your Current Access Details:
* **System Role:** {{ strtoupper($role) }}
@if($department)
* **Assigned Department:** {{ $department }}
@endif
@endif

@if($type === 'created')
To access your dashboard, simply click the button below and log in using the **"Sign in with Google"** button with your official `@iiti.ac.in` email address. You do not need a password.

<x-mail::button :url="url('/')" color="primary">
Access the Portal
</x-mail::button>
@elseif($type === 'updated')
<x-mail::button :url="url('/')" color="primary">
Access the Portal
</x-mail::button>

*If you did not request this change or believe this is an error, please contact the IT Computer Centre immediately.*
@else
*If you believe this is an error, please contact the IT Computer Centre.*
@endif

Thanks,<br>
**IIT Indore Faculty Recruitment Office**<br>

---
*This is an automatically generated email. Please do not reply directly to this message.*
</x-mail::message>