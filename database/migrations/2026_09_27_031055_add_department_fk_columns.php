<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Prepares the department-FK cutover: adds the new nullable FK columns
     * and the advertisement/department pivot alongside the existing string
     * `department`/`departments` columns. Purely additive — nothing here
     * backfills data, enforces NOT NULL, or drops the string columns; that
     * cutover (backfill + drop-behind-a-flag) is Phase 8's job, run against
     * production once every reader/writer has moved onto the FK. See
     * PLAN.md Phase 8.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('department')
                ->constrained('departments')->nullOnDelete();
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('department')
                ->constrained('departments')->nullOnDelete();
        });

        Schema::create('advertisement_department', function (Blueprint $table) {
            $table->foreignId('advertisement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->primary(['advertisement_id', 'department_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisement_department');

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
        });
    }
};
