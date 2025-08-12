#!/usr/bin/env bash
set -euo pipefail
export PYTHONPATH="$(cd "$(dirname "$0")/.." && pwd)"
# Use local venv if it exists, otherwise try global
if [ -f "$(dirname "$0")/../venv/bin/python" ]; then
    "$(dirname "$0")/../venv/bin/python" "$(dirname "$0")/smoke_video.py"
elif [ -f "/Volumes/MacintoshSSDExt/open-source/ceaser-ad-business/.venv/bin/python" ]; then
    "/Volumes/MacintoshSSDExt/open-source/ceaser-ad-business/.venv/bin/python" "$(dirname "$0")/smoke_video.py"
else
    python "$(dirname "$0")/smoke_video.py"
fi
