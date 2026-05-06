#!/usr/bin/env bash
set -Eeuo pipefail

# 部署环境可能是扁平结构（package.json 在根目录）或子目录结构
if [ -f "frontend_react/package.json" ]; then
  cd frontend_react
fi

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline

echo "Building frontend with Vite..."
pnpm exec vite build
