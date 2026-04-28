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
          <Stack.Screen name="settings"  />
          <Stack.Screen name="about"  />
          <Stack.Screen name="device-id"  />
          <Stack.Screen name="user-settings" />
        </Stack>
      </AuthGuard>
    </>
  );
}
