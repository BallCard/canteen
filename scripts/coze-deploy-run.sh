#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 启动静态文件服务
exec npx serve frontend_react/dist -l "$PORT"
