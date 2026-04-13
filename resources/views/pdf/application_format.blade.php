<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 40px 50px; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9pt;
            color: #1e293b;
            line-height: 1.5;
        }

        /* ── PHOTO BOX ── */
        .photo-wrap {
            position: relative;
            min-height: 140px;
            margin-bottom: 10px;
        }
        .photo-box {
            position: absolute;
            top: 0;
            right: 0;
            width: 110px;
            height: 130px;
            border: 1.5px solid #1e3a8a;
            text-align: center;
            background-color: #f8fafc;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }
        .photo-box .no-photo { color: #94a3b8; font-size: 7.5pt; font-weight: bold; padding: 10px; }

        /* ── HEADER ── */
        .header {
            text-align: center;
            border-bottom: 2.5px solid #1e3a8a;
            padding-bottom: 10px;
            margin-bottom: 6px;
            margin-right: 125px;
        }
        .header h2  { margin: 0; font-size: 14pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
        .header h3  { margin: 4px 0; font-size: 10.5pt; color: #334155; }
        .header p   { margin: 2px 0; font-size: 8.5pt; color: #475569; }

        /* ── SECTION / SUB TITLES ── */
        .section-title {
            background-color: #1e3a8a;
            color: #ffffff;
            padding: 5px 10px;
            font-weight: bold;
            font-size: 9.5pt;
            margin-top: 18px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sub-title {
            font-weight: bold;
            font-size: 9pt;
            color: #1e3a8a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2px;
            margin-top: 10px;
            margin-bottom: 5px;
        }

        /* ── TABLES ── */
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: auto; }
        tr    { page-break-inside: avoid; page-break-after: auto; }
        th, td { border: 1px solid #94a3b8; padding: 5px 7px; text-align: left; vertical-align: top; font-size: 8.5pt; }
        th    { background-color: #f1f5f9; font-weight: bold; color: #1e3a8a; }
        .lbl  { background-color: #f8fafc; font-weight: bold; color: #475569; width: 22%; white-space: nowrap; }
        .val  { width: 28%; }
        .na   { color: #94a3b8; font-style: italic; }

        /* ── TEXT AREAS ── */
        .text-content {
            border: 1px solid #94a3b8;
            padding: 10px;
            background-color: #f8fafc;
            min-height: 40px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 8.5pt;
            margin-bottom: 8px;
        }

        /* ── MISC ── */
        .page-break    { page-break-before: always; }
        .empty-row     { text-align: center; color: #94a3b8; font-style: italic; }
        .signature-box { margin-top: 40px; text-align: right; padding-right: 20px; }
        .signature-line {
            display: inline-block;
            width: 240px;
            border-top: 1.5px solid #1e293b;
            text-align: center;
            padding-top: 4px;
            font-weight: bold;
            font-size: 9pt;
        }
        .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e3a8a;
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 7.5pt;
            font-weight: bold;
            margin-right: 4px;
        }
        .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 4px;
            padding: 6px 10px;
            margin-bottom: 8px;
            font-size: 8pt;
        }
    </style>
</head>
<body>

{{-- ═══════════════════════════════════════════════════════════
     HEADER WITH PHOTO
     DomPDF cannot load images via http:// or relative paths.
     We must embed the image as a base64 data URI.
═══════════════════════════════════════════════════════════ --}}
@php
    $photoHtml = '<span class="no-photo">Attach<br>Photo</span>';

    $rawPath = $data['personal_details']['profile_image'] ?? null;
    if ($rawPath) {
        // Strip any leading /storage/ or storage/ prefix the app may have stored
        $cleanPath = ltrim(preg_replace('#^/?storage/#', '', $rawPath), '/');
        $absPath   = storage_path('app/public/' . $cleanPath);

        if (file_exists($absPath) && is_readable($absPath)) {
            $mime    = mime_content_type($absPath);
            // Only embed recognised image types
            if (in_array($mime, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
                $b64     = base64_encode(file_get_contents($absPath));
                $photoHtml = '<img src="data:' . $mime . ';base64,' . $b64 . '" alt="Applicant Photo">';
            }
        }
    }
@endphp

<div class="photo-wrap">
    <div class="photo-box">
        {!! $photoHtml !!}
    </div>

    <div class="header">
        <h2>Indian Institute of Technology Indore</h2>
        <h3>Application for Faculty Position</h3>
        <p><strong>Advertisement No:</strong> {{ $advertisement->reference_number ?? 'N/A' }}</p>
        <p><strong>Application No:</strong> {{ $application->id }} &nbsp;|&nbsp;
           <strong>Date:</strong> {{ $application->created_at ? $application->created_at->format('d/m/Y') : 'N/A' }} &nbsp;|&nbsp;
           <strong>Status:</strong> {{ ucfirst($application->status ?? 'N/A') }}</p>
    </div>
</div>

{{-- ── POSITION DETAILS ── --}}
<div class="section-title">Position Applied For</div>
<table>
    <tr>
        <td class="lbl">Department / School</td>
        <td class="val"><strong>{{ $application->department ?? 'N/A' }}</strong></td>
        <td class="lbl">Grade / Post</td>
        <td class="val"><strong>{{ $application->grade ?? 'N/A' }}</strong></td>
    </tr>
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 1 — PERSONAL DETAILS
═══════════════════════════════════════════════════════════ --}}
@php $p = $data['personal_details'] ?? []; @endphp

<div class="section-title">1. Personal Details</div>

<table>
    <tr>
        <td class="lbl">Full Name</td>
        <td colspan="3">
            <strong>
                {{ trim(($p['first_name'] ?? '') . ' ' . ($p['middle_name'] ?? '') . ' ' . ($p['last_name'] ?? '')) ?: 'N/A' }}
            </strong>
        </td>
    </tr>
    <tr>
        <td class="lbl">Father's Name</td>
        <td colspan="3">{{ $p['fathers_name'] ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td class="lbl">Date of Birth</td>
        <td class="val">{{ $p['dob'] ?? 'N/A' }}</td>
        <td class="lbl">Gender</td>
        <td class="val">{{ $p['gender'] ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td class="lbl">Category</td>
        <td class="val">{{ $p['category'] ?? 'N/A' }}</td>
        <td class="lbl">Marital Status</td>
        <td class="val">{{ $p['marital_status'] ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td class="lbl">Nationality</td>
        <td class="val">{{ $p['nationality'] ?? 'N/A' }}</td>
        <td class="lbl">ID Proof</td>
        <td class="val">{{ $p['id_proof_type'] ?? 'N/A' }}: {{ $p['id_proof_number'] ?? 'N/A' }}</td>
    </tr>
</table>

<table>
    <tr>
        <th style="width:50%;">Correspondence Address</th>
        <th style="width:50%;">Permanent Address</th>
    </tr>
    <tr>
        <td>
            {{ $p['corr_address'] ?? 'N/A' }}<br>
            {{ $p['corr_city'] ?? '' }}@if(!empty($p['corr_city']) && !empty($p['corr_state'])), @endif{{ $p['corr_state'] ?? '' }}<br>
            {{ $p['corr_country'] ?? '' }}@if(!empty($p['corr_pincode'])) – {{ $p['corr_pincode'] }}@endif
        </td>
        <td>
            {{ $p['perm_address'] ?? 'N/A' }}<br>
            {{ $p['perm_city'] ?? '' }}@if(!empty($p['perm_city']) && !empty($p['perm_state'])), @endif{{ $p['perm_state'] ?? '' }}<br>
            {{ $p['perm_country'] ?? '' }}@if(!empty($p['perm_pincode'])) – {{ $p['perm_pincode'] }}@endif
        </td>
    </tr>
</table>

<table>
    <tr>
        <td class="lbl">Primary E-mail</td>
        <td class="val">{{ $p['email'] ?? 'N/A' }}</td>
        <td class="lbl">Alternate E-mail</td>
        <td class="val">{{ $p['alt_email'] ?? 'N/A' }}</td>
    </tr>
<tr>
    <td class="lbl">Primary Mobile</td>
    <td class="val">
        @if(!empty($p['phone']))
            {{ ($p['phone_code'] ?? '+91') . ' ' . $p['phone'] }}
        @else
            N/A
        @endif
    </td>

    <td class="lbl">Alternate Mobile</td>
    <td class="val">
        @if(!empty($p['alt_phone']))
            {{ ($p['alt_phone_code'] ?? '+91') . ' ' . $p['alt_phone'] }}
        @else
            N/A
        @endif
    </td>
</tr>
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 2 — EDUCATIONAL QUALIFICATIONS
═══════════════════════════════════════════════════════════ --}}
@php $edu = $data['education'] ?? []; $phd = $edu['phd'] ?? []; @endphp

<div class="section-title">2. Educational Qualifications</div>

<div class="sub-title">(A) Ph.D. Details</div>
<table>
    <tr>
        <th>University / Institute</th>
        <th>Department</th>
        <th>Supervisor</th>
        <th>Year Joined</th>
        <th>Date of Defence</th>
        <th>Date of Award</th>
    </tr>
    @if(!empty($phd['university']))
    <tr>
        <td>{{ $phd['university'] ?? 'N/A' }}</td>
        <td>{{ $phd['department'] ?? 'N/A' }}</td>
        <td>{{ $phd['supervisor'] ?? 'N/A' }}</td>
        <td>{{ $phd['year_joining'] ?? 'N/A' }}</td>
        <td>{{ $phd['date_defence'] ?? 'N/A' }}</td>
        <td>{{ $phd['date_award'] ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td class="lbl">Thesis Title</td>
        <td colspan="5">{{ $phd['title'] ?? $phd['thesis_title'] ?? 'N/A' }}</td>
    </tr>
    @else
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endif
</table>

<div class="sub-title">(B) Post-Graduate (PG) Details</div>
<table>
    <tr>
        <th>#</th>
        <th>Degree</th>
        <th>University / Institute</th>
        <th>Subjects</th>
        <th>Yr. Joined</th>
        <th>Yr. Graduated</th>
        <th>Duration (Months)</th>
        <th>% / CGPA</th>
        <th>Class / Division</th>
    </tr>
    @forelse($edu['pg'] ?? [] as $i => $pg)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $pg['degree'] ?? 'N/A' }}</td>
        <td>{{ $pg['university'] ?? 'N/A' }}</td>
        <td>{{ $pg['subjects'] ?? 'N/A' }}</td>
        <td>{{ $pg['year_joining'] ?? 'N/A' }}</td>
        <td>{{ $pg['year_graduation'] ?? 'N/A' }}</td>
        <td>{{ $pg['duration'] ?? 'N/A' }}</td>
        <td>{{ $pg['percentage'] ?? 'N/A' }}</td>
        <td>{{ $pg['division'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="8" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(C) Under-Graduate (UG) Details</div>
<table>
    <tr>
        <th>#</th>
        <th>Degree</th>
        <th>University / Institute</th>
        <th>Subjects</th>
        <th>Yr. Joined</th>
        <th>Yr. Graduated</th>
        <th>Duration (Months)</th>
        <th>% / CGPA</th>
        <th>Class / Division</th>
    </tr>
    @forelse($edu['ug'] ?? [] as $i => $ug)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $ug['degree'] ?? 'N/A' }}</td>
        <td>{{ $ug['university'] ?? 'N/A' }}</td>
        <td>{{ $ug['subjects'] ?? 'N/A' }}</td>
        <td>{{ $ug['year_joining'] ?? 'N/A' }}</td>
        <td>{{ $ug['year_graduation'] ?? 'N/A' }}</td>
        <td>{{ $ug['duration'] ?? 'N/A' }}</td>
        <td>{{ $ug['percentage'] ?? 'N/A' }}</td>
        <td>{{ $ug['division'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="8" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(D) School Details</div>
<table>
    <tr>
        <th>Level</th>
        <th>School / Board</th>
        <th>Year of Passing</th>
        <th>Percentage / CGPA</th>
        <th>Division / Class</th>
    </tr>
    @forelse($edu['school'] ?? [] as $school)
    <tr>
        <td>{{ $school['level'] ?? 'N/A' }}</td>
        {{-- Step3 stores 'school' as the school name field --}}
        <td>{{ $school['school'] ?? $school['board'] ?? 'N/A' }}</td>
        {{-- Step3 stores 'year_passing' --}}
        <td>{{ $school['year_passing'] ?? $school['year_graduation'] ?? 'N/A' }}</td>
        <td>{{ $school['percentage'] ?? 'N/A' }}</td>
        <td>{{ $school['division'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="5" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 3 — EMPLOYMENT DETAILS
═══════════════════════════════════════════════════════════ --}}
@php $emp = $data['employment'] ?? []; $pres = $emp['present'] ?? []; @endphp

<div class="section-title">3. Employment Details</div>

<div class="sub-title">(A) Present Employment</div>
<table>
    <tr>
        <th>Position / Designation</th>
        <th>Organization / Institute</th>
        <th>Date of Joining</th>
        <th>Date of Leaving</th>
        <th>Duration (Months)</th>
    </tr>
    @if(!empty($pres['position']))
    <tr>
        <td>{{ $pres['position'] ?? 'N/A' }}</td>
        <td>{{ $pres['organization'] ?? 'N/A' }}</td>
        <td>{{ $pres['date_joining'] ?? 'N/A' }}</td>
        <td>{{ $pres['date_leaving'] ?? 'Continuing' }}</td>
        <td>{{ $pres['duration'] ?? 'N/A' }}</td>
    </tr>
    @else
    <tr><td colspan="5" class="empty-row">N/A</td></tr>
    @endif
</table>

@php $hasThreeYrs = $emp['has_three_years_exp'] ?? 'N/A'; @endphp
<div class="info-box">
    <strong>Minimum 3 years industrial/research/teaching experience (excluding PhD period):</strong>
    &nbsp;<span class="badge">{{ $hasThreeYrs }}</span>
</div>

<div class="sub-title">(B) Employment History (All Previous)</div>
<table>
    <tr>
        <th>#</th>
        <th>Position / Designation</th>
        <th>Organization / Institute</th>
        <th>Date of Joining</th>
        <th>Date of Leaving</th>
        <th>Duration (Months)</th>
    </tr>
    @forelse($emp['history'] ?? [] as $i => $e)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $e['position'] ?? 'N/A' }}</td>
        <td>{{ $e['organization'] ?? 'N/A' }}</td>
        <td>{{ $e['date_joining'] ?? 'N/A' }}</td>
        <td>{{ $e['date_leaving'] ?? 'N/A' }}</td>
        <td>{{ $e['duration'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(C) Teaching Experience</div>
<table>
    <tr>
        <th>#</th>
        <th>Position / Designation</th>
        <th>Institute</th>
        <th>Date of Joining</th>
        <th>Date of Leaving</th>
        <th>Duration (Months)</th>
    </tr>
    @forelse($emp['teaching'] ?? [] as $i => $e)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $e['position'] ?? 'N/A' }}</td>
        <td>{{ $e['institute'] ?? 'N/A' }}</td>
        <td>{{ $e['date_joining'] ?? 'N/A' }}</td>
        <td>{{ $e['date_leaving'] ?? 'N/A' }}</td>
        <td>{{ $e['duration'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(D) Research Experience</div>
<table>
    <tr>
        <th>#</th>
        <th>Position</th>
        <th>Institute</th>
        <th>Supervisor</th>
        <th>Date Joined</th>
        <th>Date Left</th>
        <th>Duration (Months)</th>
    </tr>
    @forelse($emp['research'] ?? [] as $i => $e)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $e['position'] ?? 'N/A' }}</td>
        <td>{{ $e['institute'] ?? 'N/A' }}</td>
        <td>{{ $e['supervisor'] ?? 'N/A' }}</td>
        <td>{{ $e['date_joining'] ?? 'N/A' }}</td>
        <td>{{ $e['date_leaving'] ?? 'N/A' }}</td>
        <td>{{ $e['duration'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="7" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(E) Industrial Experience</div>
<table>
    <tr>
        <th>#</th>
        <th>Organization</th>
        <th>Work Profile</th>
        <th>Date Joined</th>
        <th>Date Left</th>
        <th>Duration (Months)</th>
    </tr>
    @forelse($emp['industrial'] ?? [] as $i => $e)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $e['organization'] ?? 'N/A' }}</td>
        <td>{{ $e['profile'] ?? 'N/A' }}</td>
        <td>{{ $e['date_joining'] ?? 'N/A' }}</td>
        <td>{{ $e['date_leaving'] ?? 'N/A' }}</td>
        <td>{{ $e['duration'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 4 — RESEARCH & PUBLICATIONS
═══════════════════════════════════════════════════════════ --}}
@php $res = $data['research'] ?? []; $spec = $res['specialization'] ?? []; $sum = $res['summary'] ?? []; @endphp

<div class="page-break"></div>
<div class="section-title">4. Research — Specialization & Publication Summary</div>

<table>
    <tr>
        <th style="width:50%;">Area(s) of Specialization</th>
        <th style="width:50%;">Current Area(s) of Research</th>
    </tr>
    <tr>
        <td style="white-space:pre-wrap;">{{ $spec['area_of_specialization'] ?? 'N/A' }}</td>
        <td style="white-space:pre-wrap;">{{ $spec['current_area_of_research'] ?? 'N/A' }}</td>
    </tr>
</table>

<div class="sub-title">Summary of Publications</div>
<table>
    <tr>
        <th>Intl. Journal Papers</th>
        <th>Natl. Journal Papers</th>
        <th>Intl. Conferences</th>
        <th>Natl. Conferences</th>
        <th>Patents</th>
        <th>Books</th>
        <th>Book Chapters</th>
    </tr>
    <tr>
        <td style="text-align:center;font-weight:bold;">{{ $sum['intl_journals'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['natl_journals'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['intl_conferences'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['natl_conferences'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['patents'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['books'] ?? '0' }}</td>
        <td style="text-align:center;font-weight:bold;">{{ $sum['book_chapters'] ?? '0' }}</td>
    </tr>
</table>

<div class="sub-title">List of Best Research Publications (up to 10)</div>
<table>
    <tr>
        <th>#</th>
        <th>Title</th>
        <th>Author(s)</th>
        <th>Journal / Conference</th>
        <th>Year</th>
        <th>Vol. & Page</th>
        <th>Impact Factor</th>
        <th>DOI / URL</th>
        <th>Status</th>
    </tr>
    @forelse($res['publications'] ?? [] as $i => $pub)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $pub['title'] ?? 'N/A' }}</td>
        <td>{{ $pub['authors'] ?? 'N/A' }}</td>
        <td>{{ $pub['journal'] ?? 'N/A' }}</td>
        <td>{{ $pub['year'] ?? 'N/A' }}</td>
        <td>{{ $pub['vol_page'] ?? 'N/A' }}</td>
        <td>{{ $pub['impact_factor'] ?? 'N/A' }}</td>
        <td style="font-size:7.5pt;">{{ $pub['doi'] ?? 'N/A' }}</td>
        <td>{{ $pub['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="9" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 5 — ADDITIONAL INFORMATION
═══════════════════════════════════════════════════════════ --}}
@php $info = $data['additional_info'] ?? []; @endphp

<div class="section-title">5. Additional Information</div>

<div class="sub-title">(A) Patents</div>
<table>
    <tr>
        <th>#</th>
        <th>Inventor(s)</th>
        <th>Title of Patent</th>
        <th>Country</th>
        <th>Patent No.</th>
        <th>Date Filed</th>
        <th>Date Published</th>
        <th>Status</th>
    </tr>
    @forelse($info['patents'] ?? [] as $i => $pat)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $pat['inventors'] ?? 'N/A' }}</td>
        <td>{{ $pat['title'] ?? 'N/A' }}</td>
        <td>{{ $pat['country'] ?? 'N/A' }}</td>
        <td>{{ $pat['number'] ?? 'N/A' }}</td>
        <td>{{ $pat['date_filed'] ?? 'N/A' }}</td>
        <td>{{ $pat['date_published'] ?? 'N/A' }}</td>
        <td>{{ $pat['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="8" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(B) Books</div>
<table>
    <tr>
        <th>#</th>
        <th>Author(s)</th>
        <th>Title</th>
        <th>Year</th>
        <th>ISBN</th>
    </tr>
    @forelse($info['books'] ?? [] as $i => $bk)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $bk['authors'] ?? 'N/A' }}</td>
        <td>{{ $bk['title'] ?? 'N/A' }}</td>
        <td>{{ $bk['year'] ?? 'N/A' }}</td>
        <td>{{ $bk['isbn'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="5" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(C) Book Chapters</div>
<table>
    <tr>
        <th>#</th>
        <th>Author(s)</th>
        <th>Title</th>
        <th>Year</th>
        <th>ISBN</th>
    </tr>
    @forelse($info['book_chapters'] ?? [] as $i => $bc)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $bc['authors'] ?? 'N/A' }}</td>
        <td>{{ $bc['title'] ?? 'N/A' }}</td>
        <td>{{ $bc['year'] ?? 'N/A' }}</td>
        <td>{{ $bc['isbn'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="5" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(D) Google Scholar Profile</div>
<table>
    <tr>
        <td class="lbl">Google Scholar URL</td>
        <td>{{ $info['google_scholar'] ?? 'N/A' }}</td>
    </tr>
</table>

<div class="sub-title">(E) Membership of Professional Societies</div>
<table>
    <tr>
        <th>#</th>
        <th>Name of Professional Society</th>
        <th>Membership Status</th>
    </tr>
    @forelse($info['societies'] ?? [] as $i => $soc)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $soc['name'] ?? 'N/A' }}</td>
        <td>{{ $soc['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="3" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(F) Professional Training</div>
<table>
    <tr>
        <th>#</th>
        <th>Type of Training</th>
        <th>Organisation</th>
        <th>Year</th>
        <th>Duration (Months)</th>
    </tr>
    @forelse($info['training'] ?? [] as $i => $tr)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $tr['type'] ?? 'N/A' }}</td>
        <td>{{ $tr['organization'] ?? 'N/A' }}</td>
        <td>{{ $tr['year'] ?? 'N/A' }}</td>
        <td>{{ $tr['duration'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="5" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 6 — AWARDS, SUPERVISION & PROJECTS
═══════════════════════════════════════════════════════════ --}}
@php $ap = $data['awards_projects'] ?? []; @endphp

<div class="page-break"></div>
<div class="section-title">6. Awards, Supervision & Sponsored Projects</div>

<div class="sub-title">(A) Awards and Recognitions</div>
<table>
    <tr>
        <th>#</th>
        <th>Name of the Award / Recognition</th>
        <th>Awarded By</th>
        <th>Year</th>
    </tr>
    @forelse($ap['awards'] ?? [] as $i => $aw)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $aw['name'] ?? 'N/A' }}</td>
        <td>{{ $aw['awarded_by'] ?? 'N/A' }}</td>
        <td>{{ $aw['year'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="4" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(B-i) PhD Thesis Supervision</div>
<table>
    <tr>
        <th>#</th>
        <th>Name of Scholar</th>
        <th>Title of Thesis</th>
        <th>Role</th>
        <th>Status</th>
        <th>Year</th>
    </tr>
    @forelse($ap['phd_supervision'] ?? [] as $i => $sup)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $sup['student_name'] ?? 'N/A' }}</td>
        <td>{{ $sup['title'] ?? 'N/A' }}</td>
        <td>{{ $sup['role'] ?? 'N/A' }}</td>
        <td>{{ $sup['status'] ?? 'N/A' }}</td>
        <td>{{ $sup['year'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(B-ii) M.Tech / Masters Thesis Supervision</div>
<table>
    <tr>
        <th>#</th>
        <th>Name of Student</th>
        <th>Title of Thesis / Project</th>
        <th>Role</th>
        <th>Status</th>
        <th>Year</th>
    </tr>
    @forelse($ap['pg_supervision'] ?? [] as $i => $sup)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $sup['student_name'] ?? 'N/A' }}</td>
        <td>{{ $sup['title'] ?? 'N/A' }}</td>
        <td>{{ $sup['role'] ?? 'N/A' }}</td>
        <td>{{ $sup['status'] ?? 'N/A' }}</td>
        <td>{{ $sup['year'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(B-iii) B.Tech / Bachelor's Project Supervision</div>
<table>
    <tr>
        <th>#</th>
        <th>Name of Student</th>
        <th>Title of Project</th>
        <th>Role</th>
        <th>Status</th>
        <th>Year</th>
    </tr>
    @forelse($ap['ug_supervision'] ?? [] as $i => $sup)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $sup['student_name'] ?? 'N/A' }}</td>
        <td>{{ $sup['title'] ?? 'N/A' }}</td>
        <td>{{ $sup['role'] ?? 'N/A' }}</td>
        <td>{{ $sup['status'] ?? 'N/A' }}</td>
        <td>{{ $sup['year'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="6" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(C-i) Sponsored Projects</div>
<table>
    <tr>
        <th>#</th>
        <th>Sponsoring Agency</th>
        <th>Title of Project</th>
        <th>Amount</th>
        <th>Period</th>
        <th>Role</th>
        <th>Status</th>
    </tr>
    @forelse($ap['sponsored_projects'] ?? [] as $i => $proj)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $proj['agency'] ?? 'N/A' }}</td>
        <td>{{ $proj['title'] ?? 'N/A' }}</td>
        <td>{{ $proj['amount'] ?? 'N/A' }}</td>
        <td>{{ $proj['period'] ?? 'N/A' }}</td>
        <td>{{ $proj['role'] ?? 'N/A' }}</td>
        <td>{{ $proj['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="7" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(C-ii) Consultancy Projects</div>
<table>
    <tr>
        <th>#</th>
        <th>Organisation / Agency</th>
        <th>Title of Project</th>
        <th>Amount</th>
        <th>Period</th>
        <th>Role</th>
        <th>Status</th>
    </tr>
    @forelse($ap['consultancy_projects'] ?? [] as $i => $proj)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $proj['agency'] ?? 'N/A' }}</td>
        <td>{{ $proj['title'] ?? 'N/A' }}</td>
        <td>{{ $proj['amount'] ?? 'N/A' }}</td>
        <td>{{ $proj['period'] ?? 'N/A' }}</td>
        <td>{{ $proj['role'] ?? 'N/A' }}</td>
        <td>{{ $proj['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="7" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 7 — CONTRIBUTIONS & FUTURE PLANS (STATEMENTS)
═══════════════════════════════════════════════════════════ --}}
@php $stmts = $data['statements'] ?? []; @endphp

<div class="page-break"></div>
<div class="section-title">7. Contributions & Future Plans</div>

<div class="sub-title">(A) Significant Research Contribution and Future Plans</div>
<div class="text-content">{{ $stmts['research_plan'] ?? 'N/A' }}</div>

<div class="sub-title">(B) Significant Teaching Contribution and Future Plans</div>
<div class="text-content">{{ $stmts['teaching_plan'] ?? 'N/A' }}</div>

<div class="sub-title">(C) Professional Service as Reviewer / Editor etc.</div>
<div class="text-content">{{ $stmts['professional_service'] ?? 'N/A' }}</div>

<div class="sub-title">(D) Any Other Relevant Information</div>
<div class="text-content">{{ $stmts['other_info'] ?? 'N/A' }}</div>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 8 — DETAILED PUBLICATIONS
═══════════════════════════════════════════════════════════ --}}
@php $dpubs = $data['detailed_pubs'] ?? []; @endphp

<div class="page-break"></div>
<div class="section-title">8. Detailed List of Publications</div>

<div class="sub-title">(A) Journal Publications</div>
<table>
    <tr>
        <th>#</th>
        <th>Author(s)</th>
        <th>Paper Title</th>
        <th>Journal Name</th>
        <th>Year</th>
        <th>Volume</th>
        <th>Issue</th>
        <th>Pages</th>
        <th>Impact Factor</th>
        <th>DOI</th>
        <th>Status</th>
    </tr>
    @forelse($dpubs['journals'] ?? [] as $i => $pub)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $pub['authors'] ?? 'N/A' }}</td>
        <td>{{ $pub['title'] ?? 'N/A' }}</td>
        <td>{{ $pub['journal_name'] ?? 'N/A' }}</td>
        <td>{{ $pub['year'] ?? 'N/A' }}</td>
        <td>{{ $pub['volume'] ?? 'N/A' }}</td>
        <td>{{ $pub['issue'] ?? 'N/A' }}</td>
        <td>{{ $pub['pages'] ?? 'N/A' }}</td>
        <td>{{ $pub['impact_factor'] ?? 'N/A' }}</td>
        <td style="font-size:7.5pt;">{{ $pub['doi'] ?? 'N/A' }}</td>
        <td>{{ $pub['status'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="11" class="empty-row">N/A</td></tr>
    @endforelse
</table>

<div class="sub-title">(B) Conference Publications</div>
<table>
    <tr>
        <th>#</th>
        <th>Author(s)</th>
        <th>Paper Title</th>
        <th>Conference Name</th>
        <th>Year</th>
        <th>Pages</th>
        <th>DOI</th>
    </tr>
    @forelse($dpubs['conferences'] ?? [] as $i => $pub)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $pub['authors'] ?? 'N/A' }}</td>
        <td>{{ $pub['title'] ?? 'N/A' }}</td>
        <td>{{ $pub['conference_name'] ?? 'N/A' }}</td>
        <td>{{ $pub['year'] ?? 'N/A' }}</td>
        <td>{{ $pub['pages'] ?? 'N/A' }}</td>
        <td style="font-size:7.5pt;">{{ $pub['doi'] ?? 'N/A' }}</td>
    </tr>
    @empty
    <tr><td colspan="7" class="empty-row">N/A</td></tr>
    @endforelse
</table>

{{-- ═══════════════════════════════════════════════════════════
     SECTION 9 — REFEREES
═══════════════════════════════════════════════════════════ --}}
<div class="page-break"></div>
<div class="section-title">9. Referees</div>

@forelse($data['referees_section']['referees'] ?? [] as $i => $ref)
<div class="sub-title">Referee {{ $i + 1 }}</div>
<table>
    <tr>
        <td class="lbl">Name</td>
        <td class="val"><strong>{{ $ref['name'] ?? 'N/A' }}</strong></td>
        <td class="lbl">Position</td>
        <td class="val">{{ $ref['position'] ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td class="lbl">Association</td>
        <td class="val">{{ $ref['association'] ?? 'N/A' }}</td>
        <td class="lbl">Institute / Organisation</td>
        <td class="val">{{ $ref['institute'] ?? 'N/A' }}</td>
    </tr>
<tr>
    <td class="lbl">E-mail</td>
    <td class="val">{{ $ref['email'] ?? 'N/A' }}</td>

    <td class="lbl">Contact No.</td>
    <td class="val">
        @if(!empty($ref['contact_number']))
            {{ ($ref['contact_code'] ?? '+91') . ' ' . $ref['contact_number'] }}
        @else
            N/A
        @endif
    </td>
</tr>
</table>
@empty
<table><tr><td class="empty-row">N/A</td></tr></table>
@endforelse

{{-- ═══════════════════════════════════════════════════════════
     SECTION 10 — DECLARATION & SIGNATURE
═══════════════════════════════════════════════════════════ --}}
<div class="section-title">10. Declaration</div>
<div class="text-content" style="background:#f0fdf4; border-color:#86efac;">
    I hereby declare that I have carefully read and understood the instructions and particulars mentioned in the advertisement and this application form. I further declare that all the entries along with the attachments uploaded in this form are true to the best of my knowledge and belief.
    <br><br>
    <strong>Declaration agreed:</strong>
    {{ !empty($data['form_data']['declaration']) || !empty($data['declaration']) ? 'Yes – Agreed' : 'N/A' }}
</div>

<div class="signature-box">
    <div class="signature-line">
        {{ strtoupper(trim(($p['first_name'] ?? '') . ' ' . ($p['last_name'] ?? ''))) ?: 'APPLICANT' }}<br>
        <span style="font-weight:normal;font-size:7.5pt;color:#64748b;">Signature of Applicant</span>
    </div>
</div>

</body>
</html>
