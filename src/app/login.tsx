import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, userService } from '@/api';
import { useUser } from '@/context/UserContext';
import {AuthenticationCanceled} from "@/utils/secureStorage";

export default function LoginScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { loadFromJwt, registeredUsername } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Use the registered username from registration
      const username = registeredUsername;
      if(!username) {
        setError("Utente non registrato.")
        return
      }
      const response = await userService.login(username);
      await loadFromJwt(response.authToken);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.payload.message);
      } else if (e instanceof AuthenticationCanceled) {
        // console.error("Authentication was canceled by the user.");
      } else {
        console.error(e)
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
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
          Welcome
        </ThemedText>

        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          Sign in to continue
        </ThemedText>

        {error ? (
          <ThemedText style={styles.errorText} themeColor="textSecondary">
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
          onPress={handleLogin}
          disabled={isLoading}>
          <ThemedView
            type="backgroundElement"
            style={[styles.buttonContent, styles.loginButtonBackground]}>
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText style={styles.buttonText} type="link">
                Login
              </ThemedText>
            )}
          </ThemedView>
        </Pressable>

        {!registeredUsername && (
          <Pressable
            style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
            onPress={handleRegister}
            disabled={isLoading}>
            <ThemedView
              type="backgroundElement"
              style={[styles.buttonContent, styles.registerButtonBackground]}>
              <ThemedText style={styles.buttonText} type="link">
                Create Account
              </ThemedText>
            </ThemedView>
          </Pressable>
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
    gap: Spacing.four,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: Spacing.six,
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
  loginButton: {
    borderRadius: Spacing.five,
    minWidth: 200,
  },
  registerButton: {
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
  loginButtonBackground: {
    backgroundColor: '#007AFF',
  },
  registerButtonBackground: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});
