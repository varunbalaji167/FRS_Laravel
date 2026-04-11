<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    /**
     * Enforce departmental security boundaries.
     * Admins see all applications. HODs only see applications for their assigned department.
     */
    private function getScopedQuery(Request $request)
    {
        $query = JobApplication::with(['user', 'advertisement']);

        if ($request->user()->role === 'hod') {
            $query->where('department', $request->user()->department);
        }

        return $query;
    }

    public function index(Request $request)
    {
        // 1. Secure the base query
        $query = $this->getScopedQuery($request)
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected']);

        if ($request->filled('advertisement_id')) {
            $query->where('advertisement_id', $request->advertisement_id);
        }

        // If user is HOD, this filter is somewhat redundant but safe. If Admin, it filters dynamically.
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // paginate() + withQueryString() bakes active filter params into next_page_url
        // so the frontend never has to manually reconstruct the URL on each scroll fetch.
        $applications = $query->latest()->paginate(5)->withQueryString();

        // CHANGE 1: Removed the stale $advertisements variable that sat on the
        // original line 51. It fetched from DB and was immediately thrown away
        // because the identical query was repeated inside the return block.

        $viewFolder = $request->user()->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Applications/Index", [
            // Always a plain value — evaluated and sent on every request.
            // On scroll the frontend sends only:['applications'], so Inertia
            // returns only this key in the JSON, keeping the payload tiny.
            'applications' => $applications,

            // CHANGE 2: Converted to closures (fn() =>).
            //
            // Inertia behaviour for closures vs plain values:
            //   Plain value  → PHP evaluates it immediately on every request,
            //                  regardless of whether the frontend asked for it.
            //   Closure      → Inertia calls it ONLY when the frontend explicitly
            //                  requests that prop. On a scroll request that sends
            //                  only:['applications'], these three closures are
            //                  never called — zero DB queries for ads/depts/filters.
            //
            // On the initial full page load all props are requested, so all three
            // closures run and their data reaches the frontend as normal.
            'advertisements' => fn () => Advertisement::select('id', 'title', 'reference_number')->get(),
            'departments' => fn () => Department::orderBy('name')->get(),
            'filters' => fn () => $request->only(['advertisement_id', 'department', 'status']),
        ]);
    }

    public function show(Request $request, $id)
    {
        $application = clone $this->getScopedQuery($request)->findOrFail($id);

        // Dynamically choose view folder
        $viewFolder = $request->user()->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Applications/Show", [
            'application' => $application,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:submitted,shortlisted,rejected',
        ]);

        $application = clone $this->getScopedQuery($request)->findOrFail($id);

        $application->update(['status' => $request->status]);

        return back()->with('success', "Application status updated to {$request->status}.");
    }

    /**
     * Generate and stream the PDF on the fly.
     * Uses the comprehensive application_format blade template.
     */
    public function exportPdf(Request $request, $id)
    {
        $application = clone $this->getScopedQuery($request)->findOrFail($id);

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
     * Export a comprehensive CSV/Excel covering every field from every step.
     */
    public function exportExcel(Request $request, $id)
    {
        $application = clone $this->getScopedQuery($request)
            ->with('advertisement')
            ->findOrFail($id);

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

            // ── helper: write a blank separator row ──
            $blank = fn () => fputcsv($file, []);

            // ════════════════════════════════════════════════════
            // SECTION 0 — APPLICATION SUMMARY
            // ════════════════════════════════════════════════════
            fputcsv($file, ['═══ APPLICATION SUMMARY ═══']);
            fputcsv($file, ['Field', 'Value']);
            fputcsv($file, ['Application ID',      $application->id]);
            fputcsv($file, ['Advertisement Ref.',   $application->advertisement->reference_number ?? 'N/A']);
            fputcsv($file, ['Advertisement Title',  $application->advertisement->title ?? 'N/A']);
            fputcsv($file, ['Department Applied',   $application->department ?? 'N/A']);
            fputcsv($file, ['Grade / Post',         $application->grade ?? 'N/A']);
            fputcsv($file, ['Status',               ucfirst($application->status ?? 'N/A')]);
            fputcsv($file, ['Submitted At',         $application->created_at ? $application->created_at->format('d/m/Y H:i') : 'N/A']);
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 1 — PERSONAL DETAILS
            // ════════════════════════════════════════════════════
            fputcsv($file, ['═══ SECTION 1: PERSONAL DETAILS ═══']);
            fputcsv($file, ['Field', 'Value']);
            fputcsv($file, ['First Name',        $p['first_name'] ?? 'N/A']);
            fputcsv($file, ['Middle Name',       $p['middle_name'] ?? 'N/A']);
            fputcsv($file, ['Last Name',         $p['last_name'] ?? 'N/A']);
            fputcsv($file, ["Father's Name",     $p['fathers_name'] ?? 'N/A']);
            fputcsv($file, ['Date of Birth',     $p['dob'] ?? 'N/A']);
            fputcsv($file, ['Gender',            $p['gender'] ?? 'N/A']);
            fputcsv($file, ['Category',          $p['category'] ?? 'N/A']);
            fputcsv($file, ['Marital Status',    $p['marital_status'] ?? 'N/A']);
            fputcsv($file, ['Nationality',       $p['nationality'] ?? 'N/A']);
            fputcsv($file, ['ID Proof Type',     $p['id_proof_type'] ?? 'N/A']);
            fputcsv($file, ['ID Proof Number',   $p['id_proof_number'] ?? 'N/A']);
            fputcsv($file, ['Primary E-mail',    $p['email'] ?? 'N/A']);
            fputcsv($file, ['Alternate E-mail',  $p['alt_email'] ?? 'N/A']);
            fputcsv($file, ['Primary Mobile',    trim(($p['phone_code'] ?? '').' '.($p['phone'] ?? '')) ?: 'N/A']);
            fputcsv($file, ['Alternate Mobile',  trim(($p['alt_phone_code'] ?? '').' '.($p['alt_phone'] ?? '')) ?: 'N/A']);
            fputcsv($file, ['Corr. Address',     $p['corr_address'] ?? 'N/A']);
            fputcsv($file, ['Corr. City',        $p['corr_city'] ?? 'N/A']);
            fputcsv($file, ['Corr. State',       $p['corr_state'] ?? 'N/A']);
            fputcsv($file, ['Corr. Country',     $p['corr_country'] ?? 'N/A']);
            fputcsv($file, ['Corr. PIN Code',    $p['corr_pincode'] ?? 'N/A']);
            fputcsv($file, ['Perm. Address',     $p['perm_address'] ?? 'N/A']);
            fputcsv($file, ['Perm. City',        $p['perm_city'] ?? 'N/A']);
            fputcsv($file, ['Perm. State',       $p['perm_state'] ?? 'N/A']);
            fputcsv($file, ['Perm. Country',     $p['perm_country'] ?? 'N/A']);
            fputcsv($file, ['Perm. PIN Code',    $p['perm_pincode'] ?? 'N/A']);
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 2 — EDUCATIONAL QUALIFICATIONS
            // ════════════════════════════════════════════════════
            $edu = $data['education'] ?? [];
            $phd = $edu['phd'] ?? [];

            fputcsv($file, ['═══ SECTION 2: EDUCATIONAL QUALIFICATIONS ═══']);

            fputcsv($file, ['--- (A) Ph.D. Details ---']);
            fputcsv($file, ['Field', 'Value']);
            fputcsv($file, ['University / Institute', $phd['university'] ?? 'N/A']);
            fputcsv($file, ['Department',             $phd['department'] ?? 'N/A']);
            fputcsv($file, ['Supervisor',             $phd['supervisor'] ?? 'N/A']);
            fputcsv($file, ['Year of Joining',        $phd['year_joining'] ?? 'N/A']);
            fputcsv($file, ['Date of Defence',        $phd['date_defence'] ?? 'N/A']);
            fputcsv($file, ['Date of Award',          $phd['date_award'] ?? 'N/A']);
            fputcsv($file, ['Thesis Title',           $phd['title'] ?? 'N/A']);
            $blank();

            fputcsv($file, ['--- (B) Post-Graduate (PG) Details ---']);
            fputcsv($file, ['#', 'Degree', 'University/Institute', 'Subjects', 'Year Joined', 'Year Graduated', 'Percentage/CGPA', 'Division/Class']);
            foreach ($edu['pg'] ?? [] as $i => $row) {
                fputcsv($file, [
                    $i + 1,
                    $row['degree'] ?? 'N/A',
                    $row['university'] ?? 'N/A',
                    $row['subjects'] ?? 'N/A',
                    $row['year_joining'] ?? 'N/A',
                    $row['year_graduation'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['pg'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (C) Under-Graduate (UG) Details ---']);
            fputcsv($file, ['#', 'Degree', 'University/Institute', 'Subjects', 'Year Joined', 'Year Graduated', 'Percentage/CGPA', 'Division/Class']);
            foreach ($edu['ug'] ?? [] as $i => $row) {
                fputcsv($file, [
                    $i + 1,
                    $row['degree'] ?? 'N/A',
                    $row['university'] ?? 'N/A',
                    $row['subjects'] ?? 'N/A',
                    $row['year_joining'] ?? 'N/A',
                    $row['year_graduation'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['ug'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (D) School Details ---']);
            fputcsv($file, ['Level', 'School / Board', 'Year of Passing', 'Percentage/CGPA', 'Division/Class']);
            foreach ($edu['school'] ?? [] as $row) {
                fputcsv($file, [
                    $row['level'] ?? 'N/A',
                    $row['school'] ?? 'N/A',
                    $row['year_passing'] ?? 'N/A',
                    $row['percentage'] ?? 'N/A',
                    $row['division'] ?? 'N/A',
                ]);
            }
            if (empty($edu['school'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 3 — EMPLOYMENT
            // ════════════════════════════════════════════════════
            $emp = $data['employment'] ?? [];
            $pres = $emp['present'] ?? [];

            fputcsv($file, ['═══ SECTION 3: EMPLOYMENT DETAILS ═══']);

            fputcsv($file, ['--- (A) Present Employment ---']);
            fputcsv($file, ['Field', 'Value']);
            fputcsv($file, ['Position / Designation',   $pres['position'] ?? 'N/A']);
            fputcsv($file, ['Organization / Institute', $pres['organization'] ?? 'N/A']);
            fputcsv($file, ['Date of Joining',          $pres['date_joining'] ?? 'N/A']);
            fputcsv($file, ['Date of Leaving',          $pres['date_leaving'] ?? 'Continuing']);
            fputcsv($file, ['Duration (years)',         $pres['duration'] ?? 'N/A']);
            fputcsv($file, ['Has 3 Yrs Experience',    $emp['has_three_years_exp'] ?? 'N/A']);
            $blank();

            fputcsv($file, ['--- (B) Employment History ---']);
            fputcsv($file, ['#', 'Position', 'Organization', 'Date Joined', 'Date Left', 'Duration']);
            foreach ($emp['history'] ?? [] as $i => $e) {
                fputcsv($file, [$i + 1, $e['position'] ?? 'N/A', $e['organization'] ?? 'N/A', $e['date_joining'] ?? 'N/A', $e['date_leaving'] ?? 'N/A', $e['duration'] ?? 'N/A']);
            }
            if (empty($emp['history'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (C) Teaching Experience ---']);
            fputcsv($file, ['#', 'Position', 'Institute', 'Date Joined', 'Date Left', 'Duration']);
            foreach ($emp['teaching'] ?? [] as $i => $e) {
                fputcsv($file, [$i + 1, $e['position'] ?? 'N/A', $e['institute'] ?? 'N/A', $e['date_joining'] ?? 'N/A', $e['date_leaving'] ?? 'N/A', $e['duration'] ?? 'N/A']);
            }
            if (empty($emp['teaching'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (D) Research Experience ---']);
            fputcsv($file, ['#', 'Position', 'Institute', 'Supervisor', 'Date Joined', 'Date Left', 'Duration']);
            foreach ($emp['research'] ?? [] as $i => $e) {
                fputcsv($file, [$i + 1, $e['position'] ?? 'N/A', $e['institute'] ?? 'N/A', $e['supervisor'] ?? 'N/A', $e['date_joining'] ?? 'N/A', $e['date_leaving'] ?? 'N/A', $e['duration'] ?? 'N/A']);
            }
            if (empty($emp['research'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (E) Industrial Experience ---']);
            fputcsv($file, ['#', 'Organization', 'Work Profile', 'Date Joined', 'Date Left', 'Duration']);
            foreach ($emp['industrial'] ?? [] as $i => $e) {
                fputcsv($file, [$i + 1, $e['organization'] ?? 'N/A', $e['profile'] ?? 'N/A', $e['date_joining'] ?? 'N/A', $e['date_leaving'] ?? 'N/A', $e['duration'] ?? 'N/A']);
            }
            if (empty($emp['industrial'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 4 — RESEARCH & PUBLICATIONS
            // ════════════════════════════════════════════════════
            $res = $data['research'] ?? [];
            $spec = $res['specialization'] ?? [];
            $sum = $res['summary'] ?? [];

            fputcsv($file, ['═══ SECTION 4: RESEARCH & PUBLICATIONS ═══']);

            fputcsv($file, ['--- Area of Specialization & Research ---']);
            fputcsv($file, ['Field', 'Value']);
            fputcsv($file, ['Area(s) of Specialization',    $spec['area_of_specialization'] ?? 'N/A']);
            fputcsv($file, ['Current Area(s) of Research',  $spec['current_area_of_research'] ?? 'N/A']);
            $blank();

            fputcsv($file, ['--- Publication Summary Counts ---']);
            fputcsv($file, ['Intl. Journal Papers', 'Natl. Journal Papers', 'Intl. Conferences', 'Natl. Conferences', 'Patents', 'Books', 'Book Chapters']);
            fputcsv($file, [
                $sum['intl_journals'] ?? '0',
                $sum['natl_journals'] ?? '0',
                $sum['intl_conferences'] ?? '0',
                $sum['natl_conferences'] ?? '0',
                $sum['patents'] ?? '0',
                $sum['books'] ?? '0',
                $sum['book_chapters'] ?? '0',
            ]);
            $blank();

            fputcsv($file, ['--- Best Research Publications (up to 10) ---']);
            fputcsv($file, ['#', 'Title', 'Author(s)', 'Journal/Conference', 'Year', 'Vol. & Page', 'Impact Factor', 'DOI/URL', 'Status']);
            foreach ($res['publications'] ?? [] as $i => $pub) {
                fputcsv($file, [
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
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 5 — ADDITIONAL INFORMATION
            // ════════════════════════════════════════════════════
            $info = $data['additional_info'] ?? [];

            fputcsv($file, ['═══ SECTION 5: ADDITIONAL INFORMATION ═══']);

            fputcsv($file, ['--- (A) Patents ---']);
            fputcsv($file, ['#', 'Inventor(s)', 'Title', 'Country', 'Patent No.', 'Date Filed', 'Date Published', 'Status']);
            foreach ($info['patents'] ?? [] as $i => $pat) {
                fputcsv($file, [
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
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (B) Books ---']);
            fputcsv($file, ['#', 'Author(s)', 'Title', 'Year', 'ISBN']);
            foreach ($info['books'] ?? [] as $i => $bk) {
                fputcsv($file, [$i + 1, $bk['authors'] ?? 'N/A', $bk['title'] ?? 'N/A', $bk['year'] ?? 'N/A', $bk['isbn'] ?? 'N/A']);
            }
            if (empty($info['books'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (C) Book Chapters ---']);
            fputcsv($file, ['#', 'Author(s)', 'Title', 'Year', 'ISBN']);
            foreach ($info['book_chapters'] ?? [] as $i => $bc) {
                fputcsv($file, [$i + 1, $bc['authors'] ?? 'N/A', $bc['title'] ?? 'N/A', $bc['year'] ?? 'N/A', $bc['isbn'] ?? 'N/A']);
            }
            if (empty($info['book_chapters'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (D) Google Scholar ---']);
            fputcsv($file, ['Google Scholar URL', $info['google_scholar'] ?? 'N/A']);
            $blank();

            fputcsv($file, ['--- (E) Membership of Professional Societies ---']);
            fputcsv($file, ['#', 'Name of Society', 'Membership Status']);
            foreach ($info['societies'] ?? [] as $i => $soc) {
                fputcsv($file, [$i + 1, $soc['name'] ?? 'N/A', $soc['status'] ?? 'N/A']);
            }
            if (empty($info['societies'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (F) Professional Training ---']);
            fputcsv($file, ['#', 'Type of Training', 'Organisation', 'Year', 'Duration']);
            foreach ($info['training'] ?? [] as $i => $tr) {
                fputcsv($file, [$i + 1, $tr['type'] ?? 'N/A', $tr['organization'] ?? 'N/A', $tr['year'] ?? 'N/A', $tr['duration'] ?? 'N/A']);
            }
            if (empty($info['training'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 6 — AWARDS, SUPERVISION & PROJECTS
            // ════════════════════════════════════════════════════
            $ap = $data['awards_projects'] ?? [];

            fputcsv($file, ['═══ SECTION 6: AWARDS, SUPERVISION & PROJECTS ═══']);

            fputcsv($file, ['--- (A) Awards and Recognitions ---']);
            fputcsv($file, ['#', 'Name of Award', 'Awarded By', 'Year']);
            foreach ($ap['awards'] ?? [] as $i => $aw) {
                fputcsv($file, [$i + 1, $aw['name'] ?? 'N/A', $aw['awarded_by'] ?? 'N/A', $aw['year'] ?? 'N/A']);
            }
            if (empty($ap['awards'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (B-i) PhD Thesis Supervision ---']);
            fputcsv($file, ['#', 'Scholar Name', 'Thesis Title', 'Role', 'Status', 'Year']);
            foreach ($ap['phd_supervision'] ?? [] as $i => $sup) {
                fputcsv($file, [$i + 1, $sup['student_name'] ?? 'N/A', $sup['title'] ?? 'N/A', $sup['role'] ?? 'N/A', $sup['status'] ?? 'N/A', $sup['year'] ?? 'N/A']);
            }
            if (empty($ap['phd_supervision'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (B-ii) M.Tech/Masters Supervision ---']);
            fputcsv($file, ['#', 'Student Name', 'Thesis/Project Title', 'Role', 'Status', 'Year']);
            foreach ($ap['pg_supervision'] ?? [] as $i => $sup) {
                fputcsv($file, [$i + 1, $sup['student_name'] ?? 'N/A', $sup['title'] ?? 'N/A', $sup['role'] ?? 'N/A', $sup['status'] ?? 'N/A', $sup['year'] ?? 'N/A']);
            }
            if (empty($ap['pg_supervision'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (B-iii) B.Tech/Bachelors Supervision ---']);
            fputcsv($file, ['#', 'Student Name', 'Project Title', 'Role', 'Status', 'Year']);
            foreach ($ap['ug_supervision'] ?? [] as $i => $sup) {
                fputcsv($file, [$i + 1, $sup['student_name'] ?? 'N/A', $sup['title'] ?? 'N/A', $sup['role'] ?? 'N/A', $sup['status'] ?? 'N/A', $sup['year'] ?? 'N/A']);
            }
            if (empty($ap['ug_supervision'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (C-i) Sponsored Projects ---']);
            fputcsv($file, ['#', 'Sponsoring Agency', 'Title', 'Amount', 'Period', 'Role', 'Status']);
            foreach ($ap['sponsored_projects'] ?? [] as $i => $proj) {
                fputcsv($file, [$i + 1, $proj['agency'] ?? 'N/A', $proj['title'] ?? 'N/A', $proj['amount'] ?? 'N/A', $proj['period'] ?? 'N/A', $proj['role'] ?? 'N/A', $proj['status'] ?? 'N/A']);
            }
            if (empty($ap['sponsored_projects'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (C-ii) Consultancy Projects ---']);
            fputcsv($file, ['#', 'Organisation / Agency', 'Title', 'Amount', 'Period', 'Role', 'Status']);
            foreach ($ap['consultancy_projects'] ?? [] as $i => $proj) {
                fputcsv($file, [$i + 1, $proj['agency'] ?? 'N/A', $proj['title'] ?? 'N/A', $proj['amount'] ?? 'N/A', $proj['period'] ?? 'N/A', $proj['role'] ?? 'N/A', $proj['status'] ?? 'N/A']);
            }
            if (empty($ap['consultancy_projects'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 7 — STATEMENTS
            // ════════════════════════════════════════════════════
            $stmts = $data['statements'] ?? [];

            fputcsv($file, ['═══ SECTION 7: CONTRIBUTIONS & FUTURE PLANS ═══']);
            fputcsv($file, ['(A) Research Contribution & Future Plans']);
            fputcsv($file, [$stmts['research_plan'] ?? 'N/A']);
            $blank();
            fputcsv($file, ['(B) Teaching Contribution & Future Plans']);
            fputcsv($file, [$stmts['teaching_plan'] ?? 'N/A']);
            $blank();
            fputcsv($file, ['(C) Professional Service (Reviewer/Editor etc.)']);
            fputcsv($file, [$stmts['professional_service'] ?? 'N/A']);
            $blank();
            fputcsv($file, ['(D) Any Other Relevant Information']);
            fputcsv($file, [$stmts['other_info'] ?? 'N/A']);
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 8 — DETAILED PUBLICATIONS
            // ════════════════════════════════════════════════════
            $dpubs = $data['detailed_pubs'] ?? [];

            fputcsv($file, ['═══ SECTION 8: DETAILED PUBLICATIONS ═══']);

            fputcsv($file, ['--- (A) Journal Publications ---']);
            fputcsv($file, ['#', 'Author(s)', 'Paper Title', 'Journal Name', 'Year', 'Volume', 'Issue', 'Pages', 'Impact Factor', 'DOI', 'Status']);
            foreach ($dpubs['journals'] ?? [] as $i => $pub) {
                fputcsv($file, [
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
                fputcsv($file, ['N/A']);
            }
            $blank();

            fputcsv($file, ['--- (B) Conference Publications ---']);
            fputcsv($file, ['#', 'Author(s)', 'Paper Title', 'Conference Name', 'Year', 'Pages', 'DOI']);
            foreach ($dpubs['conferences'] ?? [] as $i => $pub) {
                fputcsv($file, [
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
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 9 — REFEREES
            // ════════════════════════════════════════════════════
            fputcsv($file, ['═══ SECTION 9: REFEREES ═══']);
            fputcsv($file, ['#', 'Name', 'Position', 'Association', 'Institute / Organisation', 'E-mail', 'Contact No.']);
            foreach ($data['referees_section']['referees'] ?? [] as $i => $ref) {
                fputcsv($file, [
                    $i + 1,
                    $ref['name'] ?? 'N/A',
                    $ref['position'] ?? 'N/A',
                    $ref['association'] ?? 'N/A',
                    $ref['institute'] ?? 'N/A',
                    $ref['email'] ?? 'N/A',
                    $ref['contact'] ?? $ref['phone'] ?? 'N/A',
                ]);
            }
            if (empty($data['referees_section']['referees'])) {
                fputcsv($file, ['N/A']);
            }
            $blank();

            // ════════════════════════════════════════════════════
            // SECTION 10 — DECLARATION
            // ════════════════════════════════════════════════════
            $declared = ! empty($data['form_data']['declaration']) || ! empty($data['declaration']);
            fputcsv($file, ['═══ SECTION 10: DECLARATION ═══']);
            fputcsv($file, ['Declaration Agreed', $declared ? 'Yes' : 'No / Not Yet']);

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
