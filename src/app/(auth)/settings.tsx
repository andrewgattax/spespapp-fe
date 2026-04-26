import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import {
  generateKeyPair,
  hasKeys,
  storePrivateKey,
  storePublicKey,
  storeUsername,
  getPublicKeyBase64,
  getUsername,
  resetKeys,
} from '@/utils/keyManager';
import {authenticate, AuthenticationCanceled} from '@/utils/secureStorage';
import {useUser} from "@/context/UserContext";

type ActionState = 'idle' | 'regenerating' | 'resetting';

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [username, setUsername] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [state, setState] = useState<ActionState>('idle');
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { logout, checkRegistrationStatus } = useUser()

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [storedUsername, storedPublicKey] = await Promise.all([
        getUsername(),
        getPublicKeyBase64(),
      ]);
      setUsername(storedUsername);
      setPublicKey(storedPublicKey);
      setNewUsername(storedUsername || '');
    } catch (e) {
      if (e instanceof AuthenticationCanceled) {
        // User cancelled auth - redirect to register
        router.replace('/register');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateKeys = async () => {
    if (!newUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    Alert.alert(
      'Regenerate Keys',
      'This will generate new cryptographic keys and replace your existing ones. Your old keys will be permanently lost. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {

              await authenticate("Autenticazione richiesta")

              setState('regenerating');
              setError('');

              // Generate new key pair
              const keys = await generateKeyPair();

              // Store new keys
              await storePrivateKey(keys.private);
              await storePublicKey(keys.publicBase64);
              await storeUsername(newUsername.trim());

              // Update state
              setUsername(newUsername.trim());
              setPublicKey(keys.publicBase64);

              await checkRegistrationStatus()

              //todo copia chiave pubblica prima di logout
              Alert.alert(
                'Success',
                'Your keys have been regenerated successfully!'
              );
            } catch (e) {
              if(!(e instanceof AuthenticationCanceled)) {
                setError(e instanceof Error ? e.message : 'Failed to regenerate keys');
              }
            } finally {
              setState('idle');
            }
          },
        },
      ]
    );
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset All Keys',
      'This will permanently delete your private key, public key, and username. You will need to register again to use the app. This action cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setState('resetting');
              setError('');

              await authenticate("Autenticazione richiesta")

              await resetKeys();

              await checkRegistrationStatus();

              Alert.alert(
                'Reset Complete',
                'All your keys have been deleted. You will now be redirected to registration.',
                [
                  {
                    text: 'OK',
                    onPress: () => logout(),
                  },
                ]
              );
            } catch (e) {
              if(!(e instanceof AuthenticationCanceled)) {
                setError(e instanceof Error ? e.message : 'Failed to reset keys');
              }
              setState('idle');
            }
          },
        },
      ]
    );
  };

  const handleCopyPublicKey = async () => {
    if (!publicKey) return;
    try {
      await Clipboard.setStringAsync(publicKey);
      Alert.alert('Copied', 'Public key copied to clipboard');
    } catch (e) {
      Alert.alert('Copy failed', 'Failed to copy to clipboard');
    }
  };

  const handleCopyUsername = async () => {
    if (!username) return;
    try {
      await Clipboard.setStringAsync(username);
      Alert.alert('Copied', 'Username copied to clipboard');
    } catch (e) {
      Alert.alert('Copy failed', 'Failed to copy to clipboard');
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText} themeColor="textSecondary">
          Loading your data...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.six,
          paddingBottom: safeAreaInsets.bottom + Spacing.six,
        },
      ]}>
      <ThemedView style={styles.mainContainer}>
        <ThemedText style={styles.title} type="title">
          Settings
        </ThemedText>

        {error ? (
          <ThemedText style={styles.errorText} themeColor="textSecondary">
            {error}
          </ThemedText>
        ) : null}

        {/* User Info Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Identity</ThemedText>

          <ThemedView style={styles.infoCard}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Username:</ThemedText>
              <ThemedView style={styles.valueContainer}>
                <ThemedText style={styles.value}>{username}</ThemedText>
                <Pressable
                  style={({ pressed }) => [
                    styles.copyButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleCopyUsername}>
                  <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.keySectionTitle}>Public Key:</ThemedText>
            <ThemedView style={styles.keyPreviewContainer}>
              <ThemedText style={styles.keyPreview} themeColor="textSecondary">
                {publicKey ? `${publicKey.slice(0, 50)}...` : 'N/A'}
              </ThemedText>
            </ThemedView>
            <Pressable
              style={({ pressed }) => [
                styles.fullButton,
                pressed && styles.pressed,
              ]}
              onPress={handleCopyPublicKey}>
              <ThemedView
                type="backgroundElement"
                style={styles.fullButtonContent}>
                <ThemedText style={styles.fullButtonText}>Copy Full Public Key</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {/* Key Management Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Key Management</ThemedText>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              New Username (for regeneration)
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: '#ccc' }]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={handleRegenerateKeys}
            disabled={state !== 'idle'}>
            <ThemedView
              type="backgroundElement"
              style={[styles.buttonContent, styles.regenerateButton]}>
              {state === 'regenerating' ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText} type="link">
                  Regenerate Keys
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={handleReset}
            disabled={state !== 'idle'}>
            <ThemedView
              type="backgroundElement"
              style={[styles.buttonContent, styles.resetButton]}>
              {state === 'resetting' ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText} type="link">
                  Reset All Keys
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>

          <ThemedText style={styles.warningText} themeColor="textSecondary">
            Warning: Regenerating keys will replace your existing keys. Resetting
            will delete everything and you'll need to register again.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#ff6b6b20',
    borderRadius: Spacing.two,
    color: '#ff6b6b',
  },
  section: {
    width: '100%',
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: Spacing.two,
  },
  infoRow: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  copyButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: '#007AFF',
    borderRadius: Spacing.two,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  keySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  keyPreviewContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  keyPreview: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  fullButton: {
    borderRadius: Spacing.two,
  },
  fullButtonContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#007AFF',
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  fullButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.five,
    minWidth: 200,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.five,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  regenerateButton: {
    backgroundColor: '#FF9500',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    color: '#666',
    fontStyle: 'italic',
  },
});
