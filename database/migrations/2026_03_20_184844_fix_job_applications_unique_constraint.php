<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    // STEP 1: CLEANUP (Independent Block)
    // We do this in its own block so if it fails, it doesn't stop Step 2.
    try {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropForeign('job_applications_job_opening_id_foreign');
        });
    } catch (\Exception $e) { /* Already gone */ }

    try {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropUnique('job_applications_user_id_job_opening_id_unique');
        });
    } catch (\Exception $e) { /* Already gone */ }


    // STEP 2: CREATION (The Important Part)
    // This block will now run regardless of whether the cleanup worked or failed.
    Schema::table('job_applications', function (Blueprint $table) {
        // Ensure the column exists before indexing it (just in case)
        if (Schema::hasColumn('job_applications', 'advertisement_id')) {
            $table->unique(['user_id', 'advertisement_id'], 'job_apps_user_adv_unique');

            $table->foreign('advertisement_id')
                ->references('id')
                ->on('advertisements')
                ->onDelete('cascade');
        }
    });
}
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropUnique('job_apps_user_adv_unique');
        });
    }
};
