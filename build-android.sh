#!/usr/bin/env bash
# build-android.sh — install prerequisites and build the Pinpoint Android APK
# on a fresh Linux VPS (Debian / Ubuntu).
#
#   ./build-android.sh                 # Debug APK (no signing)
#   ./build-android.sh release         # Release, unsigned
#   CONFIG=Release ANDROID_API=35 ./build-android.sh
#
# Tested on Debian 12 / Ubuntu 22.04 / Ubuntu 24.04. Needs sudo for the
# apt/JDK install on first run; subsequent runs are non-root.

set -euo pipefail

CONFIG="${1:-${CONFIG:-Debug}}"
case "$CONFIG" in Debug|Release) ;; release) CONFIG=Release ;; debug) CONFIG=Debug ;;
    *) echo "Unknown config '$CONFIG' (Debug|Release)"; exit 1 ;; esac

DOTNET_VERSION="${DOTNET_VERSION:-10.0}"
ANDROID_API="${ANDROID_API:-35}"
ANDROID_BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-35.0.0}"
ANDROID_CMDLINE_VER="${ANDROID_CMDLINE_VER:-11076708}"     # cmdline-tools rev 11.0

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJ="$ROOT/src/Pinpoint/Pinpoint.csproj"
DOTNET_ROOT_DEFAULT="$HOME/.dotnet"
ANDROID_HOME_DEFAULT="$HOME/Android/Sdk"

log() { printf '\033[1;36m▸ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }

need_sudo() {
    if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null; then
        echo "Need root or sudo to install apt packages."; exit 1
    fi
}
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

# ---------- 1. system packages -----------------------------------------------
if ! dpkg -s openjdk-17-jdk-headless >/dev/null 2>&1 \
   || ! command -v unzip >/dev/null \
   || ! command -v curl  >/dev/null; then
    need_sudo
    log "Installing apt prerequisites…"
    export DEBIAN_FRONTEND=noninteractive
    $SUDO apt-get update -y
    $SUDO apt-get install -y --no-install-recommends \
        curl unzip ca-certificates openjdk-17-jdk-headless git
fi

# ---------- 2. .NET 10 SDK ---------------------------------------------------
export DOTNET_ROOT="${DOTNET_ROOT:-$DOTNET_ROOT_DEFAULT}"
DOTNET_BIN="$DOTNET_ROOT/dotnet"
need_dotnet=1
if command -v dotnet >/dev/null; then
    if dotnet --list-sdks | awk '{print $1}' | grep -q "^${DOTNET_VERSION//./\\.}\\."; then
        DOTNET_BIN="$(command -v dotnet)"
        need_dotnet=0
    fi
fi
if [ $need_dotnet -eq 1 ]; then
    log "Installing .NET ${DOTNET_VERSION} SDK to $DOTNET_ROOT…"
    mkdir -p "$DOTNET_ROOT"
    curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
    bash /tmp/dotnet-install.sh --channel "$DOTNET_VERSION" --install-dir "$DOTNET_ROOT"
fi
export PATH="$DOTNET_ROOT:$PATH"

# ---------- 3. Android command-line tools + SDK packages ---------------------
export ANDROID_HOME="${ANDROID_HOME:-$ANDROID_HOME_DEFAULT}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
CMDLINE_DIR="$ANDROID_HOME/cmdline-tools/latest"
SDKMANAGER="$CMDLINE_DIR/bin/sdkmanager"

# sdkmanager needs JAVA_HOME *before* we call it.
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
if [ ! -d "$JAVA_HOME" ]; then
    if command -v javac >/dev/null; then
        JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")"
    fi
fi
export PATH="$JAVA_HOME/bin:$PATH"
log "JAVA_HOME = $JAVA_HOME"

if [ ! -x "$SDKMANAGER" ]; then
    log "Installing Android command-line tools to $ANDROID_HOME…"
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    TMPZ="$(mktemp)"
    curl -fSL "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_VER}_latest.zip" -o "$TMPZ"
    rm -rf "$ANDROID_HOME/cmdline-tools/_tmp"
    unzip -q "$TMPZ" -d "$ANDROID_HOME/cmdline-tools/_tmp"
    rm -rf "$CMDLINE_DIR"
    mv "$ANDROID_HOME/cmdline-tools/_tmp/cmdline-tools" "$CMDLINE_DIR"
    rmdir "$ANDROID_HOME/cmdline-tools/_tmp" || true
    rm -f "$TMPZ"
fi

# Skip the package install entirely if everything we need is already there.
if [ -d "$ANDROID_HOME/platforms/android-${ANDROID_API}" ] \
   && [ -d "$ANDROID_HOME/build-tools/${ANDROID_BUILD_TOOLS}" ] \
   && [ -d "$ANDROID_HOME/platform-tools" ]; then
    log "Android SDK already has platforms;android-${ANDROID_API} + build-tools;${ANDROID_BUILD_TOOLS} — skipping sdkmanager."
else
    log "Accepting Android SDK licences (yes | sdkmanager --licenses)…"
    yes 2>/dev/null | "$SDKMANAGER" --sdk_root="$ANDROID_HOME" --licenses \
        | grep -E "^(Accepting|All|License)" || true

    log "Installing platforms;android-${ANDROID_API}, build-tools;${ANDROID_BUILD_TOOLS}, platform-tools (this downloads ~150 MB, please be patient)…"
    yes 2>/dev/null | "$SDKMANAGER" --sdk_root="$ANDROID_HOME" --install \
        "platform-tools" \
        "platforms;android-${ANDROID_API}" \
        "build-tools;${ANDROID_BUILD_TOOLS}"
fi

export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# ---------- 4. MAUI / Android workloads --------------------------------------
log "Ensuring MAUI + Android workloads are installed…"
"$DOTNET_BIN" workload install maui-android android \
    --skip-sign-check --skip-manifest-update || \
"$DOTNET_BIN" workload install maui-android android
"$DOTNET_BIN" workload list

# ---------- 5. build ---------------------------------------------------------
log "Restoring & building Pinpoint Android ($CONFIG)…"
"$DOTNET_BIN" restore "$PROJ"
"$DOTNET_BIN" publish "$PROJ" -f net10.0-android -c "$CONFIG" \
    /p:AndroidSdkDirectory="$ANDROID_HOME" \
    /p:JavaSdkDirectory="$JAVA_HOME"

OUT_DIR="$ROOT/src/Pinpoint/bin/$CONFIG/net10.0-android/publish"
APK="$(find "$OUT_DIR" -maxdepth 1 -name '*-Signed.apk' -o -name '*.apk' 2>/dev/null | head -n1 || true)"
[ -n "$APK" ] || APK="$(find "$ROOT/src/Pinpoint/bin/$CONFIG/net10.0-android" -name '*.apk' | head -n1)"

log "Done."
if [ -n "${APK:-}" ]; then
    log "APK: $APK"
    log "Install on a device: adb install -r \"$APK\""
else
    warn "Build succeeded but no .apk was found under $OUT_DIR — check the build log above."
fi
