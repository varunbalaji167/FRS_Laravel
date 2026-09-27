<?php

namespace App\Services\Files;

use Illuminate\Support\Facades\Storage;

/**
 * Private-disk helpers behind FileAccessController.
 */
class DossierFileStore
{
    public function __construct()
    {
        //
    }

    public function exists(string $path): bool
    {
        return Storage::disk('local')->exists($path);
    }
}
