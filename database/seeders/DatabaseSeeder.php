<?php

namespace Database\Seeders;

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
        // 1. Faculty Affairs Admin
        User::factory()->create([
            'name' => 'Faculty Affairs Admin',
            'email' => 'admin@iiti.ac.in',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // 2. Department HOD
        User::factory()->create([
            'name' => 'CS Dept HOD',
            'email' => 'hod@iiti.ac.in',
            'password' => Hash::make('hod123'),
            'role' => 'hod',
        ]);

        // 3. Applicant
        User::factory()->create([
            'name' => 'John Applicant',
            'email' => 'applicant@test.com',
            'password' => Hash::make('password'),
            'role' => 'applicant',
        ]);
    }
}