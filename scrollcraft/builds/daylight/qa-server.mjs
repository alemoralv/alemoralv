import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const port = Number(process.env.DAYLIGHT_QA_PORT || 4519);
const denied = new Set(['node_modules', 'scrollcraft', 'scripts', 'tools', 'tooling']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let requestPath;
  try { requestPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replaceAll('\\', '/'); }
  catch { res.writeHead(400).end(); return; }
  const parts = requestPath.split('/').filter(Boolean);
  if (parts.some(p => p.startsWith('.') || p.toLowerCase() === 'node_modules') || denied.has(parts[0]?.toLowerCase()) || requestPath.includes('\0')) { res.writeHead(403).end('Forbidden'); return; }
  const file = path.resolve(root, '.' + requestPath + (requestPath.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    const ext = path.extname(file).toLowerCase();
    if (!mime[ext]) { res.writeHead(403).end('Forbidden'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext], 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).pipe(res);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`Daylight QA: http://127.0.0.1:${port}/ | root ${root}`));
