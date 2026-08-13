#!/usr/bin/env bash
set -euo pipefail

if [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  echo "$GOOGLE_SERVICE_INFO_PLIST" | base64 --decode > "$EAS_BUILD_WORKINGDIR/GoogleService-Info.plist"
  echo "✓ GoogleService-Info.plist escrito desde EAS secret"
fi
