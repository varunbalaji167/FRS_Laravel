<?php

namespace App\Services\Applications;

use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * One place for PDF and CSV export, shared by the applicant, admin and HOD
 * controllers.
 */
class DossierExporter
{
    public function exportPdf(JobApplication $application): Response
    {
        $data = $application->form_data ?? [];
        $p = $data['personal_details'] ?? [];

        $pdf = Pdf::loadView('pdf.application_format', [
            'application' => $application,
            'advertisement' => $application->advertisement,
            'data' => $data,
        ])->setPaper('a4', 'portrait');

        $rawRef = $application->advertisement->reference_number ?? 'Unknown';
        $safeRef = str_replace(['/', '\\'], '_', $rawRef);
        $firstName = str_replace(['/', '\\'], '', ($p['first_name'] ?? $application->user_id));
        $fileName = "Applicant_{$firstName}_Ref_{$safeRef}.pdf";

        return $pdf->stream($fileName);
    }

    /**
     * Full-dossier CSV, aligned with pdf/application_format.blade.php.
     */
    public function exportExcel(JobApplication $application): StreamedResponse
    {
        $data = $application->form_data ?? [];
        $p = $data['personal_details'] ?? [];

        $firstName = str_replace(['/', '\\'], '', ($p['first_name'] ?? $application->user_id));
        $fileName = "Applicant_{$firstName}_Full_Dossier.csv";

        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($application, $data, $p) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM so Excel opens it correctly
            fwrite($file, "\xEF\xBB\xBF");

            // Every row goes through this helper. Passing an explicit empty
            // $escape disables fputcsv's legacy backslash escaping — that
            // default is deprecated from PHP 8.4 and can mis-encode values
            // containing \ or ", producing CSV Excel misreads.
            $put = fn (array $row = []) => fputcsv($file, $row, ',', '"', '');
            // ── helper: write a blank separator row ──
            $blank = fn () => $put([]);

            $put(['═══ APPLICATION SUMMARY ═══']);
            $put(['Field', 'Value']);
            $put(['Application ID',      $application->id]);
            $put(['Advertisement Ref.',   $application->advertisement->reference_number ?? 'N/A']);
            $put(['Advertisement Title',  $application->advertisement->title ?? 'N/A']);
            $put(['Department / School',  $application->department_name ?? 'N/A']);
            $put(['Grade / Post',         $application->grade ?? 'N/A']);
            $put(['Status',               ucfirst($application->status ?? 'N/A')]);
            $put(['Submitted At',         $application->created_at ? $application->created_at->format('d/m/Y H:i') : 'N/A']);
            $blank();

            $put(['═══ SECTION 1: PERSONAL DETAILS ═══']);
            $put(['Field', 'Value']);
            // Blade renders full name as a combined field; export each part + combined
            $put(['Full Name',
                trim(($p['first_name'] ?? '').' '.($p['middle_name'] ?? '').' '.($p['last_name'] ?? '')) ?: 'N/A',
            ]);
            $put(['First Name',        $p['first_name'] ?? 'N/A']);
            $put(['Middle Name',        $p['middle_name'] ?? 'N/A']);
            $put(['Last Name',          $p['last_name'] ?? 'N/A']);
            $put(["Father's Name",      $p['fathers_name'] ?? 'N/A']);
            $put(['Date of Birth',      $p['dob'] ?? 'N/A']);
            $put(['Gender',             $p['gender'] ?? 'N/A']);
            $put(['Category',           $p['category'] ?? 'N/A']);
            $put(['Marital Status',     $p['marital_status'] ?? 'N/A']);
            $put(['Nationality',        $p['nationality'] ?? 'N/A']);
            // Blade shows "ID Proof: type: number" combined
            $put(['ID Proof Type',      $p['id_proof_type'] ?? 'N/A']);
            $put(['ID Proof Number',    $p['id_proof_number'] ?? 'N/A']);
            $put(['Primary E-mail',     $p['email'] ?? 'N/A']);
            $put(['Alternate E-mail',   $p['alt_email'] ?? 'N/A']);
            // Blade: phone_code defaults to '+91' when phone is set
            $put(['Primary Mobile',
                ! empty($p['phone'])
                    ? (($p['phone_code'] ?? '+91').' '.$p['phone'])
                    : 'N/A',
            ]);
            $put(['Alternate Mobile',
                ! empty($p['alt_phone'])
                    ? (($p['alt_phone_code'] ?? '+91').' '.$p['alt_phone'])
                    : 'N/A',
            ]);
            // Correspondence Address
            $put(['Corr. Address',   $p['corr_address'] ?? 'N/A']);
            $put(['Corr. City',      $p['corr_city'] ?? 'N/A']);
            $put(['Corr. State',     $p['corr_state'] ?? 'N/A']);
            $put(['Corr. Country',   $p['corr_country'] ?? 'N/A']);
            $put(['Corr. PIN Code',  $p['corr_pincode'] ?? 'N/A']);
            // Permanent Address
            $put(['Perm. Address',   $p['perm_address'] ?? 'N/A']);
            $put(['Perm. City',      $p['perm_city'] ?? 'N/A']);
            $put(['Perm. State',     $p['perm_state'] ?? 'N/A']);
            $put(['Perm. Country',   $p['perm_country'] ?? 'N/A']);
            $put(['Perm. PIN Code',  $p['perm_pincode'] ?? 'N/A']);
            $blank();

            $edu = $data['education'] ?? [];
            $phd = $edu['phd'] ?? [];

            $put(['═══ SECTION 2: EDUCATIONAL QUALIFICATIONS ═══']);

            // ── (A) PhD ──
            $put(['--- (A) Ph.D. Details ---']);
            $put(['University / Institute', 'Department', 'Supervisor', 'Date of Joining', 'Date of Defence', 'Date of Award', 'Duration (YY-MM-DD)']);
            if (! empty($phd['university'])) {
                $put([
                    $phd['university'] ?? 'N/A',
                    $phd['department'] ?? 'N/A',
                    $phd['supervisor'] ?? 'N/A',
                    $phd['date_joining'] ?? 'N/A',
                    $phd['date_defence'] ?? 'N/A',
                    $phd['date_award'] ?? 'N/A',
                    $phd['duration'] ?? 'N/A',
                ]);
                $put([
                    'Thesis Title',
                    $phd['title'] ?? $phd['thesis_title'] ?? 'N/A',
                ]);
            } else {
                $put(['N/A']);
            }
            $blank();

            // ── (B) PG ──
            $put(['--- (B) Post-Graduate (PG) Details ---']);
            $put(['#', 'Degree', 'University / Institute', 'Subjects', 'Date Joined', 'Date Graduated', 'Duration (YY-MM-DD)', '% / CGPA', 'Class / Division']);
            foreach ($edu['pg'] ?? [] as $i => $row) {
                $put([
                    $i + 1,
                    $row['degree'] ?? 'N/A',
                    $row['university'] ?? 'N/A',
                    $row['subjects'] ?? 'N/A',
                    $row['date_joining'] ?? 'N/A',
                    $row['date_graduation'] ?? 'N/A',
                    $row['duration'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['pg'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (C) UG ──
            $put(['--- (C) Under-Graduate (UG) Details ---']);
            $put(['#', 'Degree', 'University / Institute', 'Subjects', 'Date Joined', 'Date Graduated', 'Duration (YY-MM-DD)', '% / CGPA', 'Class / Division']);
            foreach ($edu['ug'] ?? [] as $i => $row) {
                $put([
                    $i + 1,
                    $row['degree'] ?? 'N/A',
                    $row['university'] ?? 'N/A',
                    $row['subjects'] ?? 'N/A',
                    $row['date_joining'] ?? 'N/A',
                    $row['date_graduation'] ?? 'N/A',
                    $row['duration'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['ug'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (D) School ──
            $put(['--- (D) School Details ---']);
            $put(['Level', 'School / Board', 'Year of Passing', '% / CGPA', 'Division / Class']);
            foreach ($edu['school'] ?? [] as $i => $row) {
                $put([
                    $row['level'] ?? ($i === 0 ? '12th/HSC/Diploma' : '10th'),
                    $row['school'] ?? $row['board'] ?? 'N/A',
                    $row['year_passing'] ?? $row['date_graduation'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['school'])) {
                $put(['N/A']);
            }
            $blank();

            $emp = $data['employment'] ?? [];
            $pres = $emp['present'] ?? [];

            $put(['═══ SECTION 3: EMPLOYMENT DETAILS ═══']);

            // ── (A) Present Employment ──
            $put(['--- (A) Present Employment ---']);
            $put(['Position / Designation', 'Organization / Institute', 'Date of Joining', 'Date of Leaving', 'Duration (YY-MM-DD)']);
            if (! empty($pres['position'])) {
                $put([
                    $pres['position'] ?? 'N/A',
                    $pres['organization'] ?? 'N/A',
                    $pres['date_joining'] ?? 'N/A',
                    $pres['date_leaving'] ?? 'Continuing',
                    $pres['duration'] ?? 'N/A',
                ]);
            } else {
                $put(['N/A']);
            }
            $put(['Minimum 3 Yrs Experience (excl. PhD period)', $emp['has_three_years_exp'] ?? 'N/A']);
            $blank();

            // ── (B) Employment History ──
            $put(['--- (B) Employment History (All Previous) ---']);
            $put(['#', 'Position / Designation', 'Organization / Institute', 'Date of Joining', 'Date of Leaving', 'Duration (YY-MM-DD)']);
            foreach ($emp['history'] ?? [] as $i => $e) {
                $put([
                    $i + 1,
                    $e['position'] ?? 'N/A',
                    $e['organization'] ?? 'N/A',
                    $e['date_joining'] ?? 'N/A',
                    $e['date_leaving'] ?? 'N/A',
                    $e['duration'] ?? 'N/A',
                ]);
            }
            if (empty($emp['history'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (C) Teaching Experience ──
            $put(['--- (C) Teaching Experience ---']);
            $put(['#', 'Position', 'Employer', 'Course Taught', 'Level', 'No. of Students', 'Date of Joining', 'Date of Leaving', 'Duration (YY-MM-DD)']);
            foreach ($emp['teaching'] ?? [] as $i => $e) {
                $put([
                    $i + 1,
                    $e['position'] ?? 'N/A',
                    $e['employer'] ?? 'N/A',
                    $e['courses'] ?? 'N/A',
                    $e['level'] ?? 'N/A',
                    $e['students'] ?? '0',
                    $e['date_joining'] ?? 'N/A',
                    $e['date_leaving'] ?? 'N/A',
                    $e['duration'] ?? 'N/A',
                ]);
            }
            if (empty($emp['teaching'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (D) Research Experience ──
            $put(['--- (D) Research Experience ---']);
            $put(['#', 'Position', 'Institute', 'Supervisor', 'Date Joined', 'Date Left', 'Duration (YY-MM-DD)']);
            foreach ($emp['research'] ?? [] as $i => $e) {
                $put([
                    $i + 1,
                    $e['position'] ?? 'N/A',
                    $e['institute'] ?? 'N/A',
                    $e['supervisor'] ?? 'N/A',
                    $e['date_joining'] ?? 'N/A',
                    $e['date_leaving'] ?? 'N/A',
                    $e['duration'] ?? 'N/A',
                ]);
            }
            if (empty($emp['research'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (E) Industrial Experience ──
            $put(['--- (E) Industrial Experience ---']);
            $put(['#', 'Organization', 'Work Profile', 'Date Joined', 'Date Left', 'Duration (YY-MM-DD)']);
            foreach ($emp['industrial'] ?? [] as $i => $e) {
                $put([
                    $i + 1,
                    $e['organization'] ?? 'N/A',
                    $e['profile'] ?? 'N/A',
                    $e['date_joining'] ?? 'N/A',
                    $e['date_leaving'] ?? 'N/A',
                    $e['duration'] ?? 'N/A',
                ]);
            }
            if (empty($emp['industrial'])) {
                $put(['N/A']);
            }
            $blank();

            $res = $data['research'] ?? [];
            $spec = $res['specialization'] ?? [];
            $sum = $res['summary'] ?? [];

            $put(['═══ SECTION 4: RESEARCH — SPECIALIZATION & PUBLICATION SUMMARY ═══']);

            $put(['Area(s) of Specialization', 'Current Area(s) of Research']);
            $put([
                $spec['area_of_specialization'] ?? 'N/A',
                $spec['current_area_of_research'] ?? 'N/A',
            ]);
            $blank();

            $put(['--- Summary of Publications ---']);
            $put(['Intl. Journal Papers', 'Natl. Journal Papers', 'Intl. Conferences', 'Natl. Conferences', 'Patents', 'Books', 'Book Chapters']);
            $put([
                $sum['intl_journals'] ?? '0',
                $sum['natl_journals'] ?? '0',
                $sum['intl_conferences'] ?? '0',
                $sum['natl_conferences'] ?? '0',
                $sum['patents'] ?? '0',
                $sum['books'] ?? '0',
                $sum['book_chapters'] ?? '0',
            ]);
            $blank();

            $put(['--- List of Best Research Publications (up to 10) ---']);
            $put(['#', 'Title', 'Author(s)', 'Journal / Conference', 'Year', 'Vol. & Page', 'Impact Factor', 'DOI / URL', 'Status']);
            foreach ($res['publications'] ?? [] as $i => $pub) {
                $put([
                    $i + 1,
                    $pub['title'] ?? 'N/A',
                    $pub['authors'] ?? 'N/A',
                    $pub['journal'] ?? 'N/A',
                    $pub['year'] ?? 'N/A',
                    $pub['vol_page'] ?? 'N/A',
                    $pub['impact_factor'] ?? 'N/A',
                    $pub['doi'] ?? 'N/A',
                    $pub['status'] ?? 'N/A',
                ]);
            }
            if (empty($res['publications'])) {
                $put(['N/A']);
            }
            $blank();

            $info = $data['additional_info'] ?? [];

            $put(['═══ SECTION 5: ADDITIONAL INFORMATION ═══']);

            // ── (A) Patents ──
            $put(['--- (A) Patents ---']);
            $put(['#', 'Inventor(s)', 'Title of Patent', 'Country', 'Patent No.', 'Date Filed', 'Date Published', 'Status']);
            foreach ($info['patents'] ?? [] as $i => $pat) {
                $put([
                    $i + 1,
                    $pat['inventors'] ?? 'N/A',
                    $pat['title'] ?? 'N/A',
                    $pat['country'] ?? 'N/A',
                    $pat['number'] ?? 'N/A',
                    $pat['date_filed'] ?? 'N/A',
                    $pat['date_published'] ?? 'N/A',
                    $pat['status'] ?? 'N/A',
                ]);
            }
            if (empty($info['patents'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (B) Books ──
            $put(['--- (B) Books ---']);
            $put(['#', 'Author(s)', 'Title', 'Year', 'ISBN']);
            foreach ($info['books'] ?? [] as $i => $bk) {
                $put([
                    $i + 1,
                    $bk['authors'] ?? 'N/A',
                    $bk['title'] ?? 'N/A',
                    $bk['year'] ?? 'N/A',
                    $bk['isbn'] ?? 'N/A',
                ]);
            }
            if (empty($info['books'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (C) Book Chapters ──
            $put(['--- (C) Book Chapters ---']);
            $put(['#', 'Author(s)', 'Title', 'Year', 'ISBN']);
            foreach ($info['book_chapters'] ?? [] as $i => $bc) {
                $put([
                    $i + 1,
                    $bc['authors'] ?? 'N/A',
                    $bc['title'] ?? 'N/A',
                    $bc['year'] ?? 'N/A',
                    $bc['isbn'] ?? 'N/A',
                ]);
            }
            if (empty($info['book_chapters'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (D) Google Scholar ──
            $put(['--- (D) Google Scholar Profile ---']);
            $put(['Google Scholar URL', $info['google_scholar'] ?? 'N/A']);
            $blank();

            // ── (E) Membership of Professional Societies ──
            $put(['--- (E) Membership of Professional Societies ---']);
            $put(['#', 'Name of Professional Society', 'Membership Status']);
            foreach ($info['societies'] ?? [] as $i => $soc) {
                $put([
                    $i + 1,
                    $soc['name'] ?? 'N/A',
                    $soc['status'] ?? 'N/A',
                ]);
            }
            if (empty($info['societies'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (F) Professional Training ──
            $put(['--- (F) Professional Training ---']);
            $put(['#', 'Type of Training', 'Organisation', 'Year', 'Duration (YY-MM-DD)']);
            foreach ($info['training'] ?? [] as $i => $tr) {
                $put([
                    $i + 1,
                    $tr['type'] ?? 'N/A',
                    $tr['organization'] ?? 'N/A',
                    $tr['year'] ?? 'N/A',
                    $tr['duration'] ?? 'N/A',
                ]);
            }
            if (empty($info['training'])) {
                $put(['N/A']);
            }
            $blank();

            $ap = $data['awards_projects'] ?? [];

            $put(['═══ SECTION 6: AWARDS, SUPERVISION & SPONSORED PROJECTS ═══']);

            // ── (A) Awards ──
            $put(['--- (A) Awards and Recognitions ---']);
            $put(['#', 'Name of the Award / Recognition', 'Awarded By', 'Year']);
            foreach ($ap['awards'] ?? [] as $i => $aw) {
                $put([
                    $i + 1,
                    $aw['name'] ?? 'N/A',
                    $aw['awarded_by'] ?? 'N/A',
                    $aw['year'] ?? 'N/A',
                ]);
            }
            if (empty($ap['awards'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (B-i) PhD Supervision ──
            $put(['--- (B-i) PhD Thesis Supervision ---']);
            $put(['#', 'Name of Scholar', 'Title of Thesis', 'Role', 'Status', 'Year']);
            foreach ($ap['phd_supervision'] ?? [] as $i => $sup) {
                $put([
                    $i + 1,
                    $sup['student_name'] ?? 'N/A',
                    $sup['title'] ?? 'N/A',
                    $sup['role'] ?? 'N/A',
                    $sup['status'] ?? 'N/A',
                    $sup['year'] ?? 'N/A',
                ]);
            }
            if (empty($ap['phd_supervision'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (B-ii) PG / M.Tech Supervision ──
            $put(['--- (B-ii) M.Tech / Masters Thesis Supervision ---']);
            $put(['#', 'Name of Student', 'Title of Thesis / Project', 'Role', 'Status', 'Year']);
            foreach ($ap['pg_supervision'] ?? [] as $i => $sup) {
                $put([
                    $i + 1,
                    $sup['student_name'] ?? 'N/A',
                    $sup['title'] ?? 'N/A',
                    $sup['role'] ?? 'N/A',
                    $sup['status'] ?? 'N/A',
                    $sup['year'] ?? 'N/A',
                ]);
            }
            if (empty($ap['pg_supervision'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (B-iii) UG / B.Tech Supervision ──
            $put(['--- (B-iii) B.Tech / Bachelor\'s Project Supervision ---']);
            $put(['#', 'Name of Student', 'Title of Project', 'Role', 'Status', 'Year']);
            foreach ($ap['ug_supervision'] ?? [] as $i => $sup) {
                $put([
                    $i + 1,
                    $sup['student_name'] ?? 'N/A',
                    $sup['title'] ?? 'N/A',
                    $sup['role'] ?? 'N/A',
                    $sup['status'] ?? 'N/A',
                    $sup['year'] ?? 'N/A',
                ]);
            }
            if (empty($ap['ug_supervision'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (C-i) Sponsored Projects ──
            $put(['--- (C-i) Sponsored Projects ---']);
            $put(['#', 'Sponsoring Agency', 'Title of Project', 'Amount', 'Period', 'Role', 'Status']);
            foreach ($ap['sponsored_projects'] ?? [] as $i => $proj) {
                $put([
                    $i + 1,
                    $proj['agency'] ?? 'N/A',
                    $proj['title'] ?? 'N/A',
                    $proj['amount'] ?? 'N/A',
                    $proj['period'] ?? 'N/A',
                    $proj['role'] ?? 'N/A',
                    $proj['status'] ?? 'N/A',
                ]);
            }
            if (empty($ap['sponsored_projects'])) {
                $put(['N/A']);
            }
            $blank();

            // ── (C-ii) Consultancy Projects ──
            $put(['--- (C-ii) Consultancy Projects ---']);
            $put(['#', 'Organisation / Agency', 'Title of Project', 'Amount', 'Period', 'Role', 'Status']);
            foreach ($ap['consultancy_projects'] ?? [] as $i => $proj) {
                $put([
                    $i + 1,
                    $proj['agency'] ?? 'N/A',
                    $proj['title'] ?? 'N/A',
                    $proj['amount'] ?? 'N/A',
                    $proj['period'] ?? 'N/A',
                    $proj['role'] ?? 'N/A',
                    $proj['status'] ?? 'N/A',
                ]);
            }
            if (empty($ap['consultancy_projects'])) {
                $put(['N/A']);
            }
            $blank();

            $stmts = $data['statements'] ?? [];

            $put(['═══ SECTION 7: CONTRIBUTIONS & FUTURE PLANS ═══']);
            $put(['(A) Significant Research Contribution and Future Plans']);
            $put([$stmts['research_plan'] ?? 'N/A']);
            $blank();
            $put(['(B) Significant Teaching Contribution and Future Plans']);
            $put([$stmts['teaching_plan'] ?? 'N/A']);
            $blank();
            $put(['(C) Professional Service as Reviewer / Editor etc.']);
            $put([$stmts['professional_service'] ?? 'N/A']);
            $blank();
            $put(['(D) Any Other Relevant Information']);
            $put([$stmts['other_info'] ?? 'N/A']);
            $blank();

            $dpubs = $data['detailed_pubs'] ?? [];

            $put(['═══ SECTION 8: DETAILED LIST OF PUBLICATIONS ═══']);

            $put(['--- (A) Journal Publications ---']);
            $put(['#', 'Author(s)', 'Paper Title', 'Journal Name', 'Year', 'Volume', 'Issue', 'Pages', 'Impact Factor', 'DOI', 'Status']);
            foreach ($dpubs['journals'] ?? [] as $i => $pub) {
                $put([
                    $i + 1,
                    $pub['authors'] ?? 'N/A',
                    $pub['title'] ?? 'N/A',
                    $pub['journal_name'] ?? 'N/A',
                    $pub['year'] ?? 'N/A',
                    $pub['volume'] ?? 'N/A',
                    $pub['issue'] ?? 'N/A',
                    $pub['pages'] ?? 'N/A',
                    $pub['impact_factor'] ?? 'N/A',
                    $pub['doi'] ?? 'N/A',
                    $pub['status'] ?? 'N/A',
                ]);
            }
            if (empty($dpubs['journals'])) {
                $put(['N/A']);
            }
            $blank();

            $put(['--- (B) Conference Publications ---']);
            $put(['#', 'Author(s)', 'Paper Title', 'Conference Name', 'Year', 'Pages', 'DOI']);
            foreach ($dpubs['conferences'] ?? [] as $i => $pub) {
                $put([
                    $i + 1,
                    $pub['authors'] ?? 'N/A',
                    $pub['title'] ?? 'N/A',
                    $pub['conference_name'] ?? 'N/A',
                    $pub['year'] ?? 'N/A',
                    $pub['pages'] ?? 'N/A',
                    $pub['doi'] ?? 'N/A',
                ]);
            }
            if (empty($dpubs['conferences'])) {
                $put(['N/A']);
            }
            $blank();

            $put(['═══ SECTION 9: REFEREES ═══']);
            $put(['#', 'Name', 'Position', 'Association', 'Institute / Organisation', 'E-mail', 'Contact No.']);
            foreach ($data['referees_section']['referees'] ?? [] as $i => $ref) {
                $contactNo = ! empty($ref['contact_number'])
                    ? (($ref['contact_code'] ?? '+91').' '.$ref['contact_number'])
                    : 'N/A';

                $put([
                    $i + 1,
                    $ref['name'] ?? 'N/A',
                    $ref['position'] ?? 'N/A',
                    $ref['association'] ?? 'N/A',
                    $ref['institute'] ?? 'N/A',
                    $ref['email'] ?? 'N/A',
                    $contactNo,
                ]);
            }
            if (empty($data['referees_section']['referees'])) {
                $put(['N/A']);
            }
            $blank();

            $declared = ! empty($data['declaration']);
            $put(['═══ SECTION 10: DECLARATION ═══']);
            $put(['Declaration Agreed', $declared ? 'Yes – Agreed' : 'N/A']);

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
