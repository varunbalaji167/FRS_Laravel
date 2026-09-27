<?php

namespace App\Models;

use Database\Factories\AdvertisementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Advertisement extends Model
{
    /** @use HasFactory<AdvertisementFactory> */
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
     * FK counterpart of the legacy `departments` JSON name list.
     */
    /**
     * @return BelongsToMany<Department, $this>
     */
    public function departmentModels(): BelongsToMany
    {
        return $this->belongsToMany(Department::class);
    }
}
