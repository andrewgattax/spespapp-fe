import React from 'react';
import "@/global.css"

import {UserProvider} from "@/context/UserContext";
import {Stack} from "expo-router";

export default function TabLayout() {

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
