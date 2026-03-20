<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('users', function (Blueprint $table) {
			$table->string('photo_path')->nullable()->after('email');

			$table->string('phone', 25)->nullable()->after('photo_path');
			$table->string('designation', 150)->nullable()->after('phone');
			$table->string('affiliation', 200)->nullable()->after('designation');
			$table->string('location', 150)->nullable()->after('affiliation');

			$table->date('date_of_birth')->nullable()->after('location');
			$table->string('gender', 30)->nullable()->after('date_of_birth');
			$table->string('category', 30)->nullable()->after('gender');
			$table->string('caste', 80)->nullable()->after('category');

			$table->string('address_line_1')->nullable()->after('caste');
			$table->string('address_line_2')->nullable()->after('address_line_1');
			$table->string('city', 100)->nullable()->after('address_line_2');
			$table->string('state', 100)->nullable()->after('city');
			$table->string('postal_code', 20)->nullable()->after('state');
			$table->string('country', 100)->nullable()->after('postal_code');

			$table->string('highest_qualification', 150)->nullable()->after('country');
			$table->string('education_institution', 200)->nullable()->after('highest_qualification');
			$table->string('education_year', 20)->nullable()->after('education_institution');
			$table->text('education_details')->nullable()->after('education_year');
			$table->text('thesis_details')->nullable()->after('education_details');
			$table->text('supervisors')->nullable()->after('thesis_details');

			$table->text('research_areas')->nullable()->after('supervisors');
			$table->text('research_statement')->nullable()->after('research_areas');
			$table->text('publications')->nullable()->after('research_statement');
			$table->text('achievements')->nullable()->after('publications');
			$table->text('teaching_experience')->nullable()->after('achievements');
			$table->text('teaching_philosophy')->nullable()->after('teaching_experience');
			$table->text('projects_research_work')->nullable()->after('teaching_philosophy');
			$table->text('professional_experience')->nullable()->after('projects_research_work');
			$table->text('skills')->nullable()->after('professional_experience');
			$table->text('curriculum_contributions')->nullable()->after('skills');
			$table->text('certifications')->nullable()->after('curriculum_contributions');
			$table->text('academic_service')->nullable()->after('certifications');

			$table->string('google_scholar_url')->nullable()->after('academic_service');
			$table->string('orcid_url')->nullable()->after('google_scholar_url');
			$table->string('linkedin_url')->nullable()->after('orcid_url');
			$table->string('github_url')->nullable()->after('linkedin_url');
			$table->string('personal_website_url')->nullable()->after('github_url');

			$table->text('statement')->nullable()->after('personal_website_url');

			$table->string('cv_path')->nullable()->after('statement');
			$table->string('research_statement_document_path')->nullable()->after('cv_path');
			$table->string('teaching_statement_document_path')->nullable()->after('research_statement_document_path');
		});
	}

	public function down(): void
	{
		Schema::table('users', function (Blueprint $table) {
			$table->dropColumn([
				'photo_path',
				'phone',
				'designation',
				'affiliation',
				'location',
				'date_of_birth',
				'gender',
				'category',
				'caste',
				'address_line_1',
				'address_line_2',
				'city',
				'state',
				'postal_code',
				'country',
				'highest_qualification',
				'education_institution',
				'education_year',
				'education_details',
				'thesis_details',
				'supervisors',
				'research_areas',
				'research_statement',
				'publications',
				'achievements',
				'teaching_experience',
				'teaching_philosophy',
				'projects_research_work',
				'professional_experience',
				'skills',
				'curriculum_contributions',
				'certifications',
				'academic_service',
				'google_scholar_url',
				'orcid_url',
				'linkedin_url',
				'github_url',
				'personal_website_url',
				'statement',
				'cv_path',
				'research_statement_document_path',
				'teaching_statement_document_path',
			]);
		});
	}
};
