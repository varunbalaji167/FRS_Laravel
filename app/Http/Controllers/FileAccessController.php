<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

// TODO(Phase 1): move to app/Http/Controllers/FileAccessController.php final location per docs/architecture.md
class FileAccessController extends Controller
{
    /**
     * Serve a file from the private disk after checking the requester
     * actually owns it (or is an admin/HOD scoped to it).
     */
    public function show(Request $request, string $path): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($path), 404);
        abort_unless($this->authorized($request, $path), 404);

        return Storage::disk('local')->response($path);
    }

    private function authorized(Request $request, string $path): bool
    {
        $user = $request->user();
        $segments = explode('/', $path);

        if ($segments[0] === 'applications' && isset($segments[1], $segments[2])) {
            $ownerId = (int) $segments[1];

            if ($user->id === $ownerId) {
                return true;
            }

            if (! in_array($user->role, ['admin', 'hod'], true)) {
                return false;
            }

            $application = JobApplication::where('user_id', $ownerId)
                ->where('advertisement_id', (int) $segments[2])
                ->first();

            return $application
                && in_array($application->status, ['submitted', 'shortlisted', 'rejected'], true)
                && ($user->role === 'admin' || $application->department === $user->department);
        }

        if ($segments[0] === 'profiles' && isset($segments[1])) {
            $ownerId = (int) $segments[1];

            return $user->id === $ownerId || $user->role === 'admin';
        }

        return false;
    }
}
