#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 输出调试信息
echo "DEBUG: SCRIPT_DIR=$SCRIPT_DIR"
echo "DEBUG: PROJECT_DIR=$PROJECT_DIR"
echo "DEBUG: PWD=$(pwd)"

BACKEND_PORT=3001
FRONTEND_PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$FRONTEND_PORT"/tcp 2>/dev/null || true
sleep 1

# 查找 dist 目录（添加更多可能的路径）
POSSIBLE_DIST_PATHS=(
    "$SCRIPT_DIR/frontend_react/dist"
    "$PROJECT_DIR/frontend_react/dist"
    "$SCRIPT_DIR/dist"
    "$PROJECT_DIR/dist"
    "/opt/bytefaas/frontend_react/dist"
    "/opt/bytefaas/dist"
    "$(pwd)/frontend_react/dist"
)

echo "DEBUG: Searching for dist directory..."

DIST_DIR=""
for path in "${POSSIBLE_DIST_PATHS[@]}"; do
    echo "DEBUG: Checking $path"
    if [ -d "$path" ]; then
        DIST_DIR="$path"
        echo "DEBUG: Found dist at: $DIST_DIR"
        break
    fi
done

if [ -z "$DIST_DIR" ]; then
    echo "Error: dist directory not found. Searched paths:"
    for path in "${POSSIBLE_DIST_PATHS[@]}"; do
        echo "  - $path (exists: $([ -d "$path" ] && echo yes || echo no))"
    done
    # 列出当前目录内容
    echo "Current directory contents:"
    ls -la "$(pwd)"
    exit 1
fi

# 确定 express 模块路径
EXPRESS_DIR="$SCRIPT_DIR/frontend_react"
if [ ! -d "$EXPRESS_DIR/node_modules/express" ]; then
    EXPRESS_DIR="$PROJECT_DIR/frontend_react"
fi
if [ ! -d "$EXPRESS_DIR/node_modules/express" ]; then
    EXPRESS_DIR="$(pwd)"
fi

echo "DEBUG: EXPRESS_DIR=$EXPRESS_DIR"

echo "=== Starting Backend (Python/FastAPI) on port $BACKEND_PORT ==="
cd "$PROJECT_DIR"
python -m backend.main &
BACKEND_PID=$!
sleep 2

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Error: Backend failed to start"
    exit 1
fi
echo "Backend started with PID $BACKEND_PID"

echo "=== Starting Frontend (Express) on port $FRONTEND_PORT ==="
cd "$EXPRESS_DIR"

exec node -e "
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = '$FRONTEND_PORT';
const DIST_DIR = '$DIST_DIR';
const BACKEND_PORT = '$BACKEND_PORT';

console.log('Serving static files from:', DIST_DIR);

app.use(express.static(DIST_DIR));

app.use('/api', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/api' + req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:' + BACKEND_PORT
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(503).json({ error: 'Backend service unavailable' });
  });

  req.pipe(proxyReq);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend server running on port ' + PORT);
});
"
