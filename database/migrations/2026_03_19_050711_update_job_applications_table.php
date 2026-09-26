<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Both the FK and the unique index below only exist on databases that
        // migrated before this file was corrected; fresh installs have neither.
        try {
            Schema::table('job_applications', function (Blueprint $table) {
                $table->dropForeign(['job_opening_id']);
            });
        } catch (\Exception $e) { /* fresh installs never had this FK */ }

        try {
            Schema::table('job_applications', function (Blueprint $table) {
                $table->dropUnique(['user_id', 'job_opening_id']);
            });
        } catch (\Exception $e) { /* fresh installs never had this index */ }

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('job_opening_id');
            $table->unsignedBigInteger('advertisement_id')->after('user_id');
            $table->string('department')->after('advertisement_id');
            $table->string('grade')->after('department');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('advertisement_id');
            $table->dropColumn('department');
            $table->dropColumn('grade');
            $table->foreignId('job_opening_id')->constrained('job_openings');
        });
    }
};
