<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Audit trail for admin/HOD status transitions — written from
     * Admin\ApplicationController@updateStatus. See docs/architecture.md.
     */
    public function up(): void
    {
        Schema::create('application_status_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('job_applications')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            $table->string('from')->nullable();
            $table->string('to');
            $table->timestamp('at');
            $table->text('note')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_events');
    }
};
