export function resolveMessage(value: string, fallback: string) {
  const trimmed = value.trim();

  if (!trimmed) return fallback;

  // next-intl falls back to the key path when a message is missing.
  if (/^[a-z0-9]+(?:\.[A-Za-z0-9_-]+)+$/.test(trimmed)) {
    return fallback;
  }

  return value;
}
