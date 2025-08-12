#!/usr/bin/env bash
# Quick video generation test runner

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Running video generation tests..."
echo "📁 Project root: $PROJECT_ROOT"

# Set Python path
export PYTHONPATH="$PROJECT_ROOT"

# Find Python executable
PYTHON_EXEC=""
if [ -f "$PROJECT_ROOT/venv/bin/python" ]; then
    PYTHON_EXEC="$PROJECT_ROOT/venv/bin/python"
elif [ -f "/Volumes/MacintoshSSDExt/open-source/ceaser-ad-business/services/python-ai-engine/venv/bin/python" ]; then
    PYTHON_EXEC="/Volumes/MacintoshSSDExt/open-source/ceaser-ad-business/services/python-ai-engine/venv/bin/python"
elif command -v python3 &> /dev/null; then
    PYTHON_EXEC="python3"
else
    echo "❌ No Python executable found!"
    exit 1
fi

echo "🐍 Using Python: $PYTHON_EXEC"

# Run the test
"$PYTHON_EXEC" "$SCRIPT_DIR/test_video.py"
