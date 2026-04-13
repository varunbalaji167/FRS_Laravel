#!/bin/bash

# IIT Indore FRS — Automated Backup Script
# Run daily via cron

# ── CONFIGURATION 
APP_DIR="/home/iiti-testfrs/htdocs/testfrs.iiti.ac.in"
BACKUP_DIR="/home/iiti-testfrs/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=30           # Keep backups for 30 days

# Database credentials (read from .env automatically)
DB_NAME=$(grep '^DB_DATABASE=' "$APP_DIR/.env" | cut -d '=' -f2)
DB_USER=$(grep '^DB_USERNAME=' "$APP_DIR/.env" | cut -d '=' -f2)
DB_PASS=$(grep '^DB_PASSWORD=' "$APP_DIR/.env" | cut -d '=' -f2)
DB_HOST=$(grep '^DB_HOST=' "$APP_DIR/.env" | cut -d '=' -f2 | tr -d '"')

# ── SETUP 
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/files"
mkdir -p "$BACKUP_DIR/logs"

echo "[$DATE] Starting backup..." >> "$BACKUP_DIR/logs/backup.log"

# ── DATABASE BACKUP
echo "Backing up database..."
mysqldump \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    -p"$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" | gzip > "$BACKUP_DIR/database/db_${DB_NAME}_${DATE}.sql.gz"

if [ $? -eq 0 ]; then
    echo "[$DATE] Database backup successful." >> "$BACKUP_DIR/logs/backup.log"
else
    echo "[$DATE] ERROR: Database backup FAILED!" >> "$BACKUP_DIR/logs/backup.log"
fi

# ── UPLOADED FILES BACKUP ──
# This backs up all user-uploaded documents, certificates, photos
echo "Backing up uploaded files..."
tar -czf "$BACKUP_DIR/files/uploads_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    storage/app/public/ \
    --exclude="*.log"

if [ $? -eq 0 ]; then
    echo "[$DATE] File backup successful." >> "$BACKUP_DIR/logs/backup.log"
else
    echo "[$DATE] ERROR: File backup FAILED!" >> "$BACKUP_DIR/logs/backup.log"
fi

# ── SOURCE CODE BACKUP (Weekly) ────
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    echo "Taking weekly source code backup..."
    tar -czf "$BACKUP_DIR/files/sourcecode_${DATE}.tar.gz" \
        -C "/home/iiti-testfrs/htdocs" \
        testfrs.iiti.ac.in/ \
        --exclude=".git" \
        --exclude="node_modules" \
        --exclude="vendor" \
        --exclude="storage/logs/*"
    echo "[$DATE] Source code backup done." >> "$BACKUP_DIR/logs/backup.log"
fi

# ── CLEANUP OLD BACKUPS ────
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR/database" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/files" -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "[$DATE] Backup complete." >> "$BACKUP_DIR/logs/backup.log"
echo "---" >> "$BACKUP_DIR/logs/backup.log"