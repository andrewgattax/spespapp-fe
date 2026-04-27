import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AuthGuard from '@/utils/auth-guard';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <>
      <AnimatedSplashOverlay/>
      <AuthGuard/>
    </>
  );
}
