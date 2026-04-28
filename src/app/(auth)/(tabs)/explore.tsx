import React, { useState } from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUser } from '@/context/UserContext';
import { setSecureItem, getSecureItem } from "@/utils/secureStorage"

export const options = {
  headerShown: false,
};

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useUser();

  const [success, setSuccess] = useState("");

  const setSecure = async () => {
    await setSecureItem("secureItem", "sesso", {
      authPrompt: "Sesso protected",
      skipAuth: false
    })
    setSuccess("Secure item set")
  }

  const getSecure = async () => {
    const value = await getSecureItem("secureItem", {
      authPrompt: "Prendi il sesso",
      skipAuth: false
    })
    console.log("Secure item value:", value)
    setSuccess(`Secure item value: ${value}`)
  }

  return (
      <View style={styles.centerContainer}>
        {user ? (
          <ThemedText style={styles.welcomeText} type="subtitle">
            Welcome, {user.username}!
          </ThemedText>
        ) : null}

        {success ? (
          <ThemedText style={styles.successText} themeColor="textSecondary">
            {success}
          </ThemedText>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
          onPress={logout}>
          <ThemedView
            type="backgroundElement"
            style={[styles.buttonContent, styles.logoutButtonBackground]}>
            <ThemedText style={styles.buttonText} type="link">
              Logout
            </ThemedText>
          </ThemedView>
        </Pressable>
      </View>
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    color: '#ff6b6b',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    color: '#4cd964',
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonBackground: {
    backgroundColor: '#007AFF',
  },
  logoutButtonBackground: {
    backgroundColor: '#FF3B30',
  },
  secureButtonBackground: {
    backgroundColor: '#5856D6',
  },
  aboutButtonBackground: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
  },
});
