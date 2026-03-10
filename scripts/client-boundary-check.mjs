#!/usr/bin/env node

import fs from "fs";
import path from "path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const srcDir = path.join(rootDir, "src");
const allowedClientEnv = new Set(["NODE_ENV"]);
const blockedImportPatterns = [
  "firebase-admin",
  "server-only",
  "next/headers",
  "next/server",
  "fs",
  "node:fs",
  "path",
  "node:path",
  "child_process",
  "node:child_process",
  "net",
  "node:net",
  "tls",
  "node:tls",
  "dns",
  "node:dns",
];
const blockedLocalPatterns = [
  "@/lib/firebase/admin",
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalize(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function stripComments(line) {
  return line.replace(/\/\/.*$/, "").trim();
}

function isClientModule(source) {
  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripComments(rawLine);
    if (!line) continue;
    return line === "'use client';" || line === '"use client";' || line === "'use client'" || line === '"use client"';
  }
  return false;
}

function findClientEnvViolations(source) {
  const violations = [];
  for (const match of source.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    const envName = match[1];
    if (!envName.startsWith("NEXT_PUBLIC_") && !allowedClientEnv.has(envName)) {
      violations.push(envName);
    }
  }
  return [...new Set(violations)];
}

function findBlockedImports(source) {
  const matches = [];
  for (const pattern of blockedImportPatterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const importRegex = new RegExp(`(?:from\\s+['"]${escaped}['"]|require\\(\\s*['"]${escaped}['"]\\s*\\))`);
    if (importRegex.test(source)) matches.push(pattern);
  }

  for (const pattern of blockedLocalPatterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const importRegex = new RegExp(`(?:from\\s+['"]${escaped}[^'"]*['"]|require\\(\\s*['"]${escaped}[^'"]*['"]\\s*\\))`);
    if (importRegex.test(source)) matches.push(pattern);
  }

  return [...new Set(matches)];
}

const issues = [];

for (const filePath of walk(srcDir)) {
  const source = fs.readFileSync(filePath, "utf8");
  if (!isClientModule(source)) continue;

  const envViolations = findClientEnvViolations(source);
  if (envViolations.length > 0) {
    issues.push(`${normalize(filePath)} exposes non-public env vars in a client module: ${envViolations.join(", ")}`);
  }

  const importViolations = findBlockedImports(source);
  if (importViolations.length > 0) {
    issues.push(`${normalize(filePath)} imports server-only modules from a client module: ${importViolations.join(", ")}`);
  }
}

if (issues.length > 0) {
  console.error("Client boundary check failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Client boundary check passed.");
