<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores the dial prefix separately from the number, matching the
     * split-field pattern in Step2Personal.
     */
    public function up(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            // Insert phone_code right AFTER the existing `phone` column
            $table->string('phone_code', 6)->default('+91')->nullable()->after('phone');

            // Insert alt_phone_code right AFTER the existing `alt_phone` column
            $table->string('alt_phone_code', 6)->default('+91')->nullable()->after('alt_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn(['phone_code', 'alt_phone_code']);
        });
    }
};
