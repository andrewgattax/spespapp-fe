import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import {UserProvider} from "@/context/UserContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <UserProvider>
      <AnimatedSplashOverlay/>
      <AppTabs/>
    </UserProvider>
  );
}
