import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, Linking} from "react-native";

import {useGlobalStyles} from "@/hooks/use-global-style";
import {useTheme} from "@/hooks/use-theme";

import {MaterialCommunityIcons} from "@expo/vector-icons";
import {getUsername, getPublicKeyBase64} from "@/utils/keyManager";
import {router} from "expo-router";
import {Button} from "@/components/button";
import * as Clipboard from 'expo-clipboard';
import {PageHero} from "@/components/page-hero";

function CompleteConfiguration() {
  const [username, setUsername] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const storedUsername = await getUsername();
      const storedPublicKey = await getPublicKeyBase64();
      if (storedUsername) setUsername(storedUsername);
      if (storedPublicKey) setPublicKey(storedPublicKey);
    };
    loadData();
  }, []);

  const globalStyle = useGlobalStyles();
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    pageContainer: {
      justifyContent: "center",
      alignItems: "center"
    }
  }), [theme, username]);

  const handleShareKey = async () => {
    if (publicKey) {
      await Clipboard.setStringAsync(publicKey);
      const message = "tieni coglione \n" + publicKey
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        alert("WhatsApp non è installato sul dispositivo.");
      }
    }
  };

  const handleContinue = () => {
    router.replace("/newlogin");
  };

  return (
    <View style={[globalStyle.pageContainer, styles.pageContainer]}>
      <PageHero
        icon={<MaterialCommunityIcons name={"check-circle"} color={theme.primary} size={64} />}
        title="Letsgo!"
        subtitle={
          <>
            Il tuo dispositivo è stato configurato per <Text style={{fontWeight: "bold"}}>{username}</Text>, una nuova coppia di chiavi è stata generata
          </>
        }
        variant="muted"
      />

      <View className={"w-full mt-12 gap-4"}>
        <Button
          title="Condividi chiave"
          onPress={handleShareKey}
          variant="outlined"
          icon={<MaterialCommunityIcons name={"share-variant"} size={24} color={theme.textMuted}/>}
        />
        <Button
          title="Continua al login"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}


export default CompleteConfiguration;