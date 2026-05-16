# Pinpoint relay (location.beertengangs.com)

Single-host Node.js + SQLite backend that:

* signs users up and in (bcrypt + JWT, 180-day tokens),
* stores profile pictures and user-uploaded pictures on disk,
* ingests live location updates from the mobile app, persists them to SQLite,
  and appends an `ndjson` audit log (`data/logs/locations.ndjson`),
* exposes a small REST surface the MAUI app talks to.

## Quick start (dev / local)

```bash
cd server
MODE=dev ./deploy.sh
```

That installs deps and starts `node src/server.js` on `:8080` with data under
`./data`. Hit `http://localhost:8080/health`.

## One-shot production deploy

On a fresh Debian/Ubuntu box whose DNS `A` record for
`location.beertengangs.com` already points at it:

```bash
sudo ./deploy.sh
```

The script installs Node 20.x, an unprivileged `pinpoint` user, nginx, a
systemd unit, then obtains a Let's Encrypt certificate via certbot. Override
the domain or skip TLS:

```bash
sudo DOMAIN=loc.example.com ./deploy.sh
sudo ./deploy.sh --no-tls
```

Operational commands:

```bash
systemctl status pinpoint
journalctl -u pinpoint -f
ls /var/lib/pinpoint              # sqlite, uploads, logs
```

## API

| Method | Path                       | Auth | Purpose                                |
|--------|----------------------------|------|----------------------------------------|
| POST   | `/api/auth/signup`         | —    | `{ email, password, name }` → `{ token, user }` |
| POST   | `/api/auth/signin`         | —    | `{ email, password }` → `{ token, user }`       |
| GET    | `/api/me`                  | ✓    | current user                            |
| POST   | `/api/me/profile-image`    | ✓    | multipart `image` → `{ url }`           |
| POST   | `/api/pictures`            | ✓    | multipart `image` (+ optional `caption`, `lat`, `lng`) |
| GET    | `/api/pictures`            | ✓    | recent pictures                         |
| POST   | `/api/location`            | ✓    | `{ lat, lng, accuracy?, ts? }`          |
| GET    | `/api/location/me`         | ✓    | recent location history                 |
| GET    | `/api/people`              | ✓    | friends + their last known position     |
| POST   | `/api/people/add`          | ✓    | `{ email }`                             |
| GET    | `/health`                  | —    | liveness                                |

All authenticated calls expect `Authorization: Bearer <token>`.

## Data layout

```
/var/lib/pinpoint/
  pinpoint.db                 sqlite (users, locations, pictures, friendships)
  uploads/                    profile + picture image files
  logs/
    access.log                nginx-style request log
    locations.ndjson          one JSON object per accepted location ping
  jwt.secret                  generated on first run
```
