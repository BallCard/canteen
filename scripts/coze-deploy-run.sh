#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

BACKEND_PORT=3001
FRONTEND_PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$FRONTEND_PORT"/tcp 2>/dev/null || true
sleep 1

# 查找 dist 目录
POSSIBLE_DIST_PATHS=(
    "$SCRIPT_DIR/frontend_react/dist"
    "$PROJECT_DIR/frontend_react/dist"
)

DIST_DIR=""
for path in "${POSSIBLE_DIST_PATHS[@]}"; do
    if [ -d "$path" ]; then
        DIST_DIR="$path"
        break
    fi
done

if [ -z "$DIST_DIR" ]; then
    echo "Error: dist directory not found"
    exit 1
fi

# 确定 express 模块路径
EXPRESS_DIR="$SCRIPT_DIR/frontend_react"
if [ ! -d "$EXPRESS_DIR/node_modules/express" ]; then
    EXPRESS_DIR="$PROJECT_DIR/frontend_react"
fi

echo "=== Starting Backend (Python/FastAPI) on port $BACKEND_PORT ==="
cd "$PROJECT_DIR"
# 启动后端
python -m backend.main &
BACKEND_PID=$!
sleep 2

# 验证后端启动
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Error: Backend failed to start"
    exit 1
fi
echo "Backend started with PID $BACKEND_PID"

echo "=== Starting Frontend (Express) on port $FRONTEND_PORT ==="
cd "$EXPRESS_DIR"

# 启动前端（带 API 代理）
exec node -e "
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = '$FRONTEND_PORT';
const DIST_DIR = '$DIST_DIR';
const BACKEND_PORT = '$BACKEND_PORT';

console.log('Serving static files from:', DIST_DIR);

// 静态文件
app.use(express.static(DIST_DIR));

// API 代理
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

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend server running on port ' + PORT);
});
"
