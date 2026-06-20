#!/bin/bash
set -e

# Paulline Harness Init Script
# Validates toolchain: Node.js, pnpm, git

echo "🔧 Paulline Harness — Toolchain Validation"
echo "==========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js LTS from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
PNPM_VERSION=$(pnpm -v)
echo "✅ pnpm: $PNPM_VERSION"

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ git not found. Install git from https://git-scm.com/"
    exit 1
fi
GIT_VERSION=$(git --version)
echo "✅ $GIT_VERSION"

# Check git config (identity)
GIT_NAME=$(git config user.name 2>/dev/null || echo "")
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")
if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    echo "⚠️  Git identity not configured locally."
    echo "   Run: git config user.name 'Your Name' && git config user.email 'your@email.com'"
fi

# Check Docker (optional, but recommended)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ $DOCKER_VERSION"
else
    echo "⚠️  Docker not found (optional, but recommended for deployment)"
fi

# Check workspace
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ pnpm-workspace.yaml not found. Run from repo root."
    exit 1
fi
echo "✅ pnpm-workspace.yaml found"

# Validate CLAUDE.md
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ CLAUDE.md not found. Run from repo root."
    exit 1
fi
echo "✅ CLAUDE.md found"

echo ""
echo "✅ Toolchain validation passed!"
echo "Next: Read harness/progress/current.md and begin with /paulness next"
exit 0
