import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const allowed = new Set([path.join(root, "packages", "theme", "tokens.css")]);
const ignoreDirs = new Set(["node_modules", ".git", "dist", "build", "coverage", ".turbo"]);
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".md",
  ".html",
  ".json",
  ".yml",
  ".yaml",
  ".svg",
]);

const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
const offenders = [];

walk(root);

if (offenders.length > 0) {
  console.error("Raw hex colors found outside packages/theme/tokens.css:");
  offenders.forEach(entry => {
    console.error(`- ${entry.file}:${entry.line}: ${entry.match}`);
  });
  process.exit(1);
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(fullPath);
      continue;
    }
    if (allowed.has(fullPath)) continue;
    if (!textExtensions.has(path.extname(entry.name))) continue;
    scanFile(fullPath);
  }
}

function scanFile(filePath) {
  let contents = "";
  try {
    contents = readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  let match;
  while ((match = hexPattern.exec(contents))) {
    const line = contents.slice(0, match.index).split("\n").length;
    offenders.push({ file: path.relative(root, filePath), line, match: match[0] });
  }
}
