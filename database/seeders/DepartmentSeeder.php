<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $depts = [
            'Astronomy, Astrophysics and Space Engineering', 'Chemical Engineering', 'Chemistry',
            'Civil Engineering', 'Computer Science and Engineering', 'Electrical Engineering',
            'Humanities and Social Sciences', 'Mathematics', 'Mechanical Engineering',
            'Mehta Family School of Biosciences and Biomedical Engineering',
            'Mehta Family School of Sustainability', 'Metallurgical Engineering and Materials Science',
            'Physics', 'School of Innovation',
        ];

        foreach ($depts as $name) {
            Department::firstOrCreate(['name' => $name]);
        }
    }
}
