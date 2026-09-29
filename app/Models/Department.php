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
     * Cached forever; invalidated by flushCache() on department CRUD.
     *
     * @return Collection<int, self>
     */
    public static function allCached()
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::orderBy('name')->get());
    }

    /**
     * Resolves a department name to its id. Case-insensitive to align with
     * Rule::exists's default collation-driven matching.
     */
    public static function idForName(?string $name): ?int
    {
        if ($name === null) {
            return null;
        }

        return static::whereRaw('LOWER(name) = ?', [strtolower($name)])->first()?->id;
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
