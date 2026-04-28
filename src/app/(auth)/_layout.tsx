import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AuthGuard from '@/utils/auth-guard';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  return (
    <>
      <AnimatedSplashOverlay/>
      <AuthGuard>
        <Stack screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="(tabs)" options={{ title: '' }} />
          <Stack.Screen name="settings" options={{ headerShown: true }} />
          <Stack.Screen name="about" options={{ headerShown: true }} />
          <Stack.Screen name="device-id" options={{ headerShown: true }} />
        </Stack>
      </AuthGuard>
    </>
  );
}
