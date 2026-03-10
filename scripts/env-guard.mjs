#!/usr/bin/env node

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const envFiles = [".env.local", ".env"];

for (const file of envFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
}

const warnings = [];
const errors = [];

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "";
const cloudProject = process.env.GOOGLE_CLOUD_PROJECT || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
const stripeKey = process.env.STRIPE_SECRET_KEY || "";

const isProdProject = /(^|[-_])prod($|[-_])|aurum-diary-prod/.test(projectId);
const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(appUrl);
const isProdUrl = /^https:\/\/(www\.)?aurumdiary\.com\/?$/i.test(appUrl);

if (!projectId) warnings.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set.");
if (!appUrl) warnings.push("NEXT_PUBLIC_APP_URL is not set.");

if (cloudProject && projectId && cloudProject !== projectId) {
  errors.push(`GOOGLE_CLOUD_PROJECT (${cloudProject}) does not match NEXT_PUBLIC_FIREBASE_PROJECT_ID (${projectId}).`);
}

if (stripeKey.startsWith("sk_live_") && !isProdProject) {
  errors.push("Live Stripe key detected outside the production Firebase project.");
}

if (stripeKey.startsWith("sk_test_") && isProdProject) {
  errors.push("Test Stripe key detected for the production Firebase project.");
}

if (isProdProject && isLocalUrl) {
  errors.push("Production Firebase project paired with a localhost NEXT_PUBLIC_APP_URL.");
}

if (!isProdProject && isProdUrl) {
  errors.push("Non-production Firebase project paired with the production public URL.");
}

if (!stripeKey) {
  warnings.push("STRIPE_SECRET_KEY is not set. Checkout flows cannot be validated locally.");
}

if (warnings.length > 0) {
  console.log("Environment guard warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Environment guard failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Environment guard passed.");
