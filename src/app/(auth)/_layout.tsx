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
          <Stack.Screen name="user-settings" />
          <Stack.Screen name="reset-device-name" />
        </Stack>
      </AuthGuard>
    </>
  );
}
