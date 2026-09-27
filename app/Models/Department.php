<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Department extends Model
{
    protected $fillable = ['name'];

    public const CACHE_KEY = 'departments.all.v1';

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'department_id');
    }

    /**
     * @return HasMany<JobApplication, $this>
     */
    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'department_id');
    }

    /**
     * @return BelongsToMany<Advertisement, $this>
     */
    public function advertisements(): BelongsToMany
    {
        return $this->belongsToMany(Advertisement::class);
    }

    /**
     * All departments, ordered by name, cached forever. Invalidated by
     * flushCache() on department create/delete. See PLAN.md Phase 8.
     *
     * @return Collection<int, self>
     */
    public static function allCached()
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::orderBy('name')->get());
    }

    /**
     * Resolve a department's id from its free-text name, via the cached
     * list — used to keep the new department_id FK columns in sync with
     * the legacy string columns during the Phase 8 cutover.
     */
    public static function idForName(?string $name): ?int
    {
        if ($name === null) {
            return null;
        }

        return static::allCached()->firstWhere('name', $name)?->id;
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
