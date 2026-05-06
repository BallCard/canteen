#!/usr/bin/env bash
set -Eeuo pipefail

PORT="${DEPLOY_RUN_PORT:-5000}"
BACKEND_PORT=3001

# 清理端口
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 动态查找 dist 目录
DIST_DIR="$(find / -maxdepth 5 -path '*/frontend_react/dist/index.html' -type f 2>/dev/null | head -1)"

if [ -z "$DIST_DIR" ]; then
  DIST_DIR="$(find / -maxdepth 4 -name 'index.html' -path '*/dist/index.html' -type f 2>/dev/null | head -1)"
fi

if [ -n "$DIST_DIR" ]; then
  DIST_DIR="$(dirname "$DIST_DIR")"
  echo "Found dist at: $DIST_DIR"
else
  echo "ERROR: Could not find dist directory"
  echo "Listing search results:"
  find / -maxdepth 4 -name "index.html" -type f 2>/dev/null | head -20
  exit 1
fi

# 动态查找 express 模块
EXPRESS_DIR=""
for candidate in $(find / -maxdepth 5 -path '*/node_modules/express/package.json' -type f 2>/dev/null); do
  EXPRESS_DIR="$(dirname "$(dirname "$(dirname "$candidate")")")"
  break
done

if [ -z "$EXPRESS_DIR" ]; then
  echo "ERROR: Could not find express module"
  exit 1
fi

echo "Express at: $EXPRESS_DIR"

# 动态查找 backend 目录
BACKEND_DIR=""
for candidate in $(find / -maxdepth 4 -name 'main.py' -path '*/backend/main.py' -type f 2>/dev/null); do
  BACKEND_DIR="$(dirname "$(dirname "$candidate")")"
  break
done

echo "=== Starting Backend ==="
if [ -n "$BACKEND_DIR" ]; then
  cd "$BACKEND_DIR"
  python -m backend.main &
  BACKEND_PID=$!
  sleep 2
  echo "Backend started with PID $BACKEND_PID"
else
  echo "WARNING: Backend not found, running frontend-only mode"
fi

echo "=== Starting Frontend ==="
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
