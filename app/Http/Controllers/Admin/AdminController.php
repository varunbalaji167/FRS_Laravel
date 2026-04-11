<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AccountAccessNotification;
use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $applicationsQuery = JobApplication::query();

        if ($user->role === 'hod') {
            $applicationsQuery->where('department', $user->department);
        }

        $statusCounts = (clone $applicationsQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $byDepartment = (clone $applicationsQuery)
            ->select('department', DB::raw('count(*) as count'))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->groupBy('department')
            ->orderByDesc('count')
            ->get();

        $byAdvertisement = (clone $applicationsQuery)
            ->select('advertisement_id', DB::raw('count(*) as count'))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->with('advertisement:id,title,reference_number')
            ->groupBy('advertisement_id')
            ->orderByDesc('count')
            ->get();

        $overTime = (clone $applicationsQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $viewFolder = $user->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Dashboard", [
            'stats' => [
                'totalAdvertisements' => Advertisement::count(),
                'activeAdvertisements' => Advertisement::where('is_active', true)->count(),
                'totalApplications' => (clone $applicationsQuery)->whereIn('status', ['submitted', 'shortlisted', 'rejected'])->count(),
                'submitted' => $statusCounts['submitted'] ?? 0,
                'shortlisted' => $statusCounts['shortlisted'] ?? 0,
                'rejected' => $statusCounts['rejected'] ?? 0,
                'drafts' => $statusCounts['draft'] ?? 0,
                'totalApplicants' => $user->role === 'admin' ? User::where('role', 'applicant')->count() : null,
            ],
            'byDepartment' => $byDepartment,
            'byAdvertisement' => $byAdvertisement,
            'overTime' => $overTime,
            'recentApplications' => (clone $applicationsQuery)->with(['user', 'advertisement'])
                ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
                ->latest()
                ->take(5)
                ->get(),
            'recentAdvertisements' => Advertisement::latest()->take(5)->get(),
        ]);
    }

    /**
     * Display Settings page for Admin/HOD
     */
    public function settings(Request $request)
    {
        $user = $request->user();
        $viewFolder = $user->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Settings", [
            'departments' => Department::orderBy('name')->get(),
            'status' => session('status'),
            'mustVerifyEmail' => false,
        ]);
    }

    /**
     * Store a new department (Admin only)
     */
    public function storeDepartment(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:departments,name|max:255',
        ]);

        Department::create($request->only('name'));

        return back()->with('success', 'Department added successfully.');
    }

    /**
     * Delete a department (Admin only)
     */
    public function destroyDepartment(Department $department)
    {
        $department->delete();

        return back()->with('success', 'Department deleted successfully.');
    }

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
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    /**
     * Pre-provision a new Admin or HOD manually
     */
    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|in:admin,hod',
            'department' => 'required_if:role,hod|string|nullable|max:255',
        ]);

        // 1. CAPTURE the created user into the $user variable
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'department' => $request->role === 'hod' ? $request->department : null,
            'password' => Hash::make(Str::random(32)),
        ]);

        // 2. Safely pass the $user variable into the Mailable
        Mail::to($request->email)->send(new AccountAccessNotification($user->name, $user->role, $user->department, 'created'));

        return back()->with('success', "New {$request->role} created successfully. Notification email sent.");
    }

    /**
     * Update an existing user's role/department
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,hod,applicant',
            'department' => 'required_if:role,hod|string|nullable|max:255',
        ]);

        // Prevent the admin from accidentally demoting themselves and locking themselves out
        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            return back()->with('error', 'You cannot demote yourself from the admin role.');
        }

        // Update the user
        $user->update([
            'role' => $request->role,
            'department' => $request->role === 'hod' ? $request->department : null,
        ]);

        // Send Update Email (The $user variable is automatically provided by Laravel's route injection)
        Mail::to($user->email)->send(new AccountAccessNotification($user->name, $user->role, $user->department, 'updated'));

        return back()->with('success', 'Role updated to '.strtoupper($request->role)." for {$user->name}. Notification email sent.");
    }

    /**
     * Delete a user from the system
     */
    public function destroyUser(Request $request, User $user)
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own admin account.');
        }
        // Capture the email BEFORE we delete the user
        $email = $user->email;

        // Queue the email.
        Mail::to($email)->send(new AccountAccessNotification($user->name, $user->role, $user->department, 'deleted'));
        $user->delete();

        return back()->with('success', 'User permanently deleted.');
    }
}
