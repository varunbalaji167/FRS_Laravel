<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
    {
        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // 1-to-1 Link
            
            // Core Identity
            $table->string('photo_path')->nullable();
            $table->string('father_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('category')->nullable();
            $table->string('nationality')->default('Indian');
            $table->string('id_proof')->nullable();

            // Contact
            $table->string('phone')->nullable();
            $table->string('alt_phone')->nullable();
            $table->string('alt_email')->nullable();

            // Correspondence Address
            $table->text('corr_address')->nullable();
            $table->string('corr_city')->nullable();
            $table->string('corr_state')->nullable();
            $table->string('corr_pincode')->nullable();
            $table->string('corr_country')->default('India');

            // Permanent Address
            $table->text('perm_address')->nullable();
            $table->string('perm_city')->nullable();
            $table->string('perm_state')->nullable();
            $table->string('perm_pincode')->nullable();
            $table->string('perm_country')->default('India');

            // Professional Details
            $table->string('designation')->nullable();
            $table->string('affiliation')->nullable();
            $table->string('google_scholar_url')->nullable();
            $table->string('orcid_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('cv_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_profiles');
    }
};
