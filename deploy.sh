#!/bin/bash
set -e
cd "$(dirname "$0")"

# Remove any stale git lock files
rm -f .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock

echo "📝 Staging any new changes..."
git add -A
git diff --cached --quiet || git commit -m "chore: update docs and web app"

echo ""
echo "🔗 Setting GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/carlosfranzetti/terminal-tutor.git

echo ""
echo "📤 Pushing to GitHub (branch: main)..."
git push -u origin main --force

echo ""
echo "🌐 Deploying web app to Vercel..."
cd web
npm install --silent
npx vercel --yes
npx vercel --prod

echo ""
echo "✅ All done! Copy the Vercel URL above."
