<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show login page
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle login request
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Attempt authentication
        $request->authenticate();

        $user = $request->user();
        $attemptedRole = $request->input('role');

        if ($attemptedRole === 'admin' && ! str_ends_with($user->email, '@iiti.ac.in')) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Unauthorized access. Institute login strictly requires an @iiti.ac.in email address.',
            ]);
        }

        // Check if user is logging into the correct portal
        if ($user->role !== $attemptedRole) {

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Unauthorized access. You cannot log in to the '.ucfirst($attemptedRole).' portal with these credentials.',
            ]);
        }

        // Regenerate session after login
        $request->session()->regenerate();

        /**
         * Redirect user based on role
         */
        switch ($user->role) {
            case 'admin':
                return redirect()->route('admin.dashboard')->with('success', 'Login successful! Welcome to the Admin portal.');

            case 'hod':
                return redirect()->route('admin.dashboard')->with('success', 'Login successful! Welcome to the HOD portal.');

            case 'applicant':
            default:
                return redirect()->route('dashboard')->with('success', 'Login successful! Welcome to your dashboard.');
        }
    }

    /**
     * Logout user
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
