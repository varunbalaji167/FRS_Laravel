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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    public function users(): Response
    {
        $users = User::select('id', 'name', 'email', 'role', 'department_id')
            ->with('department:id,name')
            ->latest()
            ->paginate(20);

        // Built explicitly rather than serialised straight through: the
        // frontend expects a plain 'department' name string, and the
        // 'department' key would otherwise collide with the department()
        // relation once it's eager-loaded onto each row.
        $users->getCollection()->transform(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department_name,
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'departments' => Department::allCached(),
        ]);
    }

    /**
     * Pre-provision an Admin or HOD; they never self-register.
     */
    public function storeUser(StoreUserRequest $request, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
    {
        $isHod = $request->role === 'hod';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'department_id' => $isHod ? Department::idForName($request->department) : null,
            'password' => Hash::make(Str::random(32)),
        ]);

        $this->sendAccountAccessNotification($user, $request->email, 'created');

        $adminActions->record($request, 'user.created', $user, null, [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department_name,
        ]);

        $dashboard->forget(null);

        return back()->with('success', "New {$request->role} created successfully. Notification email sent.");
    }

    public function updateRole(UpdateRoleRequest $request, User $user, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
    {
        // Stops an admin locking themselves out.
        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            throw new DomainException(ErrorCode::ADMIN_SELF_DEMOTE_FORBIDDEN);
        }

        // Zero admins means no way to provision new ones, so the last one
        // can't be demoted even by a different admin.
        if ($user->role === 'admin' && $request->role !== 'admin' && $this->isLastAdmin($user)) {
            throw new DomainException(ErrorCode::USER_LAST_ADMIN);
        }

        $beforeDepartmentId = $user->department_id;
        $before = ['role' => $user->role, 'department' => $user->department_name];
        $isHod = $request->role === 'hod';

        $user->update([
            'role' => $request->role,
            'department_id' => $isHod ? Department::idForName($request->department) : null,
        ]);

        $user->unsetRelation('department');

        $this->sendAccountAccessNotification($user, $user->email, 'updated');

        $adminActions->record($request, 'user.role_updated', $user, $before, [
            'role' => $user->role,
            'department' => $user->department_name,
        ]);

        $dashboard->forget($beforeDepartmentId);
        $dashboard->forget($user->department_id);

        return back()->with('success', 'Role updated to '.strtoupper($request->role)." for {$user->name}. Notification email sent.");
    }

    public function destroyUser(Request $request, User $user, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
    {
        // Same failure mode as the self-demote guard, same ErrorCode.
        if ($user->id === $request->user()->id) {
            throw new DomainException(ErrorCode::ADMIN_SELF_DEMOTE_FORBIDDEN);
        }

        // See updateRole.
        if ($user->role === 'admin' && $this->isLastAdmin($user)) {
            throw new DomainException(ErrorCode::USER_LAST_ADMIN);
        }

        // Captured before the row goes away.
        $email = $user->email;
        $departmentId = $user->department_id;
        $before = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department_name,
        ];

        $this->sendAccountAccessNotification($user, $email, 'deleted');

        $adminActions->record($request, 'user.deleted', $user, $before, null);

        $user->delete();

        $dashboard->forget($departmentId);

        return back()->with('success', 'User permanently deleted.');
    }

    private function isLastAdmin(User $user): bool
    {
        return $user->role === 'admin'
            && User::where('role', 'admin')->where('id', '!=', $user->id)->doesntExist();
    }

    /**
     * Failures only reach the log: a down mail server must not hide that
     * the account change already happened.
     */
    private function sendAccountAccessNotification(User $user, string $email, string $action): void
    {
        try {
            Mail::to($email)->queue(new AccountAccessNotification($user->name, $user->role, $user->department_name, $action));
        } catch (Throwable $e) {
            Log::error('AccountAccessNotification mail failed', [
                'user_id' => $user->id,
                'action' => $action,
                'exception' => $e->getMessage(),
            ]);
        }
    }
}
