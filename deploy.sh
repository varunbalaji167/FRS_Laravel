#!/bin/bash
#
# IIT Indore FRS — deploy script.
#
# Usage:
#   ./deploy.sh v1.2.3       deploy that tag
#   ./deploy.sh --rollback   restore the previous release's symlinks + commit
#
# See docs/backups.md for the rest of the deploy-safety story.

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
cd "$APP_DIR"

HEALTH_URL="${HEALTH_URL:-https://testfrs.iiti.ac.in/up}"
BUILD_LINK="public/build"
STATE_FILE=".deploy-state"

# Always try to bring the app back up, whatever happens after this point.
trap 'php artisan up || true' EXIT

save_state() {
    local prev_tag="$1"
    local prev_build="$2"
    printf 'PREV_TAG=%s\nPREV_BUILD=%s\n' "$prev_tag" "$prev_build" > "$STATE_FILE"
}

current_tag() {
    git describe --tags --exact-match 2>/dev/null || git rev-parse --short HEAD
}

rollback() {
    if [ ! -f "$STATE_FILE" ]; then
        echo "No $STATE_FILE found — nothing to roll back to." >&2
        exit 1
    fi
    # shellcheck disable=SC1090
    source "$STATE_FILE"

    echo "Rolling back to ${PREV_TAG} ..."
    php artisan down || true

    git fetch --tags
    git checkout "$PREV_TAG"

    if [ -n "${PREV_BUILD:-}" ] && [ -e "$PREV_BUILD" ]; then
        ln -sfn "$PREV_BUILD" "$BUILD_LINK"
    fi

    composer install --optimize-autoloader --no-dev
    php artisan optimize:clear
    php artisan optimize
    php artisan queue:restart

    php artisan up
    echo "Rollback to ${PREV_TAG} complete."
}

if [ "${1:-}" = "--rollback" ]; then
    rollback
    exit 0
fi

TAG="${1:?Usage: ./deploy.sh <tag> | ./deploy.sh --rollback}"

# ── Build assets BEFORE any maintenance window ──────────────────────────
# The site stays fully up through npm ci/build; the maintenance window
# below is just the migration + symlink swap.
echo "Building assets for ${TAG} into ${BUILD_LINK}.next ..."
npm ci
npm run build -- --outDir "${BUILD_LINK}.next" --emptyOutDir

PREV_TAG="$(current_tag)"
PREV_BUILD=""
if [ -L "$BUILD_LINK" ]; then
    PREV_BUILD="$(readlink "$BUILD_LINK")"
fi
save_state "$PREV_TAG" "$PREV_BUILD"

# ── Fetch the tag, don't pull main — a deploy is always a reviewed ref ──
git fetch --tags
git checkout "tags/${TAG}"

composer install --optimize-autoloader --no-dev

echo "Entering maintenance mode..."
php artisan down

php artisan migrate --force

NEW_BUILD_DIR="${BUILD_LINK}.$(date +%s)"
echo "Swapping ${BUILD_LINK} -> ${NEW_BUILD_DIR}"
mv "${BUILD_LINK}.next" "$NEW_BUILD_DIR"
ln -sfn "$NEW_BUILD_DIR" "$BUILD_LINK"

php artisan optimize:clear
php artisan optimize
php artisan queue:restart
sudo systemctl restart php-fpm 2>/dev/null || sudo service php-fpm restart 2>/dev/null || true

php artisan up

# ── Post-deploy health check, automatic rollback on failure ─────────────
echo "Health-checking ${HEALTH_URL} ..."
if curl -fsS --max-time 10 "$HEALTH_URL" > /dev/null; then
    echo "Deployment of ${TAG} finished successfully."
else
    echo "Health check FAILED — rolling back to ${PREV_TAG}." >&2
    rollback
    exit 1
fi
