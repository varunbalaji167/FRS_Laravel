<?php

namespace App\Models;

use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    /** @use HasFactory<JobApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'advertisement_id',
        'department_id',
        'grade',
        'form_data',
        'sop',
        'research_interest',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'form_data' => 'array',
        'submitted_at' => 'datetime',
    ];

    // The string department column is gone; every serialization exposes the
    // resolved name so the applications lists and dossier can display it.
    // Callers that render these should eager-load `department` to avoid N+1.
    protected $appends = ['department_name'];

    // Keep the eager-loaded relation object out of the JSON payload — the
    // frontend reads only the flat `department_name`, so `department_name`
    // stays the single department field consumers see.
    protected $hidden = ['department'];

    /**
     * Get the user that owns the application.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the advertisement that this application is for.
     *
     * @return BelongsTo<Advertisement, $this>
     */
    public function advertisement(): BelongsTo
    {
        return $this->belongsTo(Advertisement::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function getDepartmentNameAttribute(): ?string
    {
        // loadMissing (an explicit load) rather than $this->department, so
        // serializing a model whose caller didn't eager-load the relation
        // resolves the name instead of tripping lazy-loading prevention.
        // Where callers do eager-load department, this is a no-op.
        return $this->loadMissing('department')->getRelation('department')?->name;
    }
}
