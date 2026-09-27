<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\DomainException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateRoleRequest;
use App\Mail\AccountAccessNotification;
use App\Models\Department;
use App\Models\User;
use App\Services\Auditing\AdminActionRecorder;
use App\Services\Reporting\DashboardAggregator;
use App\Support\ErrorCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class UserController extends Controller
{
    /**
     * Manage Users: View all Admins, HODs, and Applicants
     */
    public function users()
    {
        // Fetch all users to allow full institutional management
        $users = User::select('id', 'name', 'email', 'role', 'department')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'departments' => Department::allCached(),
        ]);
    }

    /**
     * Pre-provision a new Admin or HOD manually
     */
    public function storeUser(StoreUserRequest $request, AdminActionRecorder $adminActions, DashboardAggregator $dashboard)
    {
        $isHod = $request->role === 'hod';

        // 1. CAPTURE the created user into the $user variable
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'department' => $isHod ? $request->department : null,
            'department_id' => $isHod ? Department::idForName($request->department) : null,
            'password' => Hash::make(Str::random(32)),
        ]);

        // 2. Safely pass the $user variable into the Mailable. A down SMTP
        // server must not swallow the fact that the account was already
        // created — log it and let the admin retry the notification later.
        $this->sendAccountAccessNotification($user, $request->email, 'created');

        $adminActions->record($request, 'user.created', $user, null, $user->only(['id', 'name', 'email', 'role', 'department']));

        $dashboard->forget(null);

        return back()->with('success', "New {$request->role} created successfully. Notification email sent.");
    }

    /**
     * Update an existing user's role/department
     */
    public function updateRole(UpdateRoleRequest $request, User $user, AdminActionRecorder $adminActions, DashboardAggregator $dashboard)
    {
        // Prevent the admin from accidentally demoting themselves and locking themselves out
        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            throw new DomainException(ErrorCode::ADMIN_SELF_DEMOTE_FORBIDDEN);
        }

        // Independent of self-demote: refuse to demote the last remaining
        // admin, even if a different admin is doing it. Otherwise the
        // Institute portal can end up with zero admins and no way to
        // provision new ones.
        if ($user->role === 'admin' && $request->role !== 'admin' && $this->isLastAdmin($user)) {
            throw new DomainException(ErrorCode::USER_LAST_ADMIN);
        }

        $before = $user->only(['role', 'department']);
        $isHod = $request->role === 'hod';

        // Update the user
        $user->update([
            'role' => $request->role,
            'department' => $isHod ? $request->department : null,
            'department_id' => $isHod ? Department::idForName($request->department) : null,
        ]);

        // Send Update Email (The $user variable is automatically provided by Laravel's route injection)
        $this->sendAccountAccessNotification($user, $user->email, 'updated');

        $adminActions->record($request, 'user.role_updated', $user, $before, $user->only(['role', 'department']));

        $dashboard->forget($before['department']);
        $dashboard->forget($user->department);

        return back()->with('success', 'Role updated to '.strtoupper($request->role)." for {$user->name}. Notification email sent.");
    }

    /**
     * Delete a user from the system
     */
    public function destroyUser(Request $request, User $user, AdminActionRecorder $adminActions, DashboardAggregator $dashboard)
    {
        // Prevent self-deletion — same failure mode as the self-demote
        // guard in updateRole, so it reuses the same ErrorCode.
        if ($user->id === $request->user()->id) {
            throw new DomainException(ErrorCode::ADMIN_SELF_DEMOTE_FORBIDDEN);
        }

        // Refuse to delete the last remaining admin — see updateRole.
        if ($user->role === 'admin' && $this->isLastAdmin($user)) {
            throw new DomainException(ErrorCode::USER_LAST_ADMIN);
        }

        // Capture the email BEFORE we delete the user
        $email = $user->email;
        $before = $user->only(['id', 'name', 'email', 'role', 'department']);

        // Queue the email.
        $this->sendAccountAccessNotification($user, $email, 'deleted');

        $adminActions->record($request, 'user.deleted', $user, $before, null);

        $user->delete();

        $dashboard->forget($before['department']);

        return back()->with('success', 'User permanently deleted.');
    }

    private function isLastAdmin(User $user): bool
    {
        return $user->role === 'admin'
            && User::where('role', 'admin')->where('id', '!=', $user->id)->doesntExist();
    }

    /**
     * A down SMTP server must not swallow the fact that the underlying
     * account action already happened — log it and let the admin retry the
     * notification later. Shared by storeUser/updateRole/destroyUser.
     */
    private function sendAccountAccessNotification(User $user, string $email, string $action): void
    {
        try {
            Mail::to($email)->send(new AccountAccessNotification($user->name, $user->role, $user->department, $action));
        } catch (Throwable $e) {
            Log::error('AccountAccessNotification mail failed', [
                'user_id' => $user->id,
                'action' => $action,
                'exception' => $e->getMessage(),
            ]);
        }
    }
}
