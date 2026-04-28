import React from 'react';
import "@/global.css"

import {UserProvider} from "@/context/UserContext";
import {Stack} from "expo-router";
import {KeyboardProvider} from "react-native-keyboard-controller";

export default function TabLayout() {

  return (
    <KeyboardProvider >
      <UserProvider>
        <Stack screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="newlogin"/>
          <Stack.Screen name="configure-device"/>
          <Stack.Screen name="complete-configuration"/>
        </Stack>
      </UserProvider>
    </KeyboardProvider>
  );
}
