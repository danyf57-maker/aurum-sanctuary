function cleanCandidate(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s+/g, ' ');
  return normalized.slice(0, 40);
}

export function extractFirstName(displayName?: string | null): string | null {
  const cleaned = cleanCandidate(displayName);
  if (!cleaned) return null;
  const [firstPart] = cleaned.split(' ');
  return firstPart || null;
}

export function extractFirstNameFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return null;
  const [firstToken] = localPart.split(/[._-]+/).filter(Boolean);
  return cleanCandidate(firstToken);
}

export function resolveFirstName(params: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
}): string {
  return (
    cleanCandidate(params.firstName) ||
    extractFirstName(params.displayName) ||
    extractFirstNameFromEmail(params.email) ||
    params.fallback ||
    'toi'
  );
}
