#!/bin/bash
#
# IIT Indore FRS — automated backup script.
# Policy: see docs/backups.md. Run daily via cron; cadence-specific
# retention (weekly/monthly) is handled below by day-of-week/month checks.
#
# Requires on the app server:
#   - ~/.my.cnf with [client] user/password/host for mysqldump (never the
#     app's .env — see docs/backups.md)
#   - a GPG recipient key imported for $GPG_RECIPIENT
#   - an `rclone` remote named $RCLONE_REMOTE configured for the app user
#   - `mail` (mailutils/mailx) for failure alerts

set -euo pipefail

# ── CONFIGURATION ──────────────────────────────────────────────────────
APP_DIR="${APP_DIR:-/home/iiti-testfrs/htdocs/testfrs.iiti.ac.in}"
BACKUP_DIR="${BACKUP_DIR:-/home/iiti-testfrs/backups}"
GPG_RECIPIENT="${GPG_RECIPIENT:-frs-backup@iiti.ac.in}"
RCLONE_REMOTE="${RCLONE_REMOTE:-frs-offsite:frs-backups}"
ALERT_EMAIL="${ALERT_EMAIL:-root}"
LOCK_FILE="/tmp/frs-backup.lock"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
DAY_OF_WEEK=$(date +%u)   # 1=Monday .. 7=Sunday
DAY_OF_MONTH=$(date +%d)

RETENTION_DAILY_DAYS=14
RETENTION_WEEKLY_DAYS=56   # 8 weeks
RETENTION_MONTHLY_DAYS=365 # 12 months

DB_DIR="$BACKUP_DIR/database"
FILES_DIR="$BACKUP_DIR/files"
LOG_DIR="$BACKUP_DIR/logs"
LOG_FILE="$LOG_DIR/backup.log"

mkdir -p "$DB_DIR/daily" "$DB_DIR/monthly" "$FILES_DIR/weekly" "$FILES_DIR/monthly" "$LOG_DIR"

log() { echo "[$(date +%Y-%m-%d_%H-%M-%S)] $*" >> "$LOG_FILE"; }

fail() {
    log "ERROR: $*"
    mail -s "FRS backup FAILED" "$ALERT_EMAIL" <<< "$*" || true
    exit 1
}

# ── LOCK: refuse to run if a previous invocation is still going ───────
exec 200>"$LOCK_FILE"
flock -n 200 || { log "ERROR: another backup run is already in progress, exiting"; exit 1; }

trap 'log "backup run ended (exit $?)"' EXIT

log "Starting backup run"

# ── FREE-SPACE PRECHECK ─────────────────────────────────────────────────
# Refuse to start if there's less than 2x the last dump's size free —
# a half-written backup is worse than none.
AVAILABLE_KB=$(df -Pk "$BACKUP_DIR" | awk 'NR==2 {print $4}')
LAST_DUMP_KB=$(du -sk "$DB_DIR/daily" 2>/dev/null | awk '{print $1}' || echo 0)
REQUIRED_KB=$(( (LAST_DUMP_KB > 0 ? LAST_DUMP_KB : 102400) * 2 ))
if [ "$AVAILABLE_KB" -lt "$REQUIRED_KB" ]; then
    fail "insufficient disk space in $BACKUP_DIR (have ${AVAILABLE_KB}KB, need ${REQUIRED_KB}KB)"
fi

# ── DATABASE BACKUP (daily) ─────────────────────────────────────────────
log "Backing up database"
DB_NAME=$(grep '^DB_DATABASE=' "$APP_DIR/.env" | cut -d '=' -f2)
DB_DUMP="$DB_DIR/daily/db_${DB_NAME}_${DATE}.sql.gz.gpg"

mysqldump \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" \
    | gzip \
    | gpg --batch --yes --encrypt -r "$GPG_RECIPIENT" --output "$DB_DUMP"
# Check every stage of the pipe, not just gpg's exit code.
for status in "${PIPESTATUS[@]}"; do
    if [ "$status" -ne 0 ]; then
        fail "database backup pipeline failed (mysqldump|gzip|gpg exit codes: ${PIPESTATUS[*]})"
    fi
done
log "Database backup OK: $DB_DUMP"

# Monthly cold copy of the dump, untouched, on the 1st of the month.
if [ "$DAY_OF_MONTH" = "01" ]; then
    cp "$DB_DUMP" "$DB_DIR/monthly/"
    log "Monthly database cold copy taken"
fi

# ── UPLOADED FILES BACKUP (weekly, Sundays) ─────────────────────────────
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    log "Backing up storage/app/local (weekly)"
    FILES_TARBALL="$FILES_DIR/weekly/local_${DATE}.tar.gz"
    tar -czf "$FILES_TARBALL" -C "$APP_DIR" storage/app/local \
        || fail "weekly file tarball failed"
    log "File backup OK: $FILES_TARBALL"

    if [ "$DAY_OF_MONTH" -le 07 ]; then
        cp "$FILES_TARBALL" "$FILES_DIR/monthly/"
        log "Monthly file cold copy taken"
    fi
fi

# ── OFF-SITE COPY ────────────────────────────────────────────────────────
log "Copying to off-site remote ($RCLONE_REMOTE)"
rclone copy "$BACKUP_DIR" "$RCLONE_REMOTE" --exclude "logs/**" \
    || fail "rclone offsite copy failed"
log "Off-site copy OK"

# ── RETENTION ────────────────────────────────────────────────────────────
log "Applying retention: daily=${RETENTION_DAILY_DAYS}d weekly=${RETENTION_WEEKLY_DAYS}d monthly=${RETENTION_MONTHLY_DAYS}d"
find "$DB_DIR/daily" -name "*.gpg" -mtime "+$RETENTION_DAILY_DAYS" -delete
find "$FILES_DIR/weekly" -name "*.tar.gz" -mtime "+$RETENTION_WEEKLY_DAYS" -delete
find "$DB_DIR/monthly" -name "*.gpg" -mtime "+$RETENTION_MONTHLY_DAYS" -delete
find "$FILES_DIR/monthly" -name "*.tar.gz" -mtime "+$RETENTION_MONTHLY_DAYS" -delete

log "Backup run complete"
