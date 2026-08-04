// Servidor estático solo para previsualizar el microsite en local. No se sube a Hostinger.
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4320;
const TYPES = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".css": "text/css", ".js": "text/javascript", ".pdf": "application/pdf" };
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(__dirname, p);
    if (!file.startsWith(__dirname) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("404");
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  })
  .listen(PORT, () => console.log("microsite en http://localhost:" + PORT + "/ayb/"));
