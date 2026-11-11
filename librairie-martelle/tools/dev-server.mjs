// Local server identical to production routing: static files + /livre/* and /sitemap.xml rendered by server/book-page.mjs.
// Usage: SUPABASE_URL=… SUPABASE_ANON_KEY=… node tools/dev-server.mjs [port]
// DEV_PROXY=1 : also relays /rest/v1, /auth/v1 and /storage/v1 to SUPABASE_URL and serves a matching config.js,
// so a remote preview (single port) can use the local database. Development only.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handle } from "../server/book-page.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = +process.argv[2] || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain; charset=utf-8", ".json": "application/json" };
const env = { SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY, SITE_URL: `http://127.0.0.1:${PORT}`, SITE_INDEXABLE: "false" };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  try {
    if (process.env.DEV_PROXY === "1") {
      if (url.pathname === "/config.js") {
        res.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" });
        res.end(`window.MARTELLE_CONFIG={supabaseUrl:location.origin,supabaseAnonKey:${JSON.stringify(env.SUPABASE_ANON_KEY)},googleBooksApiKey:""};`);
        return;
      }
      if (/^\/(rest|auth|storage)\/v1\//.test(url.pathname)) {
        const chunks = []; for await (const c of req) chunks.push(c);
        const headers = { ...req.headers }; delete headers.host; delete headers["accept-encoding"]; delete headers.connection;
        const r = await fetch(env.SUPABASE_URL.replace(/\/$/, "") + url.pathname + url.search, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks), redirect: "manual" });
        const h = Object.fromEntries(r.headers); delete h["content-encoding"]; delete h["content-length"]; delete h["transfer-encoding"];
        res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer()));
        return;
      }
    }
    if (url.pathname.startsWith("/livre/") || url.pathname === "/sitemap.xml") {
      const r = await handle(new Request(url, { method: req.method }), env);
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
      return;
    }
    if (/^\/(supabase|tests|tools|server|netlify)\//.test(url.pathname)) { res.writeHead(404); res.end(); return; }
    let file = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("Introuvable");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`http://127.0.0.1:${PORT}`));
