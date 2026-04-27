import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, Linking} from "react-native";

import {useGlobalStyles} from "@/hooks/use-global-style";
import {useTheme} from "@/hooks/use-theme";

import {FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import {Spacing} from "@/constants/theme";
import {getUsername, getPublicKeyBase64} from "@/utils/keyManager";
import {router} from "expo-router";
import {Button} from "@/components/button";
import * as Clipboard from 'expo-clipboard';

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
    },
    mainIconContainer: {
      backgroundColor: theme.secondary,
      padding: Spacing.five,
      borderRadius: Spacing.five + 10
    },
    mainTitle: {
      fontSize: Spacing.five,
      fontWeight: "600",
      marginTop: Spacing.five
    },
    secondTitle: {
      marginTop: Spacing.two,
      maxWidth: 300,
      textAlign: "center",
      color: theme.textMuted,
      fontWeight: "400"
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
      <View style={styles.mainIconContainer}>
        <MaterialCommunityIcons
          name={"check-circle"}
          size={40}
          color={theme.primary}
        />
      </View>
      <Text style={styles.mainTitle}>Letsgo!</Text>
      <Text style={styles.secondTitle}>
        Il tuo dispositivo è stato configurato per <Text style={{fontWeight: "bold"}}>{username}</Text>, una nuova coppia di chiavi è stata generata
      </Text>

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