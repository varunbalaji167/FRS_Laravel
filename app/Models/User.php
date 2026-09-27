<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Implements MustVerifyEmail explicitly — the base Authenticatable class
 * already mixes in the trait (hasVerifiedEmail()/markEmailAsVerified()) but
 * without the interface the `verified` middleware guarding the apply
 * wizard (see routes/web.php) silently treats every user as verified,
 * since EnsureEmailIsVerified only enforces the check on instances of this
 * contract. Caught by PHPStan level 5 while typing VerifyEmailController.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
        'department_id',
        'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return HasOne<ApplicantProfile, $this>
     */
    public function applicantProfile(): HasOne
    {
        return $this->hasOne(ApplicantProfile::class);
    }

    /**
     * The department this user (typically an HOD) belongs to, via the
     * Phase 8 FK cutover. Named departmentModel() to avoid colliding with
     * the legacy `department` string attribute. See config/features.php.
     *
     * @return BelongsTo<Department, $this>
     */
    public function departmentModel(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
