# Safe Logging Guide

## Overview

Aurum Sanctuary uses safe logging patterns to prevent sensitive data leaks. **Never use `console.log`, `console.error`, or `console.warn` directly** in production code.

---

## Why Safe Logging?

### Risks of Unsafe Logging:
- ❌ PII leaks (email, phone, address)
- ❌ Token exposure (auth tokens, API keys)
- ❌ Encryption key leaks (contentKey, IV, salt)
- ❌ User content exposure (journal entries, insights)
- ❌ Compliance violations (GDPR, CCPA)

### Benefits of Safe Logging:
- ✅ Automatic redaction of sensitive fields
- ✅ Structured logging (JSON format)
- ✅ Hashed user IDs (not raw UIDs)
- ✅ Error stack traces (limited to 3 lines)
- ✅ Compliance-friendly

---

## Usage

### Import Safe Logger

```typescript
import { logger } from '@/lib/logger/safe';
```

### Error Logging

```typescript
// ❌ UNSAFE - Don't do this
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error); // May leak sensitive data
}

// ✅ SAFE - Do this instead
try {
  await someOperation();
} catch (error) {
  logger.errorSafe('Operation failed', error, { 
    userId: user.uid, // Will be hashed
    operation: 'someOperation' 
  });
}
```

### Warning Logging

```typescript
// ❌ UNSAFE
console.warn('Rate limit approaching', { email: user.email });

// ✅ SAFE
logger.warnSafe('Rate limit approaching', { 
  userId: user.uid, // Will be hashed
  requestCount: 18 
});
```

### Info Logging

```typescript
// ❌ UNSAFE
console.log('User logged in', { email, token });

// ✅ SAFE
logger.infoSafe('User logged in', { 
  userId: user.uid, // Will be hashed
  method: 'google' 
});
```

---

## Sensitive Fields (Auto-Redacted)

The following fields are **automatically redacted** when logged:

### Authentication & Tokens
- `password`, `token`, `idToken`, `accessToken`, `refreshToken`
- `authToken`, `apiKey`, `secret`, `secretKey`, `privateKey`

### Encryption Keys
- `contentKey`, `encryptionKey`, `wrappedContentKey`, `draftKey`
- `iv`, `salt`

### User Content
- `content`, `entryText`, `encryptedContent`, `decryptedContent`
- `plaintext`, `message`, `insight`, `insightText`

### PII
- `email`, `phone`, `phoneNumber`, `address`, `ssn`
- `creditCard`, `cardNumber`, `cvv`

### Payment
- `stripeToken`, `paymentMethod`, `cardDetails`

### Session
- `sessionId`, `cookie`, `cookies`

### User IDs (Hashed, not redacted)
- `userId`, `uid` → Converted to `hash_abc12345`

---

## Examples

### Example 1: API Route Error

```typescript
// app/api/entries/route.ts
import { logger } from '@/lib/logger/safe';

export async function POST(req: Request) {
  try {
    const { encryptedContent, iv } = await req.json();
    // ... process entry
  } catch (error) {
    logger.errorSafe('Failed to create entry', error, {
      userId: user.uid, // Hashed
      hasContent: !!encryptedContent, // Boolean, not content itself
    });
    return Response.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
```

### Example 2: Cloud Function

```typescript
// functions/src/generateInsight.ts
import { logger } from './lib/logger/safe';

export const generateInsight = functions.https.onCall(async (data, context) => {
  try {
    const insight = await generateInsightFromEntries(entries);
    logger.infoSafe('Insight generated', {
      userId: context.auth!.uid, // Hashed
      insightLength: insight.length, // Number, not content
    });
    return { success: true };
  } catch (error) {
    logger.errorSafe('Insight generation failed', error, {
      userId: context.auth!.uid, // Hashed
    });
    throw new functions.https.HttpsError('internal', 'Insight generation failed');
  }
});
```

### Example 3: Client-Side Logging

```typescript
// components/JournalEditor.tsx
import { logger } from '@/lib/logger/safe';

function handleSave() {
  try {
    saveEntry(encryptedContent);
    logger.infoSafe('Entry saved', {
      userId: user.uid, // Hashed
      wordCount: content.split(' ').length, // Number, not content
    });
  } catch (error) {
    logger.errorSafe('Failed to save entry', error, {
      userId: user.uid, // Hashed
    });
  }
}
```

---

## Log Output Format

All logs are structured JSON:

```json
{
  "level": "ERROR",
  "message": "Failed to authenticate",
  "error": {
    "name": "FirebaseError",
    "message": "Invalid credentials",
    "stack": "Error: Invalid credentials\n  at authenticate (auth.ts:42)\n  at login (page.tsx:18)"
  },
  "context": {
    "userId": "hash_abc12345",
    "method": "email"
  },
  "timestamp": "2026-01-29T21:00:00.000Z"
}
```

---

## CI/CD Checks

The CI pipeline checks for unsafe logging patterns:

```bash
# Detects:
console.log.*password
console.log.*token
console.error(error)
console.error(err)

# To suppress false positives, add comment:
console.error(error); // safe-logging-ignore
```

---

## Testing

### Unit Test Example

```typescript
import { logger, redactSensitiveFields } from '@/lib/logger/safe';

describe('Safe Logging', () => {
  it('should redact sensitive fields', () => {
    const data = {
      userId: 'user123',
      email: 'user@example.com',
      token: 'secret-token',
      publicData: 'visible',
    };

    const redacted = redactSensitiveFields(data);

    expect(redacted.userId).toMatch(/^hash_/); // Hashed
    expect(redacted.email).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.publicData).toBe('visible');
  });
});
```

---

## Best Practices

1. ✅ **Always use `logger.errorSafe()` instead of `console.error(error)`**
2. ✅ **Log metadata, not content** (e.g., `wordCount`, not `content`)
3. ✅ **Hash user IDs** (automatic with `userId` or `uid` fields)
4. ✅ **Use structured logging** (pass context object)
5. ✅ **Limit error stack traces** (first 3 lines only)
6. ❌ **Never log raw error objects**
7. ❌ **Never log user content, tokens, or keys**
8. ❌ **Never log PII (email, phone, address)**

---

## Next Steps

After implementing safe logging:
1. ✅ STORY-1.5 complete
2. → STORY-1.6: Create DerivedMemoryLite Placeholder
3. → STORY-1.7: Setup Development Environment
