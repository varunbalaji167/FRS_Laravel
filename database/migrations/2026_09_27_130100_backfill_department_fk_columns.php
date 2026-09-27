<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Data-only backfill for the department_id columns. Runs regardless of
     * FEATURE_DEPARTMENT_FK so the flag can be flipped without a migration.
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
            // `departments` is a JSON object keyed by department name, not a
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
