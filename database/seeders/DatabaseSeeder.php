<?php

namespace Database\Seeders;

use App\Models\ApplicantProfile;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(DepartmentSeeder::class);

        // 1. Faculty Affairs Admin
        User::factory()->create([
            'name' => 'Faculty Affairs Admin',
            'email' => 'admin@iiti.ac.in',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Department HOD
        User::factory()->create([
            'name' => 'CS Dept HOD',
            'email' => 'hod.cse@iiti.ac.in',
            'password' => Hash::make('password'),
            'department_id' => Department::firstWhere('name', 'Computer Science and Engineering')->id,
            'role' => 'hod',
        ]);

        // 3. Applicant
        $applicant = User::factory()->create([
            'name' => 'John ',
            'email' => 'applicant@test.com',
            'password' => Hash::make('password'),
            'role' => 'applicant',
        ]);

        // 4. Create the 1-to-1 Master Profile for the Applicant
        ApplicantProfile::create([
            'user_id' => $applicant->id,

            // Core Identity
            'fathers_name' => 'Robert ',
            'dob' => '1990-05-15',
            'gender' => 'Male',
            'marital_status' => 'Unmarried',
            'category' => 'UR',
            'nationality' => 'Indian',
            'id_proof_type' => 'Aadhar',
            'id_proof_number' => '1234 5678 9012',

            // Contact
            'phone' => '9876543210',
            'alt_phone' => '9123456789',
            'alt_email' => 'john.alt@example.com',

            // Correspondence Address
            'corr_address' => '123 Tech Park, Phase 1, Electronic City',
            'corr_city' => 'Bengaluru',
            'corr_state' => 'Karnataka',
            'corr_pincode' => '560100',
            'corr_country' => 'India',

            // Permanent Address
            'perm_address' => '456 Heritage Street, Old Town',
            'perm_city' => 'Mumbai',
            'perm_state' => 'Maharashtra',
            'perm_pincode' => '400001',
            'perm_country' => 'India',

            // Professional Details
            'designation' => 'Postdoctoral Researcher',
            'affiliation' => 'Indian Institute of Science (IISc)',
            'google_scholar_url' => 'https://scholar.google.com/citations?user=sample123',
            'linkedin_url' => 'https://linkedin.com/in/johnapplicant',
        ]);

        // Demo applications (draft/submitted/shortlisted/rejected across
        // departments) for local manual testing only — never in production.
        if (app()->environment('local')) {
            $this->call(DemoApplicationsSeeder::class);
        }
    }
}
