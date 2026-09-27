<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'title',
        'document_path',
        'deadline',
        'departments',
        'is_active',
    ];

    // This automatically converts the JSON from the database into a PHP Array
    protected $casts = [
        'departments' => 'array',
        'deadline' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * FK counterpart of the legacy `departments` JSON name list, populated
     * by the Phase 8 backfill migration. See config/features.php.
     */
    /**
     * @return BelongsToMany<Department, $this>
     */
    public function departmentModels(): BelongsToMany
    {
        return $this->belongsToMany(Department::class);
    }
}
