<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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
        $user = $request->user();

        // applicantProfile and email_verified_at are off the global Inertia
        // share (see HandleInertiaRequests), so this page fetches them.
        return Inertia::render('Profile/MasterProfile', [
            'user' => $user->only(['id', 'name', 'email', 'email_verified_at'])
                + ['applicant_profile' => $user->applicantProfile],
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update(['name' => $validated['name']]);

        if ($user->role !== 'applicant') {
            return Redirect::route($user->role.'.settings')->with('success', 'Profile updated successfully.');
        }

        $profileData = array_intersect_key($validated, array_flip(ProfileUpdateRequest::PROFILE_FIELDS));

        if ($request->hasFile('profile_image')) {
            $current = $user->applicantProfile;

            if ($current && $current->photo_path) {
                Storage::disk('local')->delete($current->photo_path);
            }

            $profileData['photo_path'] = $request->file('profile_image')->store("profiles/{$user->id}", 'local');
        }

        $user->applicantProfile()->updateOrCreate(['user_id' => $user->id], $profileData);

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();

        if ($user->applicantProfile?->photo_path) {
            Storage::disk('local')->deleteDirectory("profiles/{$user->id}");
        }

        Auth::logout();

        // The ApplicantProfile row goes with it via cascadeOnDelete.
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
