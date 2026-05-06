#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 查找 dist 目录（可能在多个位置）
POSSIBLE_DIST_PATHS=(
    "$SCRIPT_DIR/frontend_react/dist"
    "$PROJECT_DIR/frontend_react/dist"
    "$SCRIPT_DIR/dist"
    "$PROJECT_DIR/dist"
)

DIST_DIR=""
for path in "${POSSIBLE_DIST_PATHS[@]}"; do
    if [ -d "$path" ]; then
        DIST_DIR="$path"
        break
    fi
done

if [ -z "$DIST_DIR" ]; then
    echo "Error: dist directory not found. Searched paths:"
    for path in "${POSSIBLE_DIST_PATHS[@]}"; do
        echo "  - $path"
    done
    exit 1
fi

echo "Found dist at: $DIST_DIR"

# 确定 express 模块路径
EXPRESS_DIR="$SCRIPT_DIR/frontend_react"
if [ ! -d "$EXPRESS_DIR/node_modules/express" ]; then
    EXPRESS_DIR="$PROJECT_DIR/frontend_react"
fi
if [ ! -d "$EXPRESS_DIR/node_modules/express" ]; then
    EXPRESS_DIR="$SCRIPT_DIR"
fi

# 使用 Node.js + Express 启动
cd "$EXPRESS_DIR"
node -e "
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.DEPLOY_RUN_PORT || 5000;
const DIST_DIR = '$DIST_DIR';

console.log('Serving static files from:', DIST_DIR);
console.log('Working directory:', process.cwd());

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
