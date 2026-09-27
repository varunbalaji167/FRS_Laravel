<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                // Whitelisted subset only — no google_id, email_verified_at, or the
                // applicantProfile relation. Pages that need the profile fetch it
                // explicitly (see ProfileController@edit).
                'user' => $request->user()?->only(['id', 'name', 'email', 'role', 'department']),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
