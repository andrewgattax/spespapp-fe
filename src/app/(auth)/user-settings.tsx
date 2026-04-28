import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Linking, StyleSheet, Text, View} from "react-native";
import {Entypo, Feather, FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";
import {SubPageHeader} from "@/components/subpage-header";
import {PageHero} from "@/components/page-hero";
import {useUser} from "@/context/UserContext";
import {ButtonCard, ButtonCardGroup} from "@/components/button-card";
import {Button} from "@/components/button";
import {router} from "expo-router";
import {
  generateKeyPair, getDeviceId,
  getPublicKeyBase64,
  hasKeys, storeDeviceId,
  storePrivateKey,
  storePublicKey,
  storeUsername
} from "@/utils/keyManager";
import * as Clipboard from "expo-clipboard";
import {userService} from "@/api";

function UserSettings() {
  const theme = useTheme();
  const {user} = useUser();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollView: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.six,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    label: {
      color: theme.textMuted + 90,
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14
    },

  }), [theme]);

  const [regenLoading, setRegenLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [publicKey, setPublicKey] = useState("")

  const {logout, checkRegistrationStatus, resetRegistration} = useUser()


  useEffect(() => {
    const loadData = async () => {
      const publicGay = await getPublicKeyBase64()
      const deviceGay = await getDeviceId(true);
      if(deviceGay) {
        setDeviceName(deviceGay)
      }
      if(publicGay) {
        setPublicKey(publicGay)
      }
    }
    loadData();
  }, []);

  const handleSharePublicKey = async () => {
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
  }

  const handleKeyRegen = async () => {
    setRegenLoading(true)
    try {
      // Ask for confirmation to overwrite existing keys
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Attenzione',
          'Questa azione è irreversibile e sovrascriverà le chiavi esistenti. Sei sicuro di voler procedere?',
          [
            {
              text: 'Annulla',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Rigenera',
              style: 'destructive',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!shouldContinue) {
        return;
      }

      // Generate RSA key pair
      const keys = await generateKeyPair();

      await userService.updatePublicKey({
        deviceId: deviceName!,
        publicKeyBase64: keys.publicBase64
      })

      // Store private key securely
      await storePrivateKey(keys.private);

      // Store public key locally
      await storePublicKey(keys.publicBase64);

      checkRegistrationStatus();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore sconosciuto durante la rigenerazione delle chiavi");
    } finally {
      setRegenLoading(false);
    }
  }

  const handleResetConfig = async () => {
    setResetLoading(true)
    try {
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Attenzione',
          'Questa azione è irreversibile, il dispositivo dovrà essere riconfigurato. Sei sicuro di voler procedere?',
          [
            {
              text: 'Annulla',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Resetta',
              style: 'destructive',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!shouldContinue) {
        return;
      }

      await userService.deleteConfig(deviceName!)

      await resetRegistration();

    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore sconosciuto durante la rigenerazione delle chiavi");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <>
      <SubPageHeader title={"Impostazioni"}/>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollView]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={60}
      >
        <PageHero
          icon={<MaterialCommunityIcons name={"account-cog"} color={theme.primary} size={64} />}
          title={user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Utente"}
          subtitle="Impostazioni e Sicurezza"
          borderColor={theme.secondary}
          backgroundColor={theme.secondary + 50}
        />
        <View style={{
          width: "100%",
          marginTop: Spacing.five,
          gap: Spacing.four
        }}>
         <Text style={styles.label}>Gestione dispositivo</Text>
          <ButtonCard
            icon={<Feather name={"smartphone"} size={20} color={"#2B7EFF"} />}
            text="Nome dispositivo"
            onPress={() => {router.push("/reset-device-name")}}
            showArrow={true}
          />
         <Text style={styles.label}>Chiavi di sicurezza</Text>
          <ButtonCardGroup>
            <ButtonCard
              iconBackgroundColor={"#FAF5FF"}
              icon={<MaterialCommunityIcons name={"share-variant"} size={20} color={"#AD46FF"} />}
              text="Condividi Chiave Pubblica"
              onPress={handleSharePublicKey}
            />
            <ButtonCard
              iconBackgroundColor={"#FFFBEA"}
              icon={regenLoading ? (
                <ActivityIndicator size={20} color={"#FD9900"} />
              ) : (
                <FontAwesome6 name={"arrows-rotate"} size={20} color={"#FD9900"} />
              )}
              text="Rigenera Chiave Pubblica"
              onPress={handleKeyRegen}
            />
            <ButtonCard
              iconBackgroundColor={"#FEF2F3"}
              icon={resetLoading ? (
                <ActivityIndicator size={20} color={"#FE6569"} />
              ) : (
                <Feather name={"trash"} size={20} color={"#FE6569"} />
              )}
              text="Resetta Configurazione"
              onPress={handleResetConfig}
            />
          </ButtonCardGroup>
        </View>
        <View style={{
          marginTop: Spacing.five,
          width: "100%"
        }}>
          <Button
            variant={"outlined"}
            icon={<MaterialIcons name={"logout"} size={24} color={theme.textMuted}/>}
            title={"Logout"}
            onPress={logout}
          />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

export default UserSettings;