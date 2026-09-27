<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dedup log for RefereeNotificationDispatcher — the unique pair is what
     * makes a re-run of the same submission idempotent even if SubmissionService
     * is ever invoked twice for the same application (see docs/architecture.md).
     */
    public function up(): void
    {
        Schema::create('referee_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->cascadeOnDelete();
            $table->string('referee_email');
            $table->timestamp('sent_at');

            $table->unique(['job_application_id', 'referee_email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referee_notifications');
    }
};
