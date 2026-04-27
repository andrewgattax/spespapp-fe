import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import {router, Stack} from 'expo-router';

import { useUser } from '@/context/UserContext';
import { Colors } from '@/constants/theme';

export default function AuthGuard() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/newlogin');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // When authenticated, render the Expo Router file-based routes
  return <Stack />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
