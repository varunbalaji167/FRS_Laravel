<?php

namespace App\Console\Commands;

use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * One-shot production bootstrap: wipes every row in every table (schema
 * stays intact — migrations are not re-run) and seeds only the two things a
 * brand-new deployment can't function without: the department list and the
 * first admin account. Everything else (advertisements, HODs, applicants,
 * applications) is created afterwards through the app itself.
 *
 * Destructive and irreversible. Never runs without confirmation.
 */
class InitProductionDatabase extends Command
{
    use ConfirmableTrait;

    protected $signature = 'app:init-production
        {--admin-email= : Overrides config(production_seed.admin_email) / PROD_ADMIN_EMAIL}
        {--admin-password= : Overrides config(production_seed.admin_password) / PROD_ADMIN_PASSWORD. Omit to auto-generate one.}
        {--force : Skip the confirmation prompt}';

    protected $description = 'DESTRUCTIVE: delete all existing data and seed only the department list and the first admin account.';

    public function handle(): int
    {
        if (! $this->confirmToProceed(
            'This will PERMANENTLY DELETE every user, application, department, and every other row '.
            'in this database. Only the department list and one fresh admin account will remain.'
        )) {
            return self::FAILURE;
        }

        $this->wipeAllTables();
        $this->components->info('All tables truncated.');

        app(DepartmentSeeder::class)->run();
        $this->components->info('Departments seeded.');

        $admin = $this->createFirstAdmin();
        $this->components->info('Admin account created.');

        $this->newLine();
        $this->line('  Admin email:    '.$admin['email']);

        if ($admin['generated_password']) {
            $this->warn('  Admin password: '.$admin['password'].'  (generated — shown once, save it now)');
        } else {
            $this->line('  Admin password: <as configured>');
        }

        return self::SUCCESS;
    }

    private function wipeAllTables(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach (Schema::getTableListing() as $table) {
            if ($table === 'migrations') {
                continue;
            }

            DB::table($table)->truncate();
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * @return array{email: string, password: string, generated_password: bool}
     */
    private function createFirstAdmin(): array
    {
        $email = $this->option('admin-email') ?: config('production_seed.admin_email');
        $password = $this->option('admin-password') ?: config('production_seed.admin_password');
        $generated = false;

        if (! $password) {
            $password = Str::password(20);
            $generated = true;
        }

        // email_verified_at isn't fillable (by design — see User::$fillable),
        // so it's set via forceFill rather than being silently dropped here.
        User::create([
            'name' => config('production_seed.admin_name'),
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
        ])->forceFill(['email_verified_at' => now()])->save();

        return ['email' => $email, 'password' => $password, 'generated_password' => $generated];
    }
}
