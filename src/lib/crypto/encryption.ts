/**
 * Client-Side Encryption Utilities
 *
 * Uses Web Crypto API (AES-GCM) to encrypt/decrypt journal entries.
 * This ensures "Admin-Blind" privacy - the server never sees the raw content.
 */

import { logger } from '@/lib/logger/safe';

// Key configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // Recommended 96 bits for GCM

export interface EncryptedData {
    iv: string; // Base64 encoded initialization vector
    ciphertext: string; // Base64 encoded encrypted content
}

/**
 * Generate a new random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true, // extractable (needed to save to localStorage)
        ['encrypt', 'decrypt']
    );
}

/**
 * Export key to Base64 string (for storage)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exported);
}

/**
 * Import key from Base64 string (from storage)
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
    const raw = base64ToArrayBuffer(base64Key);
    return window.crypto.subtle.importKey(
        'raw',
        raw,
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a string content
 */
export async function encryptEntry(content: string, key: CryptoKey): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const encodedContent = encoder.encode(content);

    // Generate random IV for every encryption operation
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        key,
        encodedContent
    );

    return {
        iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
        ciphertext: arrayBufferToBase64(encryptedBuffer),
    };
}

/**
 * Decrypt content
 */
export async function decryptEntry(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: new Uint8Array(iv),
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        logger.errorSafe('Decryption failed', error);
        throw new Error('Failed to decrypt content. Key mismatch or data corruption.');
    }
}

// Helpers

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
