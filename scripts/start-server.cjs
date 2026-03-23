/**
 * Run the production server with cwd = project root.
 * If dist/spa/index.html is missing, runs npm run build first.
 */
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const indexPath = path.join(projectRoot, "dist", "spa", "index.html");

if (!fs.existsSync(indexPath)) {
  console.log("dist/spa not found. Running npm run build first...");
  const build = spawnSync("npm", ["run", "build"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    console.error("Build failed. Fix errors above and try again.");
    process.exit(1);
  }
}

const result = spawnSync("node", ["dist/server/node-build.mjs"], {
  cwd: projectRoot,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
