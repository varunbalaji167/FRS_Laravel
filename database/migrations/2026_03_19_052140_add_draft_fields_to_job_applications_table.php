<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->json('form_data')->nullable()->after('grade');
            $table->text('sop')->nullable()->change();
            $table->text('research_interest')->nullable()->change();
        });
    }

        public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('form_data');
            $table->text('sop')->nullable(false)->change();
            $table->text('research_interest')->nullable(false)->change();
        });
    }
};