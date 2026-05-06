#!/usr/bin/env bash
set -Eeuo pipefail

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline

echo "Building frontend with Vite..."
# 如果 package.json 在 frontend_react/ 下（子目录结构）
if [ -f "frontend_react/package.json" ]; then
  cd frontend_react
fi

pnpm vite build
