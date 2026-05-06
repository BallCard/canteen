#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

PORT="${PORT:-5000}"

# 清理端口
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 启动 vite dev server
cd frontend_react
exec pnpm vite --host 0.0.0.0 --port "$PORT"
