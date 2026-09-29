<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileAccessController extends Controller
{
    /**
     * Streams a private-disk file once the requester is proven to own it,
     * or to be an admin/HOD scoped to it.
     */
    public function show(Request $request, string $path): StreamedResponse
    {
        // Every failure is a 404 so the route can't be used to probe which
        // paths exist.
        abort_if($this->isTraversal($path), 404);
        abort_unless(Storage::disk('local')->exists($path), 404);
        abort_unless($this->authorized($request, $path), 404);

        return Storage::disk('local')->response($path);
    }

    private function isTraversal(string $path): bool
    {
        return in_array('..', explode('/', str_replace('\\', '/', $path)), true);
    }

    private function authorized(Request $request, string $path): bool
    {
        $user = $request->user();
        $segments = explode('/', $path);

        if ($segments[0] === 'applications' && isset($segments[1], $segments[2])) {
            return $this->authorizedForApplication($user, (int) $segments[1], (int) $segments[2]);
        }

        if ($segments[0] === 'profiles' && isset($segments[1])) {
            return $user->id === (int) $segments[1] || $user->role === 'admin';
        }

        return false;
    }

    private function authorizedForApplication(User $user, int $ownerId, int $advertisementId): bool
    {
        if ($user->id === $ownerId) {
            return true;
        }

        if (! in_array($user->role, ['admin', 'hod'], true)) {
            return false;
        }

        $application = JobApplication::where('user_id', $ownerId)
            ->where('advertisement_id', $advertisementId)
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->first();

        if (! $application) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        // Mirrors Admin\ApplicationController::getScopedQuery() so a
        // department rename can't split dossier access from file access.
        return $application->department_id === $user->department_id;
    }
}
