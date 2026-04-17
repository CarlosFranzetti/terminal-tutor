#!/usr/bin/env bash
# deploy.sh — push Terminal Tutor to GitHub and deploy to Vercel
# Run from the repo root: bash deploy.sh
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo ""
echo "════════════════════════════════════════════════"
echo "  🚀 Terminal Tutor — Deploy Script"
echo "════════════════════════════════════════════════"
echo ""

# ── Git config ────────────────────────────────────────────────────────────────
git config user.email "carlosfranzetti@gmail.com" 2>/dev/null || true
git config user.name "Carlos Franzetti" 2>/dev/null || true

# ── Remove git lock files if present ─────────────────────────────────────────
echo "🔧 Cleaning git lock files..."
rm -f .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock 2>/dev/null || true

# ── Ensure we are on main ─────────────────────────────────────────────────────
echo "🌿 Ensuring branch is 'main'..."
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" = "master" ]; then
  git branch -m master main
fi
git symbolic-ref HEAD refs/heads/main

# ── Stage and commit ──────────────────────────────────────────────────────────
echo "📦 Staging changes..."
git add -A

CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$CHANGES" -gt "0" ]; then
  echo "✍️  Committing $CHANGES changed file(s)..."
  git commit -m "feat: 3-story branching quests, animated logo, story picker, CLI engine update"
else
  echo "✅ Nothing to commit — working tree is clean."
fi

# ── Set up remote if needed ───────────────────────────────────────────────────
REMOTE_URL="https://github.com/carlosfranzetti/terminal-tutor.git"
if git remote get-url origin >/dev/null 2>&1; then
  echo "🔗 Remote 'origin' already exists."
else
  echo "🔗 Adding remote origin..."
  git remote add origin "$REMOTE_URL"
fi

# ── Push to GitHub ────────────────────────────────────────────────────────────
echo "📤 Pushing to GitHub..."
git push --force origin main
echo "✅ GitHub push complete."

# ── Install web deps ──────────────────────────────────────────────────────────
echo ""
echo "📦 Installing web dependencies..."
cd "$REPO_DIR/web"
npm install --silent

# ── Deploy to Vercel ──────────────────────────────────────────────────────────
echo ""
echo "🌐 Deploying to Vercel..."

if ! command -v vercel >/dev/null 2>&1; then
  echo "⚠️  'vercel' CLI not found. Installing globally..."
  npm install -g vercel
fi

vercel --yes --prod

echo ""
echo "════════════════════════════════════════════════"
echo "  ✦ Deploy complete! Terminal Tutor is live. ✦"
echo "════════════════════════════════════════════════"
echo ""
