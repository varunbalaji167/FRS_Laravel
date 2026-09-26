<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        // This is specifically the Applicant's master profile view
        return Inertia::render('Profile/MasterProfile', [
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => $request->input('name', $user->name),
        ]);

        if ($user->role === 'applicant') {
            $profileData = $request->validate([
                'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
                'father_name' => ['nullable', 'string', 'max:255'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'string', 'max:50'],
                'marital_status' => ['nullable', 'string', 'max:50'],
                'category' => ['nullable', 'string', 'max:50'],
                'nationality' => ['nullable', 'string', 'max:100'],
                'id_proof' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'string', 'max:20'],
                'phone_code' => ['nullable', 'string', 'max:6'],
                'alt_phone' => ['nullable', 'string', 'max:20'],
                'alt_phone_code' => ['nullable', 'string', 'max:6'],
                'alt_email' => ['nullable', 'email', 'max:255'],
                'corr_address' => ['nullable', 'string'],
                'corr_city' => ['nullable', 'string', 'max:100'],
                'corr_state' => ['nullable', 'string', 'max:100'],
                'corr_pincode' => ['nullable', 'string', 'max:20'],
                'corr_country' => ['nullable', 'string', 'max:100'],
                'perm_address' => ['nullable', 'string'],
                'perm_city' => ['nullable', 'string', 'max:100'],
                'perm_state' => ['nullable', 'string', 'max:100'],
                'perm_pincode' => ['nullable', 'string', 'max:20'],
                'perm_country' => ['nullable', 'string', 'max:100'],
                'designation' => ['nullable', 'string', 'max:255'],
                'affiliation' => ['nullable', 'string', 'max:255'],
                'google_scholar_url' => ['nullable', 'url', 'max:255'],
                'orcid_url' => ['nullable', 'url', 'max:255'],
                'linkedin_url' => ['nullable', 'url', 'max:255'],
                'github_url' => ['nullable', 'url', 'max:255'],
            ]);

            unset($profileData['profile_image']);

            // Handle File Uploads for the Applicant Profile
            if ($request->hasFile('profile_image')) {
                $currentProfile = $user->applicantProfile;

                // Delete the old image if it exists
                if ($currentProfile && $currentProfile->photo_path) {
                    Storage::disk('local')->delete($currentProfile->photo_path);
                }

                // Store the new image
                $profileData['photo_path'] = $request->file('profile_image')->store("profiles/{$user->id}", 'local');
            }

            // Update or Create the 1-to-1 Applicant Profile
            $user->applicantProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            // Redirect back to Applicant Master Profile
            return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
        }

        // --- Admin & HOD Redirections ---
        if ($user->role === 'admin') {
            return Redirect::route('admin.settings')->with('success', 'Profile updated successfully.');
        }

        if ($user->role === 'hod') {
            return Redirect::route('hod.settings')->with('success', 'Profile updated successfully.');
        }

        // Fallback for any unknown roles
        return Redirect::route('dashboard')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();

        // Clean up the user's profile image folder before deleting the user (if they have one)
        $profile = $user->applicantProfile;
        if ($profile && $profile->photo_path) {
            Storage::disk('local')->deleteDirectory("profiles/{$user->id}");
        }

        Auth::logout();

        // This automatically deletes their ApplicantProfile too because of cascadeOnDelete in the migration
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
