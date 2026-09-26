<?php

namespace App\Services\Files;

use Illuminate\Support\Facades\Storage;

/**
 * Private-disk read/write + signed URL helpers, wrapping the Phase 0
 * FileAccessController logic. Filled in Phase 4.
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
