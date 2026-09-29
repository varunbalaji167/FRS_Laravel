# IIT Indore Faculty Recruitment System — Operations Runbook

## Quick Reference

| **Item** | **Value** |
| :--- | :--- |
| **Domain** | `https://testfrs.iiti.ac.in` |
| **SSH User** | `iiti-testfrs` |
| **App Directory** | `/home/iiti-testfrs/htdocs/testfrs.iiti.ac.in` |
| **Log Location** | `storage/logs/laravel.log` |
| **PHP Version** | `8.4.10` |
| **Framework** | Laravel 12.54.1 + React (Inertia.js) |
| **Environment** | `production` |
| **Debug Mode** | OFF |
| **Timezone** | UTC |
| **Locale** | en |

---

## Current Production Details

* **Composer Version:** `2.8.10`
* **Optimization:** Config, Events, Routes, and Views are fully **CACHED**.
* **Active Drivers:**
  * **Cache, Session, & Queue:** `redis`
  * **Database:** `mysql`
  * **Logs:** `daily`
  * **Mail:** `smtp`

---

## Application Environment Details

Run the following command to verify runtime configuration:

```bash
php artisan about
```

---

## Credentials Location

- All credentials are stored in `.env`
- **NEVER** commit `.env` to Git

---

## Common Operations

### First-Time Production Database Setup

**Destructive — deletes every existing row.** Run this exactly once, right
after the first `php artisan migrate --force` on a brand-new deployment (or
to hard-reset a broken environment back to a known-empty state). It leaves
only the department list and one fresh admin account; everything else
(advertisements, HODs, applicants, applications) is created afterwards
through the app itself.

```bash
php artisan app:init-production
```

- Prompts for confirmation before wiping (skip with `--force` in a
  non-interactive shell — make sure you mean it).
- Admin email defaults to `PROD_ADMIN_EMAIL` in `.env` (see
  `.env.production.example`), or pass `--admin-email=...`.
- Admin password comes from `PROD_ADMIN_PASSWORD` in `.env` if set, or
  `--admin-password=...`; leave both unset and the command generates a
  random one and prints it once — save it immediately, it is not stored
  anywhere in plaintext.

### Deploy a Code Update

**Run deploy script (Recommended)**

```bash
cd /home/iiti-testfrs/htdocs/testfrs.iiti.ac.in

./deploy.sh
```

**Manual Deployment**

```bash

cd /home/iiti-testfrs/htdocs/testfrs.iiti.ac.in

# Put app in maintenance mode
php artisan down

# Pull latest changes
git pull origin main

# Install/update backend dependencies
composer install --optimize-autoloader --no-dev

# Clean install frontend dependencies
rm -rf node_modules
npm install
npm run build

# Run database migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan optimize:clear
php artisan optimize

# Restart queue workers (IMPORTANT for Redis)
php artisan queue:restart

# Bring app back up
php artisan up
```

---

## Check Application Logs

```bash
tail -f storage/logs/laravel.log
```

---

## Restart Services

*(If app is down)*

```bash
sudo systemctl restart php8.4-fpm
sudo systemctl reload nginx
```

---

## Queue Management

**Check failed jobs**

```bash
php artisan queue:failed
```

**Retry failed jobs**

```bash
php artisan queue:retry all
```

---

## Reset Admin Password

```bash
php artisan tinker

$user = App\Models\User::where('email', 'admin@iiti.ac.in')->first();
$user->password = Hash::make('new_password_here');
$user->save();
```

---

## Architecture Overview

- **Framework:** Laravel 12 + Inertia.js (React frontend)
- **Database:** MySQL (CloudPanel managed)
- **Cache & Queue:** Redis
- **Session Driver:** Redis
- **File Storage:** Local (`storage/app/public`)
- **Authentication:** Email/password + Google OAuth (Socialite)
- **PDF Generation:** DomPDF
- **Email:** SMTP

---

## Notes & Best Practices

- Always run `php artisan optimize` after deployment
- Always restart queue workers after code updates
- Ensure Redis service is running for queues and sessions
- Monitor logs regularly for production issues
- Use `php artisan about` to quickly verify environment consistency

---


## Ownership & Escalation

- **Application owner:** CITC — Maintenance & Operations Team, IIT Indore.
- **Original development team:** Marneni Varun Balaji (cse230001052@iiti.ac.in), Tanishq Godha (cse230001074@iiti.ac.in), Vasav Jain (cse230001081@iiti.ac.in).
- **Escalation path:**
  1. On-call engineer (CITC internal roster).
  2. CITC Maintenance & Operations Team lead.
  3. Original development team, for architectural questions on legacy behaviour.