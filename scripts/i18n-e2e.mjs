#!/usr/bin/env node

import fs from "fs";
import path from "path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const localeFiles = {
  en: path.join(rootDir, "messages", "en.json"),
  fr: path.join(rootDir, "messages", "fr.json"),
};

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flatten(value, prefix = "", acc = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flatten(item, `${prefix}[${index}]`, acc);
    });
    return acc;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flatten(nested, nextPrefix, acc);
    }
    return acc;
  }

  acc.set(prefix, value);
  return acc;
}

function placeholderSet(input) {
  if (typeof input !== "string") return new Set();
  const matches = input.matchAll(/\{(\w+)(?:,[^}]*)?\}/g);
  return new Set(Array.from(matches, ([, token]) => token));
}

const en = flatten(loadJson(localeFiles.en));
const fr = flatten(loadJson(localeFiles.fr));

const issues = [];

for (const key of en.keys()) {
  if (!fr.has(key)) issues.push(`Missing in fr.json: ${key}`);
}

for (const key of fr.keys()) {
  if (!en.has(key)) issues.push(`Missing in en.json: ${key}`);
}

for (const [key, enValue] of en.entries()) {
  if (!fr.has(key)) continue;
  const frValue = fr.get(key);
  const enTokens = placeholderSet(enValue);
  const frTokens = placeholderSet(frValue);

  if (enTokens.size !== frTokens.size || [...enTokens].some((token) => !frTokens.has(token))) {
    issues.push(`Placeholder mismatch for ${key}: en={${[...enTokens].join(", ")}} fr={${[...frTokens].join(", ")}}`);
  }
}

if (issues.length > 0) {
  console.error("i18n parity check failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`i18n parity check passed (${en.size} leaf keys compared).`);
