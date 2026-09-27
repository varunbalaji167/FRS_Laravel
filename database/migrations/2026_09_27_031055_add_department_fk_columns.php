<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Purely additive: the nullable FK columns and the pivot, alongside the
     * existing string columns. Backfill and cutover happen separately.
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
