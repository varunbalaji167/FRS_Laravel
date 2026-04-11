<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // These are the columns your AdminController filters by most often
            $table->index('department');
            $table->index('status');
            $table->index('advertisement_id');
            $table->index('user_id');

            // Optional: A compound index if you frequently search for BOTH together
            // $table->index(['advertisement_id', 'department']);
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropIndex(['status']);
            $table->dropIndex(['advertisement_id']);
            $table->dropIndex(['user_id']);
        });
    }
};