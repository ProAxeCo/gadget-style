#!/usr/bin/env bash
# Vercel install step. vercel.json's installCommand has a 256-char limit,
# so the real work lives here.
#
# 1. Installs Chrome's shared system libraries on Vercel's Amazon Linux
#    build image (missing by default — puppeteer's Chrome fails with
#    "libnspr4.so: cannot open shared object file" without them). Guarded
#    so environments without dnf (local Windows dev, GitHub CI's Ubuntu
#    runners which already have the libs) skip cleanly.
# 2. Runs the normal pnpm install.
set -euo pipefail

if command -v dnf >/dev/null 2>&1; then
  echo "[vercel-install] installing Chrome system libraries via dnf"
  dnf install -y -q \
    nss nspr dbus-libs atk at-spi2-atk at-spi2-core cups-libs libdrm \
    expat libxcb libxkbcommon libX11 libXcomposite libXdamage libXext \
    libXfixes libXrandr mesa-libgbm pango cairo alsa-lib \
    || echo "[vercel-install] dnf install failed — continuing; prerender will surface any missing lib loudly"
else
  echo "[vercel-install] dnf unavailable — skipping Chrome system libs"
fi

pnpm install
