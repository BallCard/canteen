#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 切换到 frontend_react 目录执行（这样 express 模块可以找到）
cd frontend_react

# 静态文件目录（绝对路径）
DIST_DIR="$(pwd)/dist"

# 使用 Node.js + Express 启动
node -e "
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.DEPLOY_RUN_PORT || 5000;
const DIST_DIR = require('path').resolve(__dirname, 'dist');

// 静态文件
app.use(express.static(DIST_DIR));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
"
