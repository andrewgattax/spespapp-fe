import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const { loadFromJwt, registeredUsername, resetRegistration } = useUser();

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

  const handleResetRegistration = () => {
    Alert.alert(
      'Reset Registration',
      'Are you sure you want to reset your registration? This will delete your cryptographic keys, username, and all data. This action cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetRegistration();
              Alert.alert('Success', 'Registration has been reset successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset registration. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
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

      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          { bottom: safeAreaInsets.bottom + Spacing.four },
          pressed && styles.pressed,
        ]}
        onPress={handleResetRegistration}>
        <View style={styles.resetButtonContent}>
          <Ionicons name="trash-outline" size={24} color="#ffffff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  resetButton: {
    position: 'absolute',
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetButtonContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
