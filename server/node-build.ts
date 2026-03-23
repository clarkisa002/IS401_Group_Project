import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

const port = process.env.PORT || 3000;

// Try cwd first (when you run "npm start" from project root), then script-relative (dist/server -> dist/spa)
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distPathCwd = path.resolve(process.cwd(), "dist", "spa");
const distPathScript = path.resolve(scriptDir, "..", "spa");
const distPath = fs.existsSync(path.join(distPathCwd, "index.html"))
  ? distPathCwd
  : fs.existsSync(path.join(distPathScript, "index.html"))
    ? distPathScript
    : distPathCwd; // use cwd path anyway for static(); fallback HTML below
const indexPath = path.join(distPath, "index.html");

let indexHtml: string;
try {
  indexHtml = fs.readFileSync(indexPath, "utf-8");
} catch (e) {
  const altPath = path.join(distPathScript, "index.html");
  console.error("Could not load dist/spa/index.html. Run: npm run build");
  console.error("  cwd:      ", process.cwd());
  console.error("  tried:    ", indexPath);
  console.error("  exists?  ", fs.existsSync(indexPath));
  console.error("  alt:     ", altPath, "exists?", fs.existsSync(altPath));
  indexHtml = "<!DOCTYPE html><html><body><h1>App not built</h1><p>Run: <code>npm run build</code> from the project root, then <code>npm start</code>.</p></body></html>";
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SPA: static assets then serve index.html for /
app.use(express.static(distPath));
app.get("/", (_req, res) => {
  res.type("html").send(indexHtml);
});
app.use((req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.type("html").send(indexHtml);
});

// API routes (after SPA so / is handled first)
app.get("/api/ping", (_req, res) => {
  res.json({ message: process.env.PING_MESSAGE ?? "ping" });
});
app.get("/api/demo", handleDemo);

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
