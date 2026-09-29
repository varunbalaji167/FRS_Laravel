<?php

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\ApplicantProfile;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Local-only demo data: a handful of applicants in different departments,
 * grades, and statuses, so the three roles (applicant/HOD/admin) have
 * something realistic to click through. Never runs outside `local` — see
 * the guard in DatabaseSeeder.
 */
class DemoApplicationsSeeder extends Seeder
{
    public function run(): void
    {
        $cse = Department::firstOrCreate(['name' => 'Computer Science and Engineering']);
        $mech = Department::firstOrCreate(['name' => 'Mechanical Engineering']);
        $physics = Department::firstOrCreate(['name' => 'Physics']);

        $cseAd = Advertisement::factory()->create([
            'reference_number' => 'DEMO-CSE-01',
            'title' => 'Faculty Positions in Computer Science and Engineering',
            'departments' => [
                'Computer Science and Engineering' => [
                    'Assistant Professor Grade II', 'Assistant Professor Grade I',
                    'Associate Professor', 'Professor',
                ],
            ],
        ]);

        $mechAd = Advertisement::factory()->create([
            'reference_number' => 'DEMO-MECH-01',
            'title' => 'Faculty Positions in Mechanical Engineering',
            'departments' => [
                'Mechanical Engineering' => ['Assistant Professor Grade II', 'Associate Professor'],
            ],
        ]);

        $physicsAd = Advertisement::factory()->create([
            'reference_number' => 'DEMO-PHY-01',
            'title' => 'Faculty Positions in Physics',
            'departments' => [
                'Physics' => ['Assistant Professor Grade I', 'Associate Professor'],
            ],
        ]);

        // [email, name, advertisement, department, grade, status]
        $demoApplications = [
            ['priya.draft@test.com', 'Priya Sharma', $cseAd, $cse, 'Assistant Professor Grade II', 'draft'],
            ['arjun.submitted@test.com', 'Arjun Mehta', $cseAd, $cse, 'Assistant Professor Grade II', 'submitted'],
            ['divya.shortlisted@test.com', 'Divya Nair', $cseAd, $cse, 'Associate Professor', 'shortlisted'],
            ['karan.rejected@test.com', 'Karan Singh', $cseAd, $cse, 'Professor', 'rejected'],
            ['fatima.mech@test.com', 'Fatima Khan', $mechAd, $mech, 'Assistant Professor Grade II', 'submitted'],
            ['rohan.physics@test.com', 'Rohan Verma', $physicsAd, $physics, 'Associate Professor', 'submitted'],
        ];

        foreach ($demoApplications as [$email, $name, $advertisement, $department, $grade, $status]) {
            $applicant = User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'applicant',
            ]);

            [$firstName, $lastName] = array_pad(explode(' ', $name, 2), 2, '');

            ApplicantProfile::create([
                'user_id' => $applicant->id,
                'father_name' => 'Father of '.$firstName,
                'date_of_birth' => '1988-04-12',
                'gender' => 'Male',
                'marital_status' => 'Married',
                'category' => 'General',
                'nationality' => 'Indian',
                'id_proof' => 'AADHAR: 1234 5678 9999',
                'phone' => '9800000000',
                'corr_address' => '1 Demo Street',
                'corr_city' => 'Indore',
                'corr_state' => 'Madhya Pradesh',
                'corr_pincode' => '452020',
                'corr_country' => 'India',
                'perm_address' => '1 Demo Street',
                'perm_city' => 'Indore',
                'perm_state' => 'Madhya Pradesh',
                'perm_pincode' => '452020',
                'perm_country' => 'India',
                'designation' => 'Postdoctoral Researcher',
                'affiliation' => 'Demo Institute',
            ]);

            $formData = [
                'personal_details' => [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'dob' => '1988-04-12',
                    'gender' => 'Male',
                    'category' => 'General',
                    'nationality' => 'Indian',
                    'email' => $email,
                    'phone' => '9800000000',
                ],
                'education' => [
                    'phd' => [
                        'university' => 'IIT Indore',
                        'department' => $department->name,
                        'date_joining' => '2015-07-01',
                    ],
                ],
                'employment' => [
                    'present' => [
                        'position' => 'Lecturer',
                        'organization' => 'Demo Institute',
                        'date_joining' => '2020-01-01',
                    ],
                    'has_three_years_exp' => 'Yes',
                ],
                'research' => [
                    'specialization' => [
                        'area_of_specialization' => 'Demo Specialization',
                        'current_area_of_research' => 'Demo Research Area',
                    ],
                ],
                'statements' => [
                    'research_plan' => 'Demo research plan for '.$name.'.',
                    'teaching_plan' => 'Demo teaching plan for '.$name.'.',
                ],
                'referees_section' => [
                    'referees' => [
                        ['name' => 'Referee One', 'position' => 'Professor', 'association' => 'PhD Advisor', 'institute' => 'IIT Indore', 'email' => 'r1@example.com', 'contact_number' => '9000000001'],
                        ['name' => 'Referee Two', 'position' => 'Professor', 'association' => 'Colleague', 'institute' => 'IIT Bombay', 'email' => 'r2@example.com', 'contact_number' => '9000000002'],
                        ['name' => 'Referee Three', 'position' => 'Professor', 'association' => 'Manager', 'institute' => 'IIT Delhi', 'email' => 'r3@example.com', 'contact_number' => '9000000003'],
                    ],
                ],
                'declaration' => true,
            ];

            if ($status !== 'draft') {
                $formData['uploaded_documents'] = $this->fakeDocuments($applicant->id, $advertisement->id);
                $formData['personal_details']['profile_image'] = $this->fakePhoto($applicant->id, $advertisement->id);
            }

            JobApplication::create([
                'user_id' => $applicant->id,
                'advertisement_id' => $advertisement->id,
                'department_id' => $department->id,
                'grade' => $grade,
                'form_data' => $formData,
                'status' => $status,
            ]);
        }
    }

    /**
     * @return array<string, string>
     */
    private function fakeDocuments(int $userId, int $advertisementId): array
    {
        $base = "applications/{$userId}/{$advertisementId}";
        $documents = [
            'phd_cert' => "{$base}/phd_cert.pdf",
            'ssc_cert' => "{$base}/ssc_cert.pdf",
            'signature' => "{$base}/signature.png",
        ];

        foreach ($documents as $key => $path) {
            Storage::disk('local')->put(
                $path,
                $key === 'signature' ? $this->onePixelPng() : $this->minimalPdf($key)
            );
        }

        return $documents;
    }

    private function fakePhoto(int $userId, int $advertisementId): string
    {
        $path = "applications/{$userId}/{$advertisementId}/photos/profile.png";

        Storage::disk('local')->put($path, $this->onePixelPng());

        return $path;
    }

    /**
     * A real (decodable) 1x1 transparent PNG, so <img> tags in the dossier
     * actually render instead of showing a broken-image icon.
     */
    private function onePixelPng(): string
    {
        return base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        );
    }

    /**
     * A minimal but real PDF, so opening the document link in a new tab
     * shows an actual page instead of a "failed to load" error.
     */
    private function minimalPdf(string $label): string
    {
        $text = 'Demo document: '.$label;
        $length = strlen($text) + 20;

        return <<<PDF
        %PDF-1.4
        1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
        2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
        3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 150]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj
        4 0 obj<</Length {$length}>>stream
        BT /F1 14 Tf 20 100 Td ({$text}) Tj ET
        endstream
        endobj
        5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
        trailer<</Size 6/Root 1 0 R>>
        %%EOF
        PDF;
    }
}
