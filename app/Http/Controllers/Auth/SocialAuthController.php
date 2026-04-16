<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect(Request $request)
    {
        // Save the intended role to the session (defaults to applicant)
        $request->session()->put('intended_role', $request->query('role', 'applicant'));

        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google and log them in.
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $email = $googleUser->getEmail();

            // Pull the intended role out of the session
            $intendedRole = $request->session()->pull('intended_role', 'applicant');

            // 1. Domain Clarity Check: Admins MUST use the institute email
            if ($intendedRole === 'admin' && ! str_ends_with($email, '@iiti.ac.in')) {
                return redirect()->route('login')->with('error', 'Unauthorized access. Institute login strictly requires an @iiti.ac.in email address.');
            }

            // 2. Database Clarity Check: Does this user already exist?
            $user = User::where('email', $email)->first();

            if ($user) {
                // User exists: Just update their Google ID in case this is their first time using the Google button.
                $user->update([
                    'google_id' => $googleUser->getId(),
                ]);
            } else {
                // --- THE SECURITY FIX IS HERE ---
                // If they don't exist in the DB, check what role they are trying to claim.
                // Admins and HODs CANNOT self-register. They must be provisioned by the Super Admin.
                if (in_array($intendedRole, ['admin', 'hod'])) {
                    return redirect()->route('login')->with('error', 'Access Denied. Administrative accounts must be pre-provisioned by the IT Center. You cannot self-register.');
                }

                // If we get here, they are an applicant. It is safe to create a brand new account.
                $user = User::create([
                    'email' => $email,
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'role' => 'applicant', // Hardcoded safely to applicant to prevent privilege escalation
                    'password' => Hash::make(Str::random(32)), // 32-character secure random string
                ]);
            }

            // 3. Security Clarity Check: Prevent portal mix-ups
            if ($intendedRole === 'admin') {
                // The user clicked the "Institute (Admin / Faculty)" button
                if (! in_array($user->role, ['admin', 'hod'])) {
                    return redirect()->route('login')->with('error', 'Unauthorized. You cannot log in to the Institute portal with an applicant account.');
                }
            } else {
                // The user clicked the "Applicant" button
                if ($user->role !== 'applicant') {
                    return redirect()->route('login')->with('error', 'Unauthorized. Staff members must use the Institute portal to log in.');
                }
            }
            // 4. Log the user in securely
            Auth::login($user);

            // 5. Redirect them to their proper dashboard
            if (in_array($user->role, ['admin', 'hod'])) {
                // Dynamically use the route names: 'admin.dashboard' or 'hod.dashboard'
                return redirect()->route("{$user->role}.dashboard")->with('success', 'Welcome back to the Institute Portal!');
            }

            return redirect()->route('dashboard')->with('success', 'Logged in successfully!');

        } catch (\Exception $e) {
            // Failsafe catch block
            return redirect()->route('login')->with('error', 'Google login failed or was cancelled. Please try again.');
        }
    }
}
