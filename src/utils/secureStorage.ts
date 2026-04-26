import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

// ─── Custom Exceptions ─────────────────────────────────────────────────────────

/**
 * Thrown when user explicitly cancels biometric/PIN authentication.
 * Use this to distinguish between "user cancelled" vs "authentication failed".
 */
export class AuthenticationCanceled extends Error {
  constructor() {
    super("Authentication was cancelled by the user");
    this.name = "AuthenticationCanceled";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthLevel =
  | "BIOMETRICS" // Face ID / fingerprint
  | "DEVICE_CREDENTIAL" // PIN / pattern / password
  | "NONE"; // No auth available

export interface SecureStorageOptions {
  /** Custom prompt shown in the biometric/PIN dialog */
  authPrompt?: string;
  /**
   * If true, skip authentication for this specific call.
   * Useful for writing values without triggering auth.
   */
  skipAuth?: boolean;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the strongest auth method available on the device.
 */
export async function getAvailableAuthLevel(): Promise<AuthLevel> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return "NONE";

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return "NONE";

  const supportedTypes =
    await LocalAuthentication.supportedAuthenticationTypesAsync();

  const hasBiometrics = supportedTypes.some(
    (t) =>
      t === LocalAuthentication.AuthenticationType.FINGERPRINT ||
      t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
  );

  return hasBiometrics ? "BIOMETRICS" : "DEVICE_CREDENTIAL";
}

/**
 * Prompts the user for biometrics, falling back to PIN/password.
 * Throws if authentication fails or is cancelled.
 */
export async function authenticate(prompt = "Authenticate to continue"): Promise<void> {
  const authLevel = await getAvailableAuthLevel();

  if (authLevel === "NONE") {
    // No auth hardware / nothing enrolled — skip silently.
    // Remove this block and throw instead if you want to enforce auth.
    return;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    // Falls back to PIN/password automatically on both iOS & Android
    disableDeviceFallback: false,
    cancelLabel: "Cancel",
  });

  if (!result.success) {
    if (result.error === "user_cancel") {
      throw new AuthenticationCanceled();
    }
    throw new Error(`Authentication failed: ${result.error}`);
  }
}

// ─── Core service ─────────────────────────────────────────────────────────────

/**
 * Stores a value in the secure keychain/keystore.
 * Authentication is NOT required for writes by default — only for reads.
 * Pass `skipAuth: false` to require auth before writing too.
 */
export async function setItem(
  key: string,
  value: string,
  options: SecureStorageOptions = {}
): Promise<void> {
  const { authPrompt = "Authenticate to save data", skipAuth = true } = options;

  if (!skipAuth) {
    await authenticate(authPrompt);
  }

  await SecureStore.setItemAsync(key, value, {
    // Encrypt with the device's secure enclave / keystore
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Retrieves a value from secure storage.
 * Always requires biometrics or PIN before returning the value.
 *
 * @returns The stored string, or `null` if the key doesn't exist.
 * @throws  If authentication fails or is cancelled.
 */
export async function getItem(
  key: string,
  options: SecureStorageOptions = {}
): Promise<string | null> {
  const {
    authPrompt = "Authenticate to access secure data",
    skipAuth = false,
  } = options;

  if (!skipAuth) {
    await authenticate(authPrompt);
  }

  return SecureStore.getItemAsync(key);
}

/**
 * Deletes a value from secure storage.
 * Requires authentication by default (set `skipAuth: true` to bypass).
 *
 * @throws If authentication fails or is cancelled.
 */
export async function deleteItem(
  key: string,
  options: SecureStorageOptions = {}
): Promise<void> {
  const {
    authPrompt = "Authenticate to delete secure data",
    skipAuth = false,
  } = options;

  if (!skipAuth) {
    await authenticate(authPrompt);
  }

  await SecureStore.deleteItemAsync(key);
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Store a JSON-serialisable object. Auth not required for writes.
 */
export async function setObject<T>(
  key: string,
  value: T,
  options?: SecureStorageOptions
): Promise<void> {
  await setItem(key, JSON.stringify(value), options);
}

/**
 * Retrieve and parse a JSON object. Requires auth.
 *
 * @returns The parsed object, or `null` if the key doesn't exist.
 */
export async function getObject<T>(
  key: string,
  options?: SecureStorageOptions
): Promise<T | null> {
  const raw = await getItem(key, options);
  if (raw === null) return null;
  return JSON.parse(raw) as T;
}