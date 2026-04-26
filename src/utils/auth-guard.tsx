import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { useUser } from '@/context/UserContext';
import { Colors } from '@/constants/theme';
import LoginScreen from '@/app/login';

export default function AuthGuard() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // When authenticated, render the Expo Router file-based routes
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
