import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AboutScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

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
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          About This App
        </ThemedText>

        <ThemedText style={styles.text}>
          This is a non-tab page! You can only reach it by navigating directly.
        </ThemedText>

        <ThemedText style={styles.text}>
          Notice that there's no tab bar at the bottom - that's because this
          page isn't part of the tab navigation.
        </ThemedText>

        <ThemedText style={styles.subTitle}>
          Fun Facts:
        </ThemedText>

        <ThemedText style={styles.bullet}>
          • This page is in src/app/about.tsx
        </ThemedText>

        <ThemedText style={styles.bullet}>
          • It's NOT listed in app-tabs.tsx
        </ThemedText>

        <ThemedText style={styles.bullet}>
          • You can still access it via router.push('/about')
        </ThemedText>

        <ThemedText style={styles.bullet}>
          • Protected by AuthGuard (must be logged in)
        </ThemedText>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.back()}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </Pressable>
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
  content: {
    padding: Spacing.four,
  },
  title: {
    marginBottom: Spacing.four,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.six,
    marginBottom: Spacing.three,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.three,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: Spacing.four,
    marginBottom: Spacing.two,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.eight,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
