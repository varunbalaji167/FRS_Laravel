<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('job_applications', 'form_data')) {
                $table->json('form_data')->nullable()->after('grade');
            }

            if (Schema::hasColumn('job_applications', 'sop')) {
                $table->text('sop')->nullable()->change();
            }

            if (Schema::hasColumn('job_applications', 'research_interest')) {
                $table->text('research_interest')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (Schema::hasColumn('job_applications', 'form_data')) {
                $table->dropColumn('form_data');
            }

            if (Schema::hasColumn('job_applications', 'sop')) {
                $table->text('sop')->nullable(false)->change();
            }

            if (Schema::hasColumn('job_applications', 'research_interest')) {
                $table->text('research_interest')->nullable(false)->change();
            }
        });
    }
};
