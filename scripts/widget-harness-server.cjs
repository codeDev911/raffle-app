// Throwaway static server for the widget preview harness. Serves ./public on :3000.
const http = require("http")
const fs = require("fs")
const path = require("path")

const ROOT = path.join(__dirname, "..", "public")
// Any path that is not a real file renders the harness, so the browser's genuine URL decides the
// widget's surface(): "/" is home, "/products/x" is a product page, "/collections/x" is "other".
// The harness lives beside this server (not in ./public) so no debug page ships to production.
const FALLBACK = path.join(__dirname, "widget-preview.html")
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0])
    let rel = url === "/" ? "index.html" : url.replace(/^\/+/, "")
    const file = path.join(ROOT, rel)
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("forbidden")
      return
    }
    const target = fs.existsSync(file) && fs.statSync(file).isFile() ? file : FALLBACK
    fs.readFile(target, (err, buf) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("not found: " + rel)
        return
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      })
      res.end(buf)
    })
  })
  .listen(3000, () => console.log("harness server on http://localhost:3000"))
