#!/bin/bash
#
# IIT Indore FRS — deploy script.
#
# Usage:
#   ./deploy.sh              deploy the latest commit on origin/main
#   ./deploy.sh v1.2.3       deploy that tag
#   ./deploy.sh --rollback   restore the previous release's symlinks + commit
#
# See docs/backups.md for the rest of the deploy-safety story.

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
cd "$APP_DIR"

HEALTH_URL="${HEALTH_URL:-https://testfrs.iiti.ac.in/up}"
HEALTH_CACERT="${HEALTH_CACERT:-}"
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

# No arg → deploy the latest commit on origin/main. Any other arg is
# treated as a tag to check out.
TARGET="${1:-main}"

PREV_TAG="$(current_tag)"
PREV_BUILD=""
if [ -L "$BUILD_LINK" ]; then
    PREV_BUILD="$(readlink "$BUILD_LINK")"
fi
save_state "$PREV_TAG" "$PREV_BUILD"

# ── Fetch first so we know what we're building ──────────────────────────
git fetch --tags --prune origin

if [ "$TARGET" = "main" ]; then
    echo "Deploying latest origin/main ..."
    git checkout main
    git reset --hard origin/main
    DEPLOY_REF="main@$(git rev-parse --short HEAD)"
else
    echo "Deploying tag ${TARGET} ..."
    git checkout "tags/${TARGET}"
    DEPLOY_REF="$TARGET"
fi

# ── Build assets BEFORE any maintenance window ──────────────────────────
# The site stays fully up through composer/npm install + build; the
# maintenance window below is just the migration + symlink swap.
composer install --optimize-autoloader --no-dev --no-interaction

echo "Building assets for ${DEPLOY_REF} into ${BUILD_LINK}.next ..."
npm ci
npm run build -- --outDir "${BUILD_LINK}.next" --emptyOutDir

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
CURL_TLS_OPTS=(-k)
if [ -n "$HEALTH_CACERT" ]; then
    CURL_TLS_OPTS=(--cacert "$HEALTH_CACERT")
fi

if curl -fsS --max-time 10 "${CURL_TLS_OPTS[@]}" "$HEALTH_URL" > /dev/null; then
    echo "Deployment of ${DEPLOY_REF} finished successfully."
else
    echo "Health check FAILED — rolling back to ${PREV_TAG}." >&2
    rollback
    exit 1
fi
