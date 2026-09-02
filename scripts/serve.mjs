import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const relative = clean === '/' ? 'demo/index.html' : clean.replace(/^\/+/, '');
  const absolute = path.resolve(root, relative);
  const relativeToRoot = path.relative(root, absolute);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return null;
  return absolute;
}

const server = http.createServer((request, response) => {
  let file = safePath(request.url || '/');

  if (!file) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }

    if (!fs.existsSync(file)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(response);
  } catch (error) {
    response.writeHead(500);
    response.end(String(error));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Asteria design-system demo: http://127.0.0.1:${port}`);
  console.log(`Web model case:             http://127.0.0.1:${port}/prototypes/web/`);
  console.log(`Game model case:            http://127.0.0.1:${port}/prototypes/game/`);
  console.log('Press Ctrl+C to stop.');
});
