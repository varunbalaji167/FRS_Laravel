<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\DomainException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\ErrorCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            $this->logoutAndInvalidate($request);

            throw new DomainException(ErrorCode::AUTH_DOMAIN_NOT_ALLOWED);
        }

        $allowedRoles = $attemptedRole === 'admin' ? ['admin', 'hod'] : ['applicant'];
        if (! in_array($user->role, $allowedRoles, true)) {
            $this->logoutAndInvalidate($request);

            throw new DomainException(ErrorCode::AUTH_ROLE_MISMATCH);
        }

        // Regenerate session after login
        $request->session()->regenerate();

        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard')->with('success', 'Login successful! Welcome to the Admin portal.'),
            'hod' => redirect()->route('hod.dashboard')->with('success', 'Login successful! Welcome to the Department portal.'),
            default => redirect()->route('dashboard')->with('success', 'Login successful! Welcome to your dashboard.'),
        };
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

    private function logoutAndInvalidate(Request $request): void
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
