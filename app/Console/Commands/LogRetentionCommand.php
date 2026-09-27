<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Nightly sweep of failed_jobs rows and rotated laravel-*.log files past
 * the retention window. Scheduled from routes/console.php.
 */
class LogRetentionCommand extends Command
{
    protected $signature = 'logs:retention';

    protected $description = 'Prune old failed jobs and rotate laravel-*.log files beyond the configured retention window.';

    public function handle(): int
    {
        $days = (int) config('logging.channels.daily.days', 14);
        $cutoff = now()->subDays($days);

        $prunedFailedJobs = DB::table('failed_jobs')
            ->where('failed_at', '<', $cutoff)
            ->delete();

        $prunedLogFiles = 0;

        foreach (glob(storage_path('logs/laravel-*.log')) ?: [] as $path) {
            if (filemtime($path) < $cutoff->getTimestamp()) {
                unlink($path);
                $prunedLogFiles++;
            }
        }

        Log::info('LogRetentionCommand ran', [
            'pruned_failed_jobs' => $prunedFailedJobs,
            'pruned_log_files' => $prunedLogFiles,
            'retention_days' => $days,
        ]);

        $this->info("Pruned {$prunedFailedJobs} failed jobs and {$prunedLogFiles} log files older than {$days} days.");

        return self::SUCCESS;
    }
}
