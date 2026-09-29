<?php

namespace App\Support;

/**
 * Canonical codes for the JSON error contract. Every new case needs a row
 * in docs/errors.md and a test that triggers it.
 */
enum ErrorCode: string
{
    case VALIDATION_FAILED = 'VALIDATION_FAILED';
    case AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS';
    case AUTH_UNVERIFIED_EMAIL = 'AUTH_UNVERIFIED_EMAIL';
    case AUTH_DOMAIN_NOT_ALLOWED = 'AUTH_DOMAIN_NOT_ALLOWED';
    case AUTH_ROLE_MISMATCH = 'AUTH_ROLE_MISMATCH';
    case AUTH_RATE_LIMITED = 'AUTH_RATE_LIMITED';
    case OAUTH_STATE_INVALID = 'OAUTH_STATE_INVALID';
    case OAUTH_ACCOUNT_LINK_REQUIRED = 'OAUTH_ACCOUNT_LINK_REQUIRED';
    case OAUTH_HD_MISMATCH = 'OAUTH_HD_MISMATCH';
    case APP_ALREADY_SUBMITTED = 'APP_ALREADY_SUBMITTED';
    case APP_DRAFT_CONFLICT = 'APP_DRAFT_CONFLICT';
    case APP_AD_DEADLINE_PASSED = 'APP_AD_DEADLINE_PASSED';
    case APP_STEP_INVALID = 'APP_STEP_INVALID';
    case FILE_MIME_REJECTED = 'FILE_MIME_REJECTED';
    case FILE_TOO_LARGE = 'FILE_TOO_LARGE';
    case FILE_KEY_NOT_ALLOWED = 'FILE_KEY_NOT_ALLOWED';
    case HOD_DEPT_SCOPE_VIOLATION = 'HOD_DEPT_SCOPE_VIOLATION';
    case ADMIN_SELF_DEMOTE_FORBIDDEN = 'ADMIN_SELF_DEMOTE_FORBIDDEN';
    case USER_LAST_ADMIN = 'USER_LAST_ADMIN';
    case RATE_LIMITED = 'RATE_LIMITED';
    case NOT_FOUND = 'NOT_FOUND';
    case FORBIDDEN = 'FORBIDDEN';
    case INTERNAL_ERROR = 'INTERNAL_ERROR';

    public function httpStatus(): int
    {
        return match ($this) {
            self::VALIDATION_FAILED, self::APP_AD_DEADLINE_PASSED,
            self::APP_STEP_INVALID, self::FILE_MIME_REJECTED, self::FILE_KEY_NOT_ALLOWED => 422,
            self::AUTH_INVALID_CREDENTIALS => 401,
            self::AUTH_UNVERIFIED_EMAIL, self::AUTH_DOMAIN_NOT_ALLOWED, self::AUTH_ROLE_MISMATCH,
            self::OAUTH_HD_MISMATCH, self::HOD_DEPT_SCOPE_VIOLATION,
            self::ADMIN_SELF_DEMOTE_FORBIDDEN, self::FORBIDDEN => 403,
            self::AUTH_RATE_LIMITED, self::RATE_LIMITED => 429,
            self::OAUTH_STATE_INVALID => 400,
            self::OAUTH_ACCOUNT_LINK_REQUIRED, self::APP_ALREADY_SUBMITTED,
            self::APP_DRAFT_CONFLICT, self::USER_LAST_ADMIN => 409,
            self::FILE_TOO_LARGE => 413,
            self::NOT_FOUND => 404,
            self::INTERNAL_ERROR => 500,
        };
    }

    public function userMessage(): string
    {
        return match ($this) {
            self::VALIDATION_FAILED => 'Please fix the highlighted fields and try again.',
            self::AUTH_INVALID_CREDENTIALS => 'Incorrect email or password.',
            self::AUTH_UNVERIFIED_EMAIL => 'Please verify your email address to continue.',
            self::AUTH_DOMAIN_NOT_ALLOWED => 'This portal requires an iiti.ac.in email address.',
            self::AUTH_ROLE_MISMATCH => 'Your account role does not match this portal.',
            self::AUTH_RATE_LIMITED, self::RATE_LIMITED => 'Too many attempts. Please try again later.',
            self::OAUTH_STATE_INVALID => 'Your sign-in session expired. Please try again.',
            self::OAUTH_ACCOUNT_LINK_REQUIRED => 'An account with this email already exists. Please link it first.',
            self::OAUTH_HD_MISMATCH => 'Please sign in with your iiti.ac.in Google account.',
            self::APP_ALREADY_SUBMITTED => 'This application has already been submitted.',
            self::APP_DRAFT_CONFLICT => 'This draft can no longer be edited.',
            self::APP_AD_DEADLINE_PASSED => 'The deadline for this advertisement has passed.',
            self::APP_STEP_INVALID => 'Please fix the highlighted fields on this step.',
            self::FILE_MIME_REJECTED => 'That file type is not accepted.',
            self::FILE_TOO_LARGE => 'That file is too large.',
            self::FILE_KEY_NOT_ALLOWED => 'That upload slot is not recognised.',
            self::HOD_DEPT_SCOPE_VIOLATION => 'You do not have access to this department.',
            self::ADMIN_SELF_DEMOTE_FORBIDDEN => 'You cannot change your own admin role.',
            self::USER_LAST_ADMIN => 'At least one admin account must remain.',
            self::NOT_FOUND => 'The requested resource was not found.',
            self::FORBIDDEN => 'You are not authorised to perform this action.',
            self::INTERNAL_ERROR => 'Something went wrong. Please try again.',
        };
    }
}
