#!/usr/bin/env bash
set -Eeuo pipefail

PORT="${DEPLOY_RUN_PORT:-5000}"
BACKEND_PORT=3001

# 清理端口
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 部署环境可能是扁平结构，先进入 frontend_react（如果存在）
if [ -d "frontend_react/dist" ]; then
  DIST_DIR="$(pwd)/frontend_react/dist"
elif [ -d "dist" ]; then
  DIST_DIR="$(pwd)/dist"
else
  echo "ERROR: dist directory not found in $(pwd)"
  ls -la
  exit 1
fi

echo "Found dist at: $DIST_DIR"

# 查找 express 模块
if [ -d "node_modules/express" ]; then
  EXPRESS_DIR="$(pwd)"
elif [ -d "frontend_react/node_modules/express" ]; then
  EXPRESS_DIR="$(pwd)/frontend_react"
else
  echo "ERROR: express module not found"
  exit 1
fi

# 启动后端（如果存在）
if [ -d "backend" ]; then
  echo "Starting Backend..."
  python -m backend.main &
  sleep 2
  echo "Backend started"
fi

echo "Starting Frontend on port $PORT..."
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
