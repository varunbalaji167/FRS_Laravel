<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // Change status from plain string to controlled values
            $table->enum('status', ['draft', 'submitted', 'shortlisted', 'rejected'])
                  ->default('draft')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }
};