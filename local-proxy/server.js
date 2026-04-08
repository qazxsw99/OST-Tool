#!/usr/bin/env node
'use strict';

const http  = require('http');
const https = require('https');

// --- Port config: --port=XXXX or PORT env var, default 3009 ---
const args     = process.argv.slice(2);
const portArg  = args.find(a => a.startsWith('--port='));
const PORT     = portArg ? parseInt(portArg.split('=')[1], 10) : (parseInt(process.env.PORT, 10) || 3009);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':   '*',
  'Access-Control-Allow-Methods':  'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
  'Access-Control-Allow-Headers':  '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age':        '86400',
};

const server = http.createServer((req, res) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Extract target URL from query string: /?<url-encoded-target>
  const qIdx = req.url.indexOf('?');
  if (qIdx === -1 || qIdx === req.url.length - 1) {
    res.writeHead(400, { 'Content-Type': 'text/plain', ...CORS_HEADERS });
    res.end('Missing target URL.\nUsage: http://127.0.0.1:' + PORT + '/?<url-encoded-target>');
    return;
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(req.url.slice(qIdx + 1));
    new URL(targetUrl); // validate
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain', ...CORS_HEADERS });
    res.end('Invalid or malformed target URL');
    return;
  }

  const target    = new URL(targetUrl);
  const isHttps   = target.protocol === 'https:';
  const transport = isHttps ? https : http;

  // Forward headers, replace Host
  const forwardHeaders = { ...req.headers, host: target.host };
  delete forwardHeaders['content-length']; // let Node recalculate

  console.log(`→ ${req.method} ${targetUrl}`);

  const proxyReq = transport.request(
    {
      hostname: target.hostname,
      port:     target.port || (isHttps ? 443 : 80),
      path:     target.pathname + target.search,
      method:   req.method,
      headers:  forwardHeaders,
    },
    (proxyRes) => {
      console.log(`← ${proxyRes.statusCode} ${targetUrl}`);
      res.writeHead(proxyRes.statusCode, { ...proxyRes.headers, ...CORS_HEADERS });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error(`✗ Proxy error: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain', ...CORS_HEADERS });
    }
    res.end('Proxy error: ' + err.message);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`CORS proxy listening on http://127.0.0.1:${PORT}`);
  console.log(`  Custom port: node server.js --port=8080`);
  console.log(`  Env var:     PORT=8080 node server.js`);
});
