<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `is_active` is no longer an independent, admin-toggled flag — it's now
 * computed purely from `deadline` (see Advertisement::isActive()). Dropping
 * the column removes the possibility of the two drifting apart.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropColumn('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->index('is_active');
        });
    }
};
