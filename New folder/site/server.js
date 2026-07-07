// Local static server for the Rajat & Kamlesh wedding invitation site.
// Serves the folder over HTTP (required — the site is a React app and will not
// work when opened directly as a file). Auto-picks a free port and opens the browser.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT) || 8123;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  let filePath = path.join(ROOT, urlPath);
  // SPA fallback: unknown routes with no file extension -> index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (!path.extname(urlPath)) filePath = path.join(ROOT, "index.html");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + urlPath);
      return;
    }
    const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

function openBrowser(url) {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

function listen(port, attemptsLeft) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
    } else {
      console.error("Could not start server:", e.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    const url = "http://localhost:" + port;
    console.log("\n  Wedding invitation site is running:\n");
    console.log("      " + url + "\n");
    console.log("  Keep this window open while viewing. Press Ctrl+C to stop.\n");
    openBrowser(url);
  });
}

listen(START_PORT, 20);
