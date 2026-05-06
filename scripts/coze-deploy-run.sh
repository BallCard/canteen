#!/usr/bin/env bash
set -euo pipefail

# 基于脚本位置定位项目根目录（scripts/ 的上一级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 显式声明关键环境变量
export PORT=5000
export DEPLOY_RUN_PORT=5000

# 清理 5000 端口残留进程（幂等性）
fuser -k 5000/tcp 2>/dev/null || true
sleep 1

# 使用 Express 作为生产服务器，同时服务前端静态文件和代理 API 到后端
cd frontend_react
exec node -e "
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.DEPLOY_RUN_PORT || 5000;

// 服务前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 代理 API 请求到后端
app.use('/api', (req, res, next) => {
  const backendUrl = 'http://localhost:3001';
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
  proxyReq.on('error', (err) => {
    console.error('Backend proxy error:', err.message);
    res.status(503).json({ error: 'Backend service unavailable' });
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:' + PORT);
});
"
