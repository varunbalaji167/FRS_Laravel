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
                // Whitelisted subset only. Pages needing the profile fetch
                // it explicitly (see ProfileController@edit).
                //
                // 'department' is built explicitly rather than passed to
                // only(): the relation method is now named department(), so
                // Model::only() would auto-load the relation and serialise
                // the whole Department row instead of its name.
                'user' => $request->user() ? [
                    ...$request->user()->only(['id', 'name', 'email', 'role']),
                    'department' => $request->user()->department_name,
                ] : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
