#!/usr/bin/env bash
# Pinpoint relay — one-shot Linux deployment for location.beertengangs.com
#
# Usage (as root on a fresh Debian/Ubuntu box pointing the DNS A record
#        for location.beertengangs.com at this host):
#
#   sudo ./deploy.sh                       # full install + nginx + TLS
#   sudo ./deploy.sh --no-tls              # install without certbot
#   sudo MODE=dev ./deploy.sh              # just run "node src/server.js" in the foreground
#
set -euo pipefail

DOMAIN="${DOMAIN:-location.beertengangs.com}"
APP_USER="${APP_USER:-pinpoint}"
APP_DIR="${APP_DIR:-/opt/pinpoint}"
DATA_DIR="${DATA_DIR:-/var/lib/pinpoint}"
PORT="${PORT:-8080}"
MODE="${MODE:-prod}"
NO_TLS=0
for a in "$@"; do [[ "$a" == "--no-tls" ]] && NO_TLS=1; done

log() { printf '\033[1;36m▸ %s\033[0m\n' "$*"; }

# --- dev mode: just run locally ---------------------------------------------
if [[ "$MODE" == "dev" ]]; then
    log "Dev mode — installing deps and running in the foreground."
    command -v node >/dev/null || { echo "Install Node.js 18+ first."; exit 1; }
    cd "$(dirname "$0")"
    npm install --omit=dev
    PORT="$PORT" HOST=0.0.0.0 PUBLIC_BASE="${PUBLIC_BASE:-http://localhost:$PORT}" \
        PINPOINT_DATA_DIR="${PINPOINT_DATA_DIR:-$(pwd)/data}" \
        node src/server.js
    exit 0
fi

# --- prod mode --------------------------------------------------------------
if [[ $EUID -ne 0 ]]; then echo "Run as root (sudo)."; exit 1; fi

log "Installing system packages…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg nginx build-essential python3

if ! command -v node >/dev/null || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]]; then
    log "Installing Node.js 20.x from NodeSource…"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"

log "Syncing app to $APP_DIR…"
mkdir -p "$APP_DIR" "$DATA_DIR"
rsync -a --delete --exclude node_modules --exclude data "$(dirname "$0")"/ "$APP_DIR"/
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"

log "Installing npm dependencies…"
( cd "$APP_DIR" && npm install --omit=dev --no-audit --no-fund )
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

log "Writing /opt/pinpoint/.env…"
cat >"$APP_DIR/.env" <<EOF
PORT=$PORT
HOST=127.0.0.1
PUBLIC_BASE=https://$DOMAIN
PINPOINT_DATA_DIR=$DATA_DIR
EOF
chmod 600 "$APP_DIR/.env"
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"

log "Installing systemd unit…"
install -m 0644 "$APP_DIR/scripts/pinpoint.service" /etc/systemd/system/pinpoint.service
systemctl daemon-reload
systemctl enable --now pinpoint.service

log "Configuring nginx for $DOMAIN…"
SITE_AVAIL=/etc/nginx/sites-available/$DOMAIN
SITE_ENABL=/etc/nginx/sites-enabled/$DOMAIN
sed "s/location.beertengangs.com/$DOMAIN/g" "$APP_DIR/scripts/nginx.conf" >"$SITE_AVAIL"
ln -sf "$SITE_AVAIL" "$SITE_ENABL"
nginx -t
systemctl reload nginx

if [[ $NO_TLS -eq 0 ]]; then
    log "Obtaining TLS cert with certbot…"
    apt-get install -y certbot python3-certbot-nginx
    certbot --nginx -d "$DOMAIN" --redirect --non-interactive --agree-tos \
        -m "admin@${DOMAIN#*.}" || log "certbot failed — site is still on plain HTTP."
fi

log "Done. Health check:"
curl -fsS "http://127.0.0.1:$PORT/health" && echo
log "API base: https://$DOMAIN/"
log "Logs: journalctl -u pinpoint -f"
log "Data: $DATA_DIR (sqlite + uploads + ndjson location log)"
