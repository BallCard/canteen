#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

PORT="${DEPLOY_RUN_PORT:-5000}"

# 清理端口
fuser -k "$PORT"/tcp 2>/dev/null || true
sleep 1

# 使用 Node.js + Express 启动静态文件服务
cd frontend_react
exec node -e "
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.DEPLOY_RUN_PORT || 5000;

// 静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// API 代理到后端（如果可用）
app.use('/api', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: req.path,
    method: req.method,
    headers: req.headers
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  req.pipe(proxyReq);
  proxyReq.on('error', () => {
    res.status(503).json({ error: 'Backend unavailable' });
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
"
