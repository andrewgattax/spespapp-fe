import React from 'react';
import "@/global.css"

import {UserProvider} from "@/context/UserContext";
import {Stack} from "expo-router";

export default function TabLayout() {

  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="newlogin" options={{ title: "Login", headerShown: false }} />
        <Stack.Screen name="configure-device" options={{ title: 'Configure Device', headerShown: true }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
