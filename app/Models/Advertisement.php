<?php

namespace App\Models;

use Database\Factories\AdvertisementFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
    ];

    // This automatically converts the JSON from the database into a PHP Array
    protected $casts = [
        'departments' => 'array',
        'deadline' => 'date',
    ];

    /**
     * There is no independent "active" flag any more — an advertisement is
     * open for as long as today is on or before its deadline. Appended so it
     * still serialises into Inertia props/JSON the same way the old column
     * did.
     *
     * Null when a query selected this model without `deadline` (e.g. a
     * filter dropdown that only needs `id`/`title`) — there's nothing to
     * compute from, so this reads as "unknown", not "inactive".
     *
     * @return Attribute<?bool, never>
     */
    protected function isActive(): Attribute
    {
        return Attribute::get(function () {
            if (! array_key_exists('deadline', $this->getAttributes())) {
                return null;
            }

            return $this->deadline->greaterThanOrEqualTo(now()->startOfDay());
        });
    }

    protected $appends = ['is_active'];

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
