<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\DomainException;
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
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class SocialAuthController extends Controller
{
    private const STAFF_ROLES = ['admin', 'hod'];

    public function redirect(Request $request): SymfonyRedirectResponse
    {
        $intendedRole = $request->query('role', 'applicant');
        $request->session()->put('intended_role', $intendedRole);

        $driver = Socialite::driver('google');

        // Steers Google's account chooser only; the returned `hd` claim is
        // what callback() actually enforces.
        if (in_array($intendedRole, self::STAFF_ROLES, true) && $driver instanceof AbstractProvider) {
            $driver = $driver->with(['hd' => 'iiti.ac.in']);
        }

        return $driver->redirect();
    }

    public function callback(Request $request): RedirectResponse
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

        // Staff must use the institute email, on any non-applicant portal.
        if ($isStaffPortal && ! str_ends_with($email, '@iiti.ac.in')) {
            return redirect()->route('login')->with('error', ErrorCode::AUTH_DOMAIN_NOT_ALLOWED->userMessage());
        }

        // Google doesn't enforce the `hd` param we sent, so re-check the
        // claim it actually returned.
        $hd = $googleUser->user['hd'] ?? null;
        if ($isStaffPortal && $hd !== null && $hd !== 'iiti.ac.in') {
            return redirect()->route('login')->with('error', ErrorCode::OAUTH_HD_MISMATCH->userMessage());
        }

        $user = User::where('email', $email)->first();

        // Never auto-link a Google identity to an existing password account:
        // an attacker could pre-register the victim's email and inherit it.
        if ($user && $user->google_id === null) {
            $request->session()->put('google_link_pending', [
                'google_id' => $googleUser->getId(),
                'email' => $email,
                'name' => $googleUser->getName(),
                'intended_role' => $intendedRole,
            ]);

            return redirect()->route('google.link')
                ->with('error', ErrorCode::OAUTH_ACCOUNT_LINK_REQUIRED->userMessage());
        }

        if ($user && $user->google_id !== $googleUser->getId()) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        if (! $user) {
            // Admins and HODs are provisioned by the IT Center, never self-registered.
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

        return $this->loginForPortal($request, $user, $intendedRole);
    }

    public function showLinkAccount(Request $request): Response|RedirectResponse
    {
        $pending = $request->session()->get('google_link_pending');

        if (! $pending) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/AccountLink', ['email' => $pending['email']]);
    }

    /**
     * Link the pending Google identity once the account's password is proven.
     */
    public function confirmLinkAccount(ConfirmAccountLinkRequest $request): RedirectResponse
    {
        $pending = $request->session()->get('google_link_pending');

        if (! $pending) {
            return redirect()->route('login');
        }

        $user = User::where('email', $pending['email'])->first();

        if (! $user || ! Hash::check($request->validated()['password'], $user->password)) {
            throw new DomainException(ErrorCode::AUTH_INVALID_CREDENTIALS);
        }

        $user->update(['google_id' => $pending['google_id']]);
        $request->session()->forget('google_link_pending');

        return $this->loginForPortal($request, $user, $pending['intended_role']);
    }

    private function loginForPortal(Request $request, User $user, string $intendedRole): RedirectResponse
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
        // Same session-fixation guard the password login path applies.
        $request->session()->regenerate();

        if ($userIsStaff) {
            return redirect()->route("{$user->role}.dashboard")->with('success', 'Welcome back to the Institute Portal!');
        }

        return redirect()->route('dashboard')->with('success', 'Logged in successfully!');
    }
}
