<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $indexExists = DB::select("SHOW INDEX FROM job_applications WHERE Key_name = 'job_applications_user_id_job_opening_id_unique'");

        if (! empty($indexExists)) {
            DB::statement('DROP INDEX job_applications_user_id_job_opening_id_unique ON job_applications');
        }
    }

    public function down(): void {}
};
