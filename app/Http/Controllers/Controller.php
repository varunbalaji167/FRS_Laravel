<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    /**
     * HOD and admin share the same controllers/routes for applications and
     * the dashboard, but render into separate Inertia page folders.
     */
    protected function adminOrHodViewFolder(User $user): string
    {
        return $user->role === 'admin' ? 'Admin' : 'Hod';
    }
}
