import { describe, expect, it } from 'vitest';
import {
  encrypt,
  generateEncryptionKey,
  PASSPHRASE_ENCRYPTION_VERSION,
  unwrapKeyWithPassphrase,
  wrapKeyWithPassphrase,
  decrypt,
} from '../encryption';

describe('encryption vault helpers', () => {
  it('wraps and unwraps a content key with a passphrase', async () => {
    const contentKey = await generateEncryptionKey();
    const envelope = await wrapKeyWithPassphrase(contentKey, 'this is a long test passphrase');
    const unwrapped = await unwrapKeyWithPassphrase(envelope, 'this is a long test passphrase');

    const encrypted = await encrypt('secret journal entry', unwrapped);
    const decrypted = await decrypt(encrypted, unwrapped);

    expect(envelope.version).toBe(PASSPHRASE_ENCRYPTION_VERSION);
    expect(decrypted).toBe('secret journal entry');
  });

  it('rejects the wrong passphrase', async () => {
    const contentKey = await generateEncryptionKey();
    const envelope = await wrapKeyWithPassphrase(contentKey, 'this is a long test passphrase');

    await expect(
      unwrapKeyWithPassphrase(envelope, 'this is the wrong passphrase')
    ).rejects.toThrow();
  });
});
