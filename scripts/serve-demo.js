"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const appRoot = path.join(root, "apps", "demo-storefront");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const server = http.createServer((request, response) => {
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Invalid request path");
    return;
  }
  let relativePath;
  if (requestedPath === "/") relativePath = "apps/demo-storefront/index.html";
  else if (requestedPath.startsWith("/src/")) relativePath = `apps/demo-storefront${requestedPath}`;
  else if (["/guided-experience.html", "/about.html"].includes(requestedPath)) relativePath = `apps/demo-storefront${requestedPath}`;
  else if (requestedPath.startsWith("/examples/storefronts/") || requestedPath.startsWith("/packages/guidance-core/")) relativePath = requestedPath.slice(1);
  else relativePath = "";
  const filePath = path.resolve(root, relativePath || "__not_found__");
  const allowedRoots = [appRoot, path.join(root, "examples", "storefronts"), path.join(root, "packages", "guidance-core")];
  if (!relativePath || !allowedRoots.some((allowed) => filePath.startsWith(`${allowed}${path.sep}`) || filePath === allowed)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Not found" : "Could not read file");
      return;
    }
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
    response.end(data);
  });
});

const port = Number(process.env.PORT || 4173);
server.listen(port, "127.0.0.1", () => {
  console.log(`Demo storefront: http://127.0.0.1:${port}/`);
  console.log("Press Ctrl+C to stop.");
});
