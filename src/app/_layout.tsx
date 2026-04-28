import React from 'react';
import "@/global.css"

import {UserProvider} from "@/context/UserContext";
import {Stack} from "expo-router";
import {KeyboardProvider} from "react-native-keyboard-controller";

export default function TabLayout() {

  return (
    <KeyboardProvider >
      <UserProvider>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="newlogin" options={{ title: "Login", headerShown: false }} />
          <Stack.Screen name="configure-device" options={{ title: 'Configure', headerShown: true }} />
          <Stack.Screen name="complete-configuration" options={{ title: 'Completa', headerShown: true }} />
        </Stack>
      </UserProvider>
    </KeyboardProvider>
  );
}
