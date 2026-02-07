/**
 * Session Key Manager
 *
 * Manages the lifecycle of the encryption key in sessionStorage.
 * Keys stored in sessionStorage expire when the browser tab/window is closed,
 * providing better security than localStorage.
 *
 * Features:
 * - Auto-lock after 30 minutes of inactivity
 * - Secure serialization of CryptoKey to sessionStorage
 * - Activity tracking for auto-lock
 *
 * Security: sessionStorage is cleared when tab closes, reducing attack surface.
 */

const SESSION_KEY_NAME = 'aurum_session_key_v2';
const LAST_ACTIVITY_KEY = 'aurum_last_activity';
const AUTO_LOCK_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Stores the derived encryption key in sessionStorage.
 *
 * The key is exported to raw format and stored as base64.
 * This allows the key to persist across page refreshes within the same session.
 *
 * @param key - CryptoKey to store
 *
 * @example
 * const key = await deriveKeyFromPassphrase("MyPassphrase123!", salt);
 * await storeSessionKey(key);
 * // Key is now available until tab closes or auto-lock triggers
 */
export async function storeSessionKey(key: CryptoKey): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side - do nothing
    return;
  }

  try {
    // Export key to raw format
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const keyArray = Array.from(new Uint8Array(exportedKey));
    const keyBase64 = btoa(String.fromCharCode(...keyArray));

    // Store in sessionStorage
    sessionStorage.setItem(SESSION_KEY_NAME, keyBase64);

    // Update last activity timestamp
    updateActivity();
  } catch (error) {
    console.error('Failed to store session key:', error);
    throw new Error('Échec de la sauvegarde de la clé de session.');
  }
}

/**
 * Retrieves the encryption key from sessionStorage.
 *
 * @returns CryptoKey if found, null otherwise
 *
 * @example
 * const key = await getSessionKey();
 * if (key) {
 *   // User is unlocked
 *   const encrypted = await encryptContent(content, key);
 * } else {
 *   // User needs to unlock with passphrase
 *   showPassphraseUnlockModal();
 * }
 */
export async function getSessionKey(): Promise<CryptoKey | null> {
  if (typeof window === 'undefined') {
    // Server-side - no session key
    return null;
  }

  try {
    const keyBase64 = sessionStorage.getItem(SESSION_KEY_NAME);
    if (!keyBase64) {
      return null;
    }

    // Check if session expired due to inactivity
    if (isSessionExpired()) {
      clearSessionKey();
      return null;
    }

    // Convert base64 back to Uint8Array
    const keyString = atob(keyBase64);
    const keyArray = new Uint8Array(
      keyString.split('').map(char => char.charCodeAt(0))
    );

    // Import as CryptoKey
    const key = await crypto.subtle.importKey(
      'raw',
      keyArray,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );

    // Update activity on successful retrieval
    updateActivity();

    return key;
  } catch (error) {
    console.error('Failed to retrieve session key:', error);
    // Clear corrupted key
    clearSessionKey();
    return null;
  }
}

/**
 * Checks if the current session has an active key.
 *
 * @returns true if key exists and session is not expired
 *
 * @example
 * if (hasSessionKey()) {
 *   console.log("User is unlocked");
 * } else {
 *   console.log("User needs to unlock");
 * }
 */
export function hasSessionKey(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const keyBase64 = sessionStorage.getItem(SESSION_KEY_NAME);
  return keyBase64 !== null && !isSessionExpired();
}

/**
 * Clears the session key (locks the sanctuary).
 *
 * This is called:
 * - On manual lock
 * - On logout
 * - On auto-lock timeout
 *
 * @example
 * // User clicks "Lock Sanctuary"
 * clearSessionKey();
 * router.push('/dashboard');
 */
export function clearSessionKey(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(SESSION_KEY_NAME);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Updates the last activity timestamp.
 *
 * Called whenever the user interacts with the encrypted content.
 */
function updateActivity(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Checks if the session has expired due to inactivity.
 *
 * @returns true if more than 30 minutes since last activity
 */
function isSessionExpired(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const lastActivityStr = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivityStr) {
    return true;
  }

  const lastActivity = parseInt(lastActivityStr, 10);
  const now = Date.now();
  const elapsed = now - lastActivity;

  return elapsed > AUTO_LOCK_TIMEOUT;
}

/**
 * Sets up auto-lock functionality.
 *
 * Checks every minute if the session has expired and triggers the lock callback.
 *
 * @param onLock - Callback function to run when auto-lock triggers
 * @returns Cleanup function to stop the auto-lock timer
 *
 * @example
 * // In a React component
 * useEffect(() => {
 *   const cleanup = setupAutoLock(() => {
 *     setIsUnlocked(false);
 *     toast({ title: "Session verrouillée", description: "Inactivité de 30 minutes." });
 *   });
 *
 *   return cleanup;
 * }, []);
 */
export function setupAutoLock(onLock: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const checkInterval = setInterval(() => {
    if (hasSessionKey() && isSessionExpired()) {
      clearSessionKey();
      onLock();
    }
  }, 60 * 1000); // Check every minute

  // Return cleanup function
  return () => clearInterval(checkInterval);
}

/**
 * Tracks user activity to prevent auto-lock.
 *
 * Should be called on user interactions (clicks, keypresses, etc.).
 *
 * @example
 * // In a React component
 * useEffect(() => {
 *   const handleActivity = () => trackActivity();
 *
 *   window.addEventListener('mousedown', handleActivity);
 *   window.addEventListener('keydown', handleActivity);
 *
 *   return () => {
 *     window.removeEventListener('mousedown', handleActivity);
 *     window.removeEventListener('keydown', handleActivity);
 *   };
 * }, []);
 */
export function trackActivity(): void {
  if (hasSessionKey()) {
    updateActivity();
  }
}

/**
 * Gets the time remaining before auto-lock (in milliseconds).
 *
 * @returns Milliseconds until auto-lock, or 0 if no active session
 *
 * @example
 * const remaining = getTimeUntilAutoLock();
 * const minutes = Math.floor(remaining / 60000);
 * console.log(`Auto-lock in ${minutes} minutes`);
 */
export function getTimeUntilAutoLock(): number {
  if (typeof window === 'undefined' || !hasSessionKey()) {
    return 0;
  }

  const lastActivityStr = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivityStr) {
    return 0;
  }

  const lastActivity = parseInt(lastActivityStr, 10);
  const now = Date.now();
  const elapsed = now - lastActivity;
  const remaining = AUTO_LOCK_TIMEOUT - elapsed;

  return Math.max(0, remaining);
}
