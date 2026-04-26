import crypto from 'react-native-quick-crypto';
import {setSecureItem, getSecureItem, deleteSecureItem, AuthenticationCanceled} from './secureStorage';
import {setItem, getItem, multiRemoveItem} from "./storage"

// Re-export AuthenticationCanceled for convenience
export { AuthenticationCanceled };

// Promisify crypto.generateKeyPair for use with async/await
function promisifyGenerateKeyPair(
  type: string,
  options: any
): Promise<{ privateKey: string; publicKey: string }> {
  return new Promise((resolve, reject) => {
    // @ts-ignore - react-native-quick-crypto has different type signatures
    crypto.generateKeyPair(type, options, (err: Error | null, publicKey: string, privateKey: string) => {
      if (err) {
        reject(err);
      } else {
        resolve({ privateKey, publicKey });
      }
    });
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  PRIVATE_KEY: 'user_private_key',
  PUBLIC_KEY: 'user_public_key',
  USERNAME: 'registered_username',
  DEVICE_ID: 'auth_device_id'
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeyPair {
  private: string; // PEM formatted private key
  public: string; // PEM formatted public key
  publicBase64: string; // Base64 encoded public key (without headers)
}

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Generate an RSA 2048-bit key pair.
 * This uses Node.js crypto API via react-native-quick-crypto.
 *
 * @returns Promise<KeyPair> - The generated key pair with both PEM and base64 formats
 */
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    // Generate key pair using crypto from react-native-quick-crypto
    const { privateKey, publicKey } = await promisifyGenerateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Extract public key base64 (remove PEM headers and newlines)
    const publicKeyBase64 = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();

    return {
      private: privateKey,
      public: publicKey,
      publicBase64: publicKeyBase64,
    };
  } catch (error) {
    throw new Error(`Failed to generate key pair: ${error}`);
  }
}

// ─── Key Storage ──────────────────────────────────────────────────────────────

/**
 * Store the private key securely.
 * Uses expo-secure-store with device-level encryption.
 * Biometric authentication is NOT required for writes (skipAuth: true).
 *
 * @param privateKey - PEM formatted private key
 */
export async function storePrivateKey(privateKey: string): Promise<void> {
  try {
    await setSecureItem(STORAGE_KEYS.PRIVATE_KEY, privateKey, {
      skipAuth: true, // Don't require auth for initial storage
    });
  } catch (error) {
    throw new Error(`Failed to store private key: ${error}`);
  }
}

/**
 * Retrieve the private key from secure storage.
 * Requires biometric authentication (Face ID / fingerprint) by default.
 *
 * @param skipAuth - Set to true to skip biometric prompt (not recommended)
 * @returns Promise<string | null> - The PEM formatted private key, or null if not found
 */
export async function getPrivateKey(skipAuth = false): Promise<string | null> {
  try {
    return await getSecureItem(STORAGE_KEYS.PRIVATE_KEY, {
      skipAuth,
      authPrompt: 'Authenticate to access your private key',
    });
  } catch (error) {
    if(error instanceof AuthenticationCanceled) {
      throw error
    }
    console.error(error)
    throw new Error(`Failed to retrieve private key: ${error}`);
  }
}

/**
 * Store the public key in regular storage (not sensitive).
 * This is cached locally for quick access without biometric auth.
 *
 * @param publicKeyBase64 - Base64 encoded public key
 */
export async function storePublicKey(publicKeyBase64: string): Promise<void> {
    return await setItem(STORAGE_KEYS.PUBLIC_KEY, publicKeyBase64);
}

/**
 * Retrieve the public key from local storage.
 *
 * @returns Promise<string | null> - Base64 encoded public key, or null if not found
 */
export async function getPublicKeyBase64(): Promise<string | null> {
  return await getItem(STORAGE_KEYS.PUBLIC_KEY);
}

// ─── Key Status ───────────────────────────────────────────────────────────────

/**
 * Check if keys have been generated and stored.
 *
 * @returns Promise<boolean> - True if keys exist, false otherwise
 */
export async function hasKeys(): Promise<boolean> {
  try {
    const publicKey = await getPublicKeyBase64();
    return publicKey !== null;
  } catch (error) {
    return false;
  }
}

// ─── Username Storage ────────────────────────────────────────────────────────

/**
 * Store the username from registration.
 *
 * @param username - The username to store
 */
export async function storeUsername(username: string): Promise<void> {
    await setItem(STORAGE_KEYS.USERNAME, username);
}

/**
 * Retrieve the stored username.
 *
 * @returns Promise<string | null> - The stored username, or null if not found
 */
export async function getUsername(): Promise<string | null> {
  return await getItem(STORAGE_KEYS.USERNAME);
}

// ─── Device id Storage ────────────────────────────────────────────────────────

/**
 * Store the username from registration.
 *
 * @param deviceId - The username to store
 */
export async function storeDeviceId(deviceId: string, skipAuth: boolean): Promise<void> {
    await setSecureItem(STORAGE_KEYS.DEVICE_ID, deviceId, {
      skipAuth,
      authPrompt: "Autenticazione richiesta per device id"
    });
}

/**
 * Retrieve the stored username.
 *
 * @returns Promise<string | null> - The stored username, or null if not found
 */
export async function getDeviceId(skipAuth: boolean): Promise<string | null> {
  return await getSecureItem(STORAGE_KEYS.DEVICE_ID, {
    skipAuth,
    authPrompt: "Autenticazione richiesta per device id"
  });
}

// ─── Key Management ───────────────────────────────────────────────────────────

/**
 * Delete all stored keys and username.
 * Use with caution - this cannot be undone!
 */
export async function deleteKeys(): Promise<void> {
  try {
    // Delete private key from secure storage
    await deleteSecureItem(STORAGE_KEYS.PRIVATE_KEY, { skipAuth: true });

    await deleteSecureItem(STORAGE_KEYS.DEVICE_ID, { skipAuth: true });

    // Delete public key and username from AsyncStorage
    await multiRemoveItem([STORAGE_KEYS.PUBLIC_KEY, STORAGE_KEYS.USERNAME]);
  } catch (error) {
    throw new Error(`Failed to delete keys: ${error}`);
  }
}

/**
 * Reset all cryptographic keys and username.
 * This completely clears the user's identity from the device.
 * Use with caution - this cannot be undone!
 */
export async function resetKeys(): Promise<void> {
  try {
    await deleteKeys();
  } catch (error) {
    throw new Error(`Failed to reset keys: ${error}`);
  }
}
