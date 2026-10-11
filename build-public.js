// Build script for Vercel and static hosting
// Copies omarchy-desktop files into public/ so Vercel's default outputDirectory is always satisfied

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "omarchy-desktop");
const destDir = path.join(__dirname, "public");

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Preparing public directory for Vercel deployment...");
copyDirRecursive(srcDir, destDir);
console.log("✔ public/ directory generated successfully with all desktop assets.");
