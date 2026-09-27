<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The composite indexes the dashboard and HOD-scoped queries actually
     * filter by, plus the columns login and the ad lists touch.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('department');
            $table->index('google_id');
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('deadline');
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->index(['department', 'status']);
            $table->index(['advertisement_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['department']);
            $table->dropIndex(['google_id']);
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['deadline']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['department', 'status']);
            $table->dropIndex(['advertisement_id', 'status']);
            $table->dropIndex(['created_at']);
        });
    }
};
