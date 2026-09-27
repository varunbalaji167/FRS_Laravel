<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    /**
     * HOD and admin share controllers but render into separate page folders.
     */
    protected function adminOrHodViewFolder(User $user): string
    {
        return $user->role === 'admin' ? 'Admin' : 'Hod';
    }
}
