import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AuthGuard from '@/utils/auth-guard';
import {UserProvider} from "@/context/UserContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <>
      <AnimatedSplashOverlay/>
      <AuthGuard/>
    </>
  );
}
