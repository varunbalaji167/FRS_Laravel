<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('applicant_profiles')->where('gender', 'Other')->update(['gender' => 'Prefer not to say']);
        DB::table('applicant_profiles')->where('category', 'General')->update(['category' => 'UR']);

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->renameColumn('father_name', 'fathers_name');
            $table->renameColumn('date_of_birth', 'dob');
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('id_proof_type')->nullable();
            $table->string('id_proof_number')->nullable();
        });

        DB::statement("UPDATE applicant_profiles SET id_proof_type = TRIM(SUBSTRING_INDEX(id_proof, ':', 1)), id_proof_number = TRIM(SUBSTRING_INDEX(id_proof, ':', -1)) WHERE id_proof IS NOT NULL AND id_proof LIKE '%:%'");

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn('id_proof');
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
        });

        $profiles = DB::table('applicant_profiles')
            ->join('users', 'users.id', '=', 'applicant_profiles.user_id')
            ->whereNull('applicant_profiles.first_name')
            ->whereNull('applicant_profiles.last_name')
            ->select('applicant_profiles.id', 'users.name')
            ->get();

        foreach ($profiles as $profile) {
            $parts = preg_split('/\s+/', trim((string) $profile->name)) ?: [];
            $parts = array_values(array_filter($parts, fn ($part) => $part !== ''));

            if (empty($parts)) {
                continue;
            }

            $firstName = $parts[0];
            $lastName = count($parts) > 1 ? $parts[count($parts) - 1] : null;
            $middleName = count($parts) > 2 ? implode(' ', array_slice($parts, 1, -1)) : null;

            DB::table('applicant_profiles')->where('id', $profile->id)->update([
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'middle_name', 'last_name']);
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('id_proof')->nullable();
        });

        DB::statement("UPDATE applicant_profiles SET id_proof = CASE WHEN id_proof_type IS NOT NULL OR id_proof_number IS NOT NULL THEN CONCAT(COALESCE(id_proof_type, ''), ': ', COALESCE(id_proof_number, '')) ELSE NULL END");

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn(['id_proof_type', 'id_proof_number']);
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->renameColumn('fathers_name', 'father_name');
            $table->renameColumn('dob', 'date_of_birth');
        });
    }
};
