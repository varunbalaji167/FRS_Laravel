# Backup policy

Right-sized for hundreds-to-low-thousands applicants/year. Owner: the
on-call student for the current term (name kept in the CloudPanel server
notes, not here — this doc must stay accurate without an edit every
semester).

## What's backed up, how often, how long kept

| Cadence | What | Kept on-box | Kept off-site |
|---|---|---|---|
| Daily | Encrypted MySQL dump (`mysqldump` → gzip → gpg) | 14 days | 90 days |
| Weekly | Full `storage/app/local` tarball (dossier files, generated PDFs) | 4 weeks | 8 weeks |
| Monthly | Cold copy of the daily DB dump + weekly file tarball, untouched | — | 12 months |
| Quarterly | Automated restore drill against a staging DB | n/a | n/a — result posted to Slack |

Off-site target is whatever `rclone` remote is configured in
`~/.config/rclone/rclone.conf` on the app server (S3 bucket or an
IIT-owned NAS share both work — `rclone` abstracts the difference).
`backup.sh` doesn't care which; it just runs `rclone copy`.

## Where things live

- Script: [backup.sh](../backup.sh), run via cron (daily, e.g. `0 2 * * *`).
- On-box artefacts: `$BACKUP_DIR` (default `/home/iiti-testfrs/backups`),
  split into `database/`, `files/`, `logs/`.
- DB credentials: `~/.my.cnf` on the app server (not the app's `.env`),
  so backups keep working even if the app's DB user is rotated
  independently, and so the dump command's credentials never show up in
  `ps`/shell history.
- Encryption key: a GPG public key for the on-call student's key (or a
  shared ops key), imported on the app server. `backup.sh` encrypts with
  `gpg --encrypt -r "$GPG_RECIPIENT"`. **Losing the matching private key
  makes existing backups unrecoverable** — the private key itself lives
  in the department's password manager, not on the app server.
- Off-site copy: `rclone copy` to the configured remote, run after the
  local artefact is written and verified non-empty.

## Restore drill (quarterly)

Manual for now — a human runs this against a staging box, not the
production server:

1. Pick the most recent daily dump from the off-site remote.
2. `gpg --decrypt | gunzip | mysql` into a scratch database on staging.
3. Compare row counts per table against production
   (`SELECT COUNT(*) FROM job_applications`, etc.) — alert if any table
   differs by more than 1%.
4. Spot-check one recent `job_applications` row's `form_data` renders
   correctly in the staging app.
5. Post the result (pass/fail + row-count deltas) to the ops Slack
   channel. A failed drill is a P1 — fix before the next daily backup
   runs unattended.

The restore drill is a manual runbook today. Automate it as a
`RestoreDrillCommand` (or CI job) once the cadence exceeds one drill per
quarter.

## Failure handling

- Every stage's exit code is checked; the whole script runs under
  `set -euo pipefail` so a failed `mysqldump` (broken pipe included, via
  `PIPESTATUS`) stops the script rather than silently producing a
  truncated dump.
- `flock -n /tmp/frs-backup.lock` — a cron overlap (previous run still
  going) exits immediately instead of running two dumps concurrently
  against the same files.
- A free-space precheck refuses to start the DB dump if `$BACKUP_DIR`'s
  filesystem has less headroom than the last dump's size — prevents a
  silent half-written backup.
- Any nonzero exit triggers `mail -s "FRS backup FAILED" root` (or
  whatever `$ALERT_EMAIL` is set to) so a failure gets noticed same-day,
  not at the next quarterly drill.

## Deploy safety

See [deploy.sh](../deploy.sh):

- Assets are built into `public/build.next` *before* the app is put into
  maintenance mode, then the `public/build` symlink is swapped — the
  maintenance window is just the migration + symlink swap, not the
  `npm run build`.
- Deploys check out a tag (`./deploy.sh v1.2.3`), never `pull origin
  main` — a deploy is always a specific, reviewed commit.
- `trap 'php artisan up || true' EXIT` guarantees the site leaves
  maintenance mode even if a later step fails.
- Post-deploy health check (`curl -f https://testfrs.iiti.ac.in/up`)
  triggers an automatic rollback to the previous tag + symlinks if it
  fails, so a bad deploy doesn't leave the site down.
- `./deploy.sh --rollback` restores the previous release's symlinks and
  checks out the previous tag on demand.

**Verification:** `./backup.sh` on staging produces an encrypted artefact
in the configured `rclone` remote; killing `./deploy.sh v1.2.3` midway
(e.g. `kill -9` during `migrate`) leaves the site reachable (old release
still live) rather than stuck in maintenance mode.
