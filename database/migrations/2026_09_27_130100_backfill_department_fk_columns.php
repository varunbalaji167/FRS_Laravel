<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Data-only backfill for the department_id FK columns added in
     * 2026_09_27_031055_add_department_fk_columns. Runs regardless of the
     * FEATURE_DEPARTMENT_FK flag so the FK columns stay in sync and the
     * flag can be flipped without a follow-up migration. See PLAN.md
     * Phase 8.
     */
    public function up(): void
    {
        $departments = DB::table('departments')->pluck('id', 'name');

        foreach ($departments as $name => $id) {
            DB::table('users')->where('department', $name)->update(['department_id' => $id]);
            DB::table('job_applications')->where('department', $name)->update(['department_id' => $id]);
        }

        $advertisements = DB::table('advertisements')->select('id', 'departments')->get();

        foreach ($advertisements as $advertisement) {
            // `departments` is a JSON object keyed by department name (each
            // value is the list of grades open for that department), not a
            // flat array of names.
            $names = array_keys(json_decode($advertisement->departments ?? '{}', true) ?: []);

            foreach ($names as $name) {
                if (! isset($departments[$name])) {
                    continue;
                }

                DB::table('advertisement_department')->insertOrIgnore([
                    'advertisement_id' => $advertisement->id,
                    'department_id' => $departments[$name],
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('users')->update(['department_id' => null]);
        DB::table('job_applications')->update(['department_id' => null]);
        DB::table('advertisement_department')->truncate();
    }
};
