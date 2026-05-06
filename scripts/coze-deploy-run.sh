#!/usr/bin/env bash
set -Eeuo pipefail

PORT="${DEPLOY_RUN_PORT:-5000}"
BACKEND_PORT=3001

# 清理端口
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 部署环境可能是扁平结构（dist 在根目录），也可能是子目录结构
# 优先检查根目录的 dist，再检查 frontend_react/dist
if [ -d "dist" ]; then
  DIST_DIR="$(pwd)/dist"
elif [ -d "frontend_react/dist" ]; then
  DIST_DIR="$(pwd)/frontend_react/dist"
else
  echo "ERROR: dist directory not found in $(pwd)"
  echo "Directory contents:"
  ls -la
  exit 1
fi

echo "Found dist at: $DIST_DIR"

# 查找 backend 目录
BACKEND_DIR=""
if [ -d "backend" ]; then
  BACKEND_DIR="$(pwd)"
elif [ -d "frontend_react" ] && [ -d "$(pwd)/../backend" ]; then
  BACKEND_DIR="$(cd "$(pwd)/.." && pwd)"
fi

# 启动后端
if [ -n "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/backend/main.py" ]; then
  echo "Starting Backend from: $BACKEND_DIR"
  cd "$BACKEND_DIR"
  python -m backend.main &
  BACKEND_PID=$!
  sleep 2
  echo "Backend started with PID $BACKEND_PID"
fi

# 查找 express 模块所在目录（需要在该目录下执行 node 才能 require）
EXPRESS_DIR="$(pwd)"
if [ ! -d "node_modules/express" ] && [ -d "frontend_react/node_modules/express" ]; then
  EXPRESS_DIR="$(pwd)/frontend_react"
fi

echo "Starting Frontend from: $EXPRESS_DIR"
cd "$EXPRESS_DIR"

exec node -e "
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = '$PORT';
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
    headers: { ...req.headers, host: 'localhost:' + BACKEND_PORT }
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => res.status(503).json({ error: 'Backend unavailable' }));
  req.pipe(proxyReq);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));
"
