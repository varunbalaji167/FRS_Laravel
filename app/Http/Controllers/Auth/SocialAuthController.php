<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmAccountLinkRequest;
use App\Models\User;
use App\Support\ErrorCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class SocialAuthController extends Controller
{
    private const STAFF_ROLES = ['admin', 'hod'];

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect(Request $request)
    {
        $intendedRole = $request->query('role', 'applicant');
        $request->session()->put('intended_role', $intendedRole);

        $driver = Socialite::driver('google');

        // Restricts Google's account chooser to the institute's Workspace —
        // convenience, not a real security boundary; the `hd` claim on the
        // returned user is what's actually re-checked in callback().
        if (in_array($intendedRole, self::STAFF_ROLES, true)) {
            $driver = $driver->with(['hd' => 'iiti.ac.in']);
        }

        return $driver->redirect();
    }

    /**
     * Obtain the user information from Google and log them in.
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            Log::warning('Google OAuth state mismatch', ['exception' => $e->getMessage()]);

            return redirect()->route('login')->with('error', ErrorCode::OAUTH_STATE_INVALID->userMessage());
        } catch (Throwable $e) {
            Log::error('Google OAuth callback failed', ['exception' => $e->getMessage()]);

            return redirect()->route('login')->with('error', 'Google login failed or was cancelled. Please try again.');
        }

        $email = $googleUser->getEmail();
        $intendedRole = $request->session()->pull('intended_role', 'applicant');
        $isStaffPortal = in_array($intendedRole, self::STAFF_ROLES, true);

        // 1. Domain Clarity Check: staff MUST use the institute email —
        // applies to any non-applicant portal, not just 'admin'.
        if ($isStaffPortal && ! str_ends_with($email, '@iiti.ac.in')) {
            return redirect()->route('login')->with('error', ErrorCode::AUTH_DOMAIN_NOT_ALLOWED->userMessage());
        }

        // 2. Re-check the `hd` (hosted domain) claim Google actually
        // returned, rather than trusting the `hd` param sent in redirect() —
        // that param only steers the account chooser UI, it isn't enforced
        // by Google, so a staff sign-in with a personal Gmail that merely
        // happens to end in @iiti.ac.in-lookalike is still worth flagging
        // when the claim is present and doesn't match.
        $hd = $googleUser->user['hd'] ?? null;
        if ($isStaffPortal && $hd !== null && $hd !== 'iiti.ac.in') {
            return redirect()->route('login')->with('error', ErrorCode::OAUTH_HD_MISMATCH->userMessage());
        }

        $user = User::where('email', $email)->first();

        // 3. Existing password-only account: don't silently attach this
        // Google identity to it. Without this, an attacker who knows a
        // victim's email could register a local account first, then the
        // victim's own "Sign in with Google" click would get silently
        // merged into the attacker's account. Require the human to prove
        // they hold the password before linking.
        if ($user && $user->google_id === null) {
            $request->session()->put('google_link_pending', [
                'google_id' => $googleUser->getId(),
                'email' => $email,
                'name' => $googleUser->getName(),
                'intended_role' => $intendedRole,
            ]);

            return redirect()->route('google.link');
        }

        if ($user && $user->google_id !== $googleUser->getId()) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        if (! $user) {
            // Admins and HODs cannot self-register — they must be
            // provisioned by the IT Center.
            if ($isStaffPortal) {
                return redirect()->route('login')->with('error', 'Access Denied. Administrative accounts must be pre-provisioned by the IT Center. You cannot self-register.');
            }

            $user = User::create([
                'email' => $email,
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'role' => 'applicant',
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        return $this->loginForPortal($user, $intendedRole);
    }

    /**
     * Show the "confirm your password to link this Google account" page.
     */
    public function showLinkAccount(Request $request)
    {
        $pending = $request->session()->get('google_link_pending');

        if (! $pending) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/AccountLink', ['email' => $pending['email']]);
    }

    /**
     * Confirm ownership of the existing local account with its password,
     * then link the pending Google identity to it and log in.
     */
    public function confirmLinkAccount(ConfirmAccountLinkRequest $request): RedirectResponse
    {
        $pending = $request->session()->get('google_link_pending');

        if (! $pending) {
            return redirect()->route('login');
        }

        $user = User::where('email', $pending['email'])->first();

        if (! $user || ! Hash::check($request->validated()['password'], $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $user->update(['google_id' => $pending['google_id']]);
        $request->session()->forget('google_link_pending');

        return $this->loginForPortal($user, $pending['intended_role']);
    }

    private function loginForPortal(User $user, string $intendedRole): RedirectResponse
    {
        $isStaffPortal = in_array($intendedRole, self::STAFF_ROLES, true);
        $userIsStaff = in_array($user->role, self::STAFF_ROLES, true);

        if ($isStaffPortal !== $userIsStaff) {
            $message = $isStaffPortal
                ? 'Unauthorized. You cannot log in to the Institute portal with an applicant account.'
                : 'Unauthorized. Staff members must use the Institute portal to log in.';

            return redirect()->route('login')->with('error', $message);
        }

        Auth::login($user);

        if ($userIsStaff) {
            return redirect()->route("{$user->role}.dashboard")->with('success', 'Welcome back to the Institute Portal!');
        }

        return redirect()->route('dashboard')->with('success', 'Logged in successfully!');
    }
}
