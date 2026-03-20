<?php
namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/MasterProfile', [
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // 1. Update Core User (Name/Email)
        $user->update([
            'name' => $request->input('name', $user->name),
        ]);

        // 2. Separate profile data
        $profileData = $request->except(['name', 'email', 'photo', 'cv']);

        // Handle File Uploads for the Profile
        if ($request->hasFile('photo')) {
            $profileData['photo_path'] = $request->file('photo')->store("profiles/{$user->id}", 'public');
        }

        // 3. Update or Create the 1-to-1 Applicant Profile
        $user->applicantProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        \Illuminate\Support\Facades\Auth::logout();
        $user->delete(); // This automatically deletes their ApplicantProfile too because of cascadeOnDelete!
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}