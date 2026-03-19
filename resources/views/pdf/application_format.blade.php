<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header h3 { margin: 5px 0; font-size: 14px; }
        .header p { margin: 2px 0; font-weight: bold; }
        
        .section-title { 
            background-color: #f0f0f0; 
            padding: 6px; 
            font-weight: bold; 
            font-size: 12px;
            margin-top: 20px; 
            margin-bottom: 5px;
            border: 1px solid #ccc; 
        }
        .sub-title { font-weight: bold; margin-top: 10px; font-size: 11px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; }
        th, td { border: 1px solid #ccc; padding: 5px; text-align: left; vertical-align: top; }
        th { background-color: #fafafa; font-weight: bold; }
        
        .text-content { border: 1px solid #ccc; padding: 10px; background-color: #fff; min-height: 50px; }
        .page-break { page-break-before: always; }
        
        .signature-box { margin-top: 40px; text-align: right; padding-right: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Indian Institute of Technology Indore</h2>
        <h3>Application for Faculty Position</h3>
        <p>Reference: {{ $advertisement->reference_number ?? 'N/A' }}</p>
    </div>

    <div class="section-title">1. Personal Details</div>
    <table>
        <tr>
            <td><strong>Name:</strong> {{ $data['personal_details']['first_name'] ?? '' }} {{ $data['personal_details']['last_name'] ?? '' }}</td>
            <td><strong>DOB:</strong> {{ $data['personal_details']['dob'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td><strong>Email:</strong> {{ $data['personal_details']['email'] ?? 'N/A' }}</td>
            <td><strong>Phone:</strong> {{ $data['personal_details']['phone'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td><strong>Gender:</strong> {{ $data['personal_details']['gender'] ?? 'N/A' }}</td>
            <td><strong>Category:</strong> {{ $data['personal_details']['category'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="section-title">2. Educational Qualifications</div>
    
    <div class="sub-title">(A) Ph. D. Details</div>
    <table>
        <tr>
            <th>University / Institute</th>
            <th>Department</th>
            <th>Year of Joining</th>
            <th>Date of Award</th>
        </tr>
        <tr>
            <td>{{ $data['education']['phd']['university'] ?? 'N/A' }}</td>
            <td>{{ $data['education']['phd']['department'] ?? 'N/A' }}</td>
            <td>{{ $data['education']['phd']['year_joining'] ?? 'N/A' }}</td>
            <td>{{ $data['education']['phd']['date_award'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td colspan="4"><strong>Thesis Title:</strong> {{ $data['education']['phd']['title'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="sub-title">(B) Academic Details - PG</div>
    <table>
        <tr>
            <th>Degree</th>
            <th>University/Institute</th>
            <th>Year of Joining</th>
            <th>Year of Graduation</th>
            <th>Percentage/CGPA</th>
        </tr>
        @forelse($data['education']['pg'] ?? [] as $pg)
        <tr>
            <td>{{ $pg['degree'] ?? 'N/A' }}</td>
            <td>{{ $pg['university'] ?? 'N/A' }}</td>
            <td>{{ $pg['year_joining'] ?? 'N/A' }}</td>
            <td>{{ $pg['year_graduation'] ?? 'N/A' }}</td>
            <td>{{ $pg['cgpa'] ?? 'N/A' }}</td>
        </tr>
        @empty
        <tr><td colspan="5">No PG details provided.</td></tr>
        @endforelse
    </table>

    <div class="section-title">3. Employment Details</div>
    <div class="sub-title">(A) Present Employment</div>
    <table>
        <tr>
            <th>Position</th>
            <th>Organization/Institute</th>
            <th>Date of Joining</th>
            <th>Duration</th>
        </tr>
        <tr>
            <td>{{ $data['employment']['present']['position'] ?? 'N/A' }}</td>
            <td>{{ $data['employment']['present']['organization'] ?? 'N/A' }}</td>
            <td>{{ $data['employment']['present']['date_joining'] ?? 'N/A' }}</td>
            <td>{{ $data['employment']['present']['duration'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="sub-title">(B) Employment History</div>
    <table>
        <tr>
            <th>Position</th>
            <th>Organization</th>
            <th>Date of Joining</th>
            <th>Date of Leaving</th>
            <th>Duration</th>
        </tr>
        @forelse($data['employment']['history'] ?? [] as $emp)
        <tr>
            <td>{{ $emp['position'] ?? 'N/A' }}</td>
            <td>{{ $emp['organization'] ?? 'N/A' }}</td>
            <td>{{ $emp['date_joining'] ?? 'N/A' }}</td>
            <td>{{ $emp['date_leaving'] ?? 'N/A' }}</td>
            <td>{{ $emp['duration'] ?? 'N/A' }}</td>
        </tr>
        @empty
        <tr><td colspan="5">No employment history provided.</td></tr>
        @endforelse
    </table>

    <div class="section-title">4. Area(s) of Specialization and Current Area(s) of Research</div>
    <table>
        <tr>
            <th style="width: 50%;">Area(s) of Specialization</th>
            <th style="width: 50%;">Current Area(s) of Research</th>
        </tr>
        <tr>
            <td>{!! nl2br(e($data['research']['specialization']['area_of_specialization'] ?? 'N/A')) !!}</td>
            <td>{!! nl2br(e($data['research']['specialization']['current_area_of_research'] ?? 'N/A')) !!}</td>
        </tr>
    </table>

    <div class="section-title">5. Summary of Publications</div>
    <table>
        <tr>
            <td>International Journal Papers: <strong>{{ $data['research']['summary']['intl_journals'] ?? '0' }}</strong></td>
            <td>National Journal Papers: <strong>{{ $data['research']['summary']['natl_journals'] ?? '0' }}</strong></td>
            <td>International Conference: <strong>{{ $data['research']['summary']['intl_conferences'] ?? '0' }}</strong></td>
        </tr>
        <tr>
            <td>National Conference: <strong>{{ $data['research']['summary']['natl_conferences'] ?? '0' }}</strong></td>
            <td>Patents: <strong>{{ $data['research']['summary']['patents'] ?? '0' }}</strong></td>
            <td>Books / Chapters: <strong>{{ $data['research']['summary']['books'] ?? '0' }} / {{ $data['research']['summary']['book_chapters'] ?? '0' }}</strong></td>
        </tr>
    </table>

    <div class="section-title">6. List of atmost 10 Best Research Publications</div>
    <table>
        <tr>
            <th>S.No.</th>
            <th>Author(s)</th>
            <th>Title</th>
            <th>Journal/Conf</th>
            <th>Year</th>
            <th>Impact Factor</th>
        </tr>
        @forelse($data['research']['publications'] ?? [] as $index => $pub)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $pub['authors'] ?? '' }}</td>
            <td>{{ $pub['title'] ?? '' }}</td>
            <td>{{ $pub['journal'] ?? '' }}</td>
            <td>{{ $pub['year'] ?? '' }}</td>
            <td>{{ $pub['impact_factor'] ?? '' }}</td>
        </tr>
        @empty
        <tr><td colspan="6">No publications listed.</td></tr>
        @endforelse
    </table>

    <div class="section-title">7 - 11. Additional Information & Awards</div>
    <div class="sub-title">Patents / Books / Societies / Training</div>
    <table>
        <tr><td><em>(Refer to detailed application for full breakdown of patents, books, and professional memberships)</em></td></tr>
    </table>

    <div class="sub-title">11. Award(s) and Recognition(s)</div>
    <table>
        <tr>
            <th>S.No.</th>
            <th>Name of the Award</th>
            <th>Awarded By</th>
            <th>Year</th>
        </tr>
        @forelse($data['awards_projects']['awards'] ?? [] as $index => $award)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $award['name'] ?? '' }}</td>
            <td>{{ $award['awarded_by'] ?? '' }}</td>
            <td>{{ $award['year'] ?? '' }}</td>
        </tr>
        @empty
        <tr><td colspan="4">No awards listed.</td></tr>
        @endforelse
    </table>

    <div class="page-break"></div>

    <div class="section-title">12. Research Supervision</div>
    <table>
        <tr>
            <th>S.No.</th>
            <th>Name of Student</th>
            <th>Title of Thesis</th>
            <th>Role</th>
            <th>Status (Year)</th>
        </tr>
        @forelse($data['awards_projects']['phd_supervision'] ?? [] as $index => $sup)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $sup['student_name'] ?? '' }}</td>
            <td>{{ $sup['title'] ?? '' }}</td>
            <td>{{ $sup['role'] ?? '' }}</td>
            <td>{{ $sup['status'] ?? '' }} ({{ $sup['year'] ?? '' }})</td>
        </tr>
        @empty
        <tr><td colspan="5">No PhD supervision listed.</td></tr>
        @endforelse
    </table>

    <div class="section-title">13. Sponsored Projects / Consultancy</div>
    <table>
        <tr>
            <th>S.No.</th>
            <th>Sponsoring Agency</th>
            <th>Title of Project</th>
            <th>Amount</th>
            <th>Status</th>
        </tr>
        @forelse($data['awards_projects']['sponsored_projects'] ?? [] as $index => $proj)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $proj['agency'] ?? '' }}</td>
            <td>{{ $proj['title'] ?? '' }}</td>
            <td>{{ $proj['amount'] ?? '' }}</td>
            <td>{{ $proj['status'] ?? '' }}</td>
        </tr>
        @empty
        <tr><td colspan="5">No sponsored projects listed.</td></tr>
        @endforelse
    </table>

    <div class="section-title">14. Significant research contribution and future plans</div>
    <div class="text-content">
        {!! nl2br(e($data['statements']['research_plan'] ?? 'No statement provided.')) !!}
    </div>

    <div class="section-title">15. Significant teaching contribution and future plans</div>
    <div class="text-content">
        {!! nl2br(e($data['statements']['teaching_plan'] ?? 'No statement provided.')) !!}
    </div>

    <div class="section-title">18 & 19. Detailed List of Publications</div>
    <table>
        <tr>
            <th>S.No.</th>
            <th>Title</th>
            <th>Journal / Conference</th>
            <th>Year</th>
            <th>DOI / Status</th>
        </tr>
        @forelse($data['detailed_pubs']['journals'] ?? [] as $index => $pub)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $pub['title'] ?? '' }}</td>
            <td>{{ $pub['journal_name'] ?? '' }}</td>
            <td>{{ $pub['year'] ?? '' }}</td>
            <td>{{ $pub['doi'] ?? '' }} ({{ $pub['status'] ?? '' }})</td>
        </tr>
        @empty
        <tr><td colspan="5">No detailed publications provided.</td></tr>
        @endforelse
    </table>

    <div class="section-title">22. Referees</div>
    <table>
        <tr>
            <th>Name</th>
            <th>Position & Association</th>
            <th>Institute</th>
            <th>Email & Contact</th>
        </tr>
        @forelse($data['referees_section']['referees'] ?? [] as $ref)
        <tr>
            <td>{{ $ref['name'] ?? '' }}</td>
            <td>{{ $ref['position'] ?? '' }}<br><em>({{ $ref['association'] ?? '' }})</em></td>
            <td>{{ $ref['institute'] ?? '' }}</td>
            <td>{{ $ref['email'] ?? '' }}<br>{{ $ref['contact'] ?? '' }}</td>
        </tr>
        @empty
        <tr><td colspan="4">No referees listed.</td></tr>
        @endforelse
    </table>

    <div class="section-title">23. Final Declaration</div>
    <div class="text-content" style="border: none; padding: 0;">
        <p>I hereby declare that I have carefully read and understood the instructions and particulars mentioned in the advertisement and this application form. I further declare that all the entries along with the attachments uploaded in this form are true to the best of my knowledge and belief.</p>
    </div>
    
    <div class="signature-box">
        <p><strong>{{ $data['personal_details']['first_name'] ?? '' }} {{ $data['personal_details']['last_name'] ?? '' }}</strong></p>
        <p>Signature of Applicant </p>
    </div>

</body>
</html>