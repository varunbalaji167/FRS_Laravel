<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function application()
    {
        return $this->belongsTo(JobApplication::class, 'application_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
