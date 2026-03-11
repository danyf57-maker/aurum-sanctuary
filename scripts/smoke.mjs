#!/usr/bin/env node

import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const host = "127.0.0.1";
const port = Number(process.env.SMOKE_PORT || 9010);
const baseUrl = `http://${host}:${port}`;

const runtimeEnv = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aurum-dev-local.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aurum-dev-local",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aurum-dev-local.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || baseUrl,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy.apps.googleusercontent.com",
};

const routes = [
  { path: "/", expected: ["Write in private. Understand what keeps returning."] },
  { path: "/login", expected: ["Sign in"] },
  { path: "/signup", expected: ["Create an account"] },
  { path: "/pricing", expected: ["Choose your plan"] },
  { path: "/fr/login", expected: ["Sign in"], assertSameUrl: true },
];

function ensureBuild() {
  const buildIdPath = path.join(rootDir, ".next", "BUILD_ID");
  if (fs.existsSync(buildIdPath)) return;
  execSync("npm run build", { cwd: rootDir, env: runtimeEnv, stdio: "inherit" });
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Retry until server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function runChecks() {
  for (const route of routes) {
    const res = await fetch(`${baseUrl}${route.path}`);
    if (!res.ok) {
      throw new Error(`Smoke route failed: ${route.path} returned ${res.status}`);
    }
    if (route.assertSameUrl && new URL(res.url).pathname !== route.path) {
      throw new Error(`Smoke route failed: ${route.path} redirected to ${new URL(res.url).pathname}`);
    }
    const body = await res.text();
    for (const expected of route.expected) {
      if (!body.includes(expected)) {
        throw new Error(`Smoke route failed: ${route.path} missing expected text "${expected}"`);
      }
    }
  }
}

async function shutdown(server) {
  if (server.killed) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}

async function main() {
  ensureBuild();

  const logs = [];
  const server = spawn("npm", ["run", "start", "--", "-H", host, "-p", String(port)], {
    cwd: rootDir,
    env: runtimeEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const capture = (chunk) => {
    const text = chunk.toString();
    logs.push(text);
    if (logs.length > 200) logs.shift();
  };

  server.stdout.on("data", capture);
  server.stderr.on("data", capture);

  process.on("SIGINT", () => {
    void shutdown(server);
    process.exit(130);
  });

  try {
    await waitForServer(`${baseUrl}/login`);
    await runChecks();
    await shutdown(server);
    console.log("Smoke check passed.");
  } catch (error) {
    await shutdown(server);
    const recentLogs = logs.join("");
    if (recentLogs) {
      console.error("Recent smoke server logs:");
      console.error(recentLogs);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
