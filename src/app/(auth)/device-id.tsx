import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { getDeviceId, storeDeviceId } from "@/utils/keyManager"
import { userService, ApiError } from "@/api"
import type { UpdateDeviceIdRequest } from "@/api/types"

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { authenticate, AuthenticationCanceled } from '@/utils/secureStorage';

export default function DeviceIdScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [deviceId, setDeviceId] = useState<string>("");
  const [newDeviceId, setNewDeviceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDeviceId();
  }, []);

  const loadDeviceId = async () => {
    try {
      setIsLoading(true);
      const storedDeviceId = await getDeviceId(true);
      setDeviceId(storedDeviceId);
    } catch (e) {
      if (e instanceof AuthenticationCanceled) {
        // User cancelled auth - redirect to register
        router.replace('/register');
        return;
      }
      Alert.alert("Error", e instanceof Error ? e.message : 'Failed to load device ID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeviceId = async () => {
    if (!newDeviceId.trim()) {
      Alert.alert("Error", "Please enter a new device ID");
      return;
    }

    try {
      setIsSubmitting(true);
      let body: UpdateDeviceIdRequest = {
        previousDeviceId: deviceId,
        newDeviceId: newDeviceId.trim()
      }

      await userService.updateDeviceId(body)
      await storeDeviceId(newDeviceId.trim())
      setDeviceId(newDeviceId.trim())
      setNewDeviceId("")

      Alert.alert("Success", "Device ID updated successfully!");
    } catch (e) {
      if(e instanceof ApiError) {
        Alert.alert("Error", e.payload.message)
      } else {
        Alert.alert("Error", "Failed to update device id")
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText} themeColor="textSecondary">
          Loading device ID...
        </ThemedText>
      </View>
    );
  }

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
      <ThemedView style={styles.mainContainer}>
        <ThemedText style={styles.title} type="title">
          Device ID Management
        </ThemedText>

        {/* Current Device ID Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Current Device ID</ThemedText>
          <ThemedView style={styles.infoCard}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Device ID:</ThemedText>
              <ThemedView style={styles.valueContainer}>
                <ThemedText style={styles.value}>{deviceId}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Update Device ID Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Update Device ID</ThemedText>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              New Device ID
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: '#ccc' }]}
              value={newDeviceId}
              onChangeText={setNewDeviceId}
              placeholder="Enter new device ID"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <Pressable
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
            ]}
            onPress={handleUpdateDeviceId}>
            <ThemedView
              type="backgroundElement"
              style={[styles.buttonContent, styles.updateButton]}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText} type="link">
                  Update Device ID
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>
        </ThemedView>

        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}>
          <ThemedView
            type="backgroundElement"
            style={[styles.buttonContent, styles.backButton]}>
            <ThemedText style={styles.buttonText} type="link">
              Back to Settings
            </ThemedText>
          </ThemedView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    width: '100%',
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: Spacing.two,
  },
  infoRow: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.five,
    minWidth: 200,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.five,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});
