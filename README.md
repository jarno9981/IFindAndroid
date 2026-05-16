# Pinpoint — cross‑platform live‑location app

A .NET MAUI app for Android and iOS that shares live location with trusted people, with a
Material‑You expressive dark UI matching the `*.jsx` / `tokens.css` design files at the repo root.

## What's inside

```
Pinpoint.sln                       Visual Studio solution (Windows‑friendly)
src/Pinpoint/                      Single MAUI project, multi‑targets net10.0-android & net10.0-ios
  MauiProgram.cs                   DI registration
  App.xaml(.cs)                    App root, dark theme forced
  Views/                           ShellPage (tab bar), Map, Devices, People, Alerts
  ViewModels/                      MVVM (CommunityToolkit.Mvvm)
  Models/                          Person, TrackedDevice, AlertItem, LocationUpdate
  Services/                        ILocationService, ISharingService, IBackgroundLocationService
  Controls/AvatarView.cs           Circular tinted avatar used in the design
  Converters/                      Bool→share text/color, battery→color
  Resources/Styles/Colors.xaml     Direct port of tokens.css (Surface0…5, Primary, Map*, etc.)
  Resources/Styles/Styles.xaml     Card / Pill / GhostButton / labels
  Platforms/Android/               Foreground location service + manifest permissions
  Platforms/iOS/                   CLLocationManager always‑authorisation, Info.plist background modes
  Platforms/Windows/               Optional Windows head (only compiles on Windows)
```

## Build on Windows

1. Install Visual Studio 2022 17.8+ with the **.NET Multi‑platform App UI development** workload
   (includes Android SDK + iOS remote build tooling).
2. Open `Pinpoint.sln`.
3. To deploy to **Android**: pick the `net10.0-android` target framework, plug in a phone with
   USB debugging or start an emulator, press F5.
4. To deploy to **iPhone** from Windows: pair Visual Studio with a Mac via **Pair to Mac**
   (Tools → iOS → Pair to Mac). Then pick the `net10.0-ios` target framework. Signing/provisioning
   must be set up under the project's iOS bundle properties on the Mac.

Command‑line builds:

```pwsh
dotnet workload install maui
dotnet build  Pinpoint.sln -f net10.0-android -c Release
dotnet build  Pinpoint.sln -f net10.0-ios     -c Release   # requires paired Mac
```

## Background location

* **Android** — A foreground service (`Platforms/Android/LocationForegroundService.cs`) is started
  with `foregroundServiceType=location` and posts an ongoing notification so the OS lets us
  keep receiving GPS while the app is in the background. Permissions in `AndroidManifest.xml`:
  `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE_LOCATION`,
  `POST_NOTIFICATIONS`, `WAKE_LOCK`.
* **iOS** — `CLLocationManager` with `AllowsBackgroundLocationUpdates = true` plus
  `UIBackgroundModes = location` and significant‑change monitoring in `Info.plist`. Always‑on
  authorisation is requested up‑front so the OS continues to deliver updates when suspended.

Both implementations push updates into `ISharingService.PushLocation`, which the Map/People
view models observe.

## Relay server (`server/`)

`server/` contains the Linux backend that runs at **`location.beertengangs.com`**.
Node.js 18+, SQLite (better-sqlite3), JWT auth, multipart image uploads, and an
NDJSON audit log of every accepted location ping.

```bash
# Local dev (foreground):
cd server && MODE=dev ./deploy.sh

# Production on Debian/Ubuntu (root):
sudo ./deploy.sh                       # nginx + systemd + Let's Encrypt
sudo DOMAIN=loc.example.com ./deploy.sh
sudo ./deploy.sh --no-tls              # skip certbot
```

See `server/README.md` for the full API surface and operational notes. The MAUI
app talks to `https://location.beertengangs.com` by default
(`ApiClient.DefaultBaseUrl`). First launch shows **Sign in / Create account**
before opening the map.

## Design parity

`Resources/Styles/Colors.xaml` mirrors every token in the repo's `tokens.css`
(`--surface-0…5`, `--primary`, `--map-*`, etc.). The four tabs match the layout in
`screens (2).jsx` / `sheets.jsx`.
