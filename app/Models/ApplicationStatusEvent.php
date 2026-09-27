<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStatusEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'actor_id',
        'from',
        'to',
        'at',
        'note',
    ];

    protected $casts = [
        'at' => 'datetime',
    ];

    /**
     * @return BelongsTo<JobApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'application_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
