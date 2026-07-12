const http = require("http");
const path = require("path");
const fs = require("fs");

const assetRoutes = require("./routes/assets");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const requestedPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/assets") {
    sendJson(res, assetRoutes.listAssets());
    return;
  }

  if (req.url === "/api/dashboard") {
    sendJson(res, assetRoutes.getDashboard());
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`MediAsset Flow running at http://localhost:${PORT}`);
});
