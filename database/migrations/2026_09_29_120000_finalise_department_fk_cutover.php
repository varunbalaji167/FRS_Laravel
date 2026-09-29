<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Turns department_id from an additive FK into the primary shape: drops
     * the legacy string columns and their indexes.
     *
     * department_id stays nullable on both tables: applicants and admins
     * (RegisteredUserController, SocialAuthController) never get a
     * department, only HODs do; and a job_applications draft can be
     * autosaved before the applicant has picked a department (see
     * SaveDraftRequest's nullable 'department' rule and
     * DraftValidationTest::test_draft_save_with_no_required_fields_still_succeeds).
     */
    public function up(): void
    {
        $this->backfillDepartmentIds();

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropIndex(['department', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['department']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->index(['department_id', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('department');
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('department');
        });
    }

    /**
     * Break-glass only: re-adds nullable string columns and backfills from
     * department_id. Legacy string values that predate the cutover are not
     * recoverable.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('department')->nullable()->after('role');
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('department')->nullable()->after('advertisement_id');
        });

        DB::table('users')->update([
            'department' => DB::raw('(select name from departments where departments.id = users.department_id)'),
        ]);

        DB::table('job_applications')->update([
            'department' => DB::raw('(select name from departments where departments.id = job_applications.department_id)'),
        ]);

        // The FK constraint on department_id relies on an index over that
        // column; the composite [department_id, status] index (added by
        // this migration's up()) is the only one covering it, so it must be
        // dropped and recreated around the index swap.
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['department_id', 'status']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->index('department');
            $table->index(['department', 'status']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('department');
        });
    }

    /**
     * Idempotent re-run of the 2026_09_27_130100 backfill, so draft rows
     * written since then via DraftService (which never populated the FK)
     * are caught.
     */
    private function backfillDepartmentIds(): void
    {
        $departments = DB::table('departments')->pluck('id', 'name');

        foreach ($departments as $name => $id) {
            DB::table('users')->where('department', $name)->whereNull('department_id')->update(['department_id' => $id]);
            DB::table('job_applications')->where('department', $name)->whereNull('department_id')->update(['department_id' => $id]);
        }
    }
};
