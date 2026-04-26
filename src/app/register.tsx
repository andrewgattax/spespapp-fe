import React, { useState } from 'react';
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
import * as Sharing from 'expo-sharing';

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
} from '@/utils/keyManager';
import {useUser} from "@/context/UserContext";

type RegistrationState = 'input' | 'generating' | 'success';

export default function RegisterScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [state, setState] = useState<RegistrationState>('input');
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const {checkRegistrationStatus} = useUser()

  const handleGenerateKeys = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setState('generating');
      setError('');

      // Check if keys already exist
      const keysExist = await hasKeys();
      if (keysExist) {
        // Ask for confirmation to overwrite existing keys
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Already Registered',
            'You already have cryptographic keys. Do you want to overwrite them? This will replace your existing private key, public key, and username.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Overwrite',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ]
          );
        });

        if (!shouldContinue) {
          setState('input');
          return;
        }
      }

      // Generate RSA key pair
      const keys = await generateKeyPair();

      console.log("Private key: ")
      console.log(keys.private)

      console.log("Public key: ")
      console.log(keys.publicBase64)

      // Store private key securely
      await storePrivateKey(keys.private);

      // Store public key locally
      await storePublicKey(keys.publicBase64);

      // Store username
      await storeUsername(username.trim());

      // Show success state
      setPublicKey(keys.publicBase64);
      await checkRegistrationStatus();
      setState('success');
    } catch (e) {
      setState('input');
      setError(e instanceof Error ? e.message : 'Failed to generate keys');
    }
  };

  const handleSharePublicKey = async () => {
    try {
      // Create a text file with the public key info
      const fileContent = `Username: ${username.trim()}\nPublic Key (Base64):\n${publicKey}`;

      // Copy to clipboard as a fallback
      await Clipboard.setStringAsync(fileContent);

      // Show instructions
      Alert.alert(
        'Public Key Ready',
        'Your public key has been copied to clipboard. You can now paste it anywhere you want to share it.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : 'Failed to share public key');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(publicKey);
      Alert.alert('Copied', 'Public key copied to clipboard');
    } catch (e) {
      Alert.alert('Copy failed', 'Failed to copy to clipboard');
    }
  };

  const handleContinue = () => {
    router.replace('/');
  };

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
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.title} type="title">
          {state === 'success' ? 'Registration Complete!' : 'Create Your Identity'}
        </ThemedText>

        {state === 'input' && (
          <>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              Enter a username to generate your cryptographic keys
            </ThemedText>

            {error ? (
              <ThemedText style={styles.errorText} themeColor="textSecondary">
                {error}
              </ThemedText>
            ) : null}

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Username</ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: '#ccc' }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={handleGenerateKeys}>
              <ThemedView
                type="backgroundElement"
                style={[styles.buttonContent, styles.primaryButton]}>
                <ThemedText style={styles.buttonText} type="link">
                  Generate Keys
                </ThemedText>
              </ThemedView>
            </Pressable>
          </>
        )}

        {state === 'generating' && (
          <>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              Generating your cryptographic keys...
            </ThemedText>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.infoText} themeColor="textSecondary">
              This may take a few seconds
            </ThemedText>
          </>
        )}

        {state === 'success' && (
          <>
            <ThemedText style={styles.successText} themeColor="textSecondary">
              Your keys have been generated successfully!
            </ThemedText>

            <ThemedView style={styles.userInfoContainer}>
              <ThemedText style={styles.infoLabel}>Username:</ThemedText>
              <ThemedText style={styles.infoValue}>{username}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.keyContainer}>
              <ThemedText style={styles.keyLabel}>Your Public Key:</ThemedText>
              <ThemedView style={styles.keyPreviewContainer}>
                <ThemedText style={styles.keyPreview} themeColor="textSecondary">
                  {publicKey.slice(0, 50)}...
                </ThemedText>
              </ThemedView>
              <Pressable
                style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
                onPress={handleCopyToClipboard}>
                <ThemedView type="backgroundElement" style={styles.smallButtonContent}>
                  <ThemedText style={styles.smallButtonText}>Copy Full Key</ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>

            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                onPress={handleSharePublicKey}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.buttonContent, styles.shareButton]}>
                  <ThemedText style={styles.buttonText} type="link">
                    Share Public Key
                  </ThemedText>
                </ThemedView>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                onPress={handleContinue}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.buttonContent, styles.continueButton]}>
                  <ThemedText style={styles.buttonText} type="link">
                    Continue
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>

            <ThemedText style={styles.warningText} themeColor="textSecondary">
              Important: Share your public key with others so they can verify your signature.
              Keep your private key secure - never share it!
            </ThemedText>
          </>
        )}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
  successText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#51cf6620',
    borderRadius: Spacing.two,
    color: '#51cf66',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
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
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  continueButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  userInfoContainer: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: Spacing.two,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  keyContainer: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: Spacing.two,
  },
  keyLabel: {
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
  buttonGroup: {
    width: '100%',
    gap: Spacing.three,
  },
  smallButton: {
    borderRadius: Spacing.two,
  },
  smallButtonContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: '#007AFF',
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    color: '#666',
  },
});
