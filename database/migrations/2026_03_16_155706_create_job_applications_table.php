<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // NOTE: job_openings was never created by a migration; this column is
            // dropped a few migrations later (2026_03_19_050711) in favour of
            // advertisement_id, so it's left unconstrained here for a fresh install.
            $table->unsignedBigInteger('job_opening_id');
            $table->string('status')->default('pending'); // pending, shortlisted, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
