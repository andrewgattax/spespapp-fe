import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {Entypo, Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {lineHeight, Spacing} from "@/constants/theme";
import {Button} from "@/components/button";
import {PageHero} from "@/components/page-hero";
import {
  generateKeyPair, getDeviceId,
  hasKeys,
  storeDeviceId,
  storePrivateKey,
  storePublicKey,
  storeUsername
} from "@/utils/keyManager";
import {useUser} from "@/context/UserContext";
import {router} from "expo-router";
import {SubPageHeader} from "@/components/subpage-header";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {userService} from "@/api";

function ResetDeviceName() {
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if(deviceName.trim()) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [deviceName]);

  const {checkRegistrationStatus} = useUser()

  const theme = useTheme();
  const globalStyles = useGlobalStyles()
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
    pageContainer: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: Spacing.six,
    },
    errorTitle: {
      marginTop: Spacing.two,
      maxWidth: 256,
      textAlign: "center",
      lineHeight: lineHeight.big,
      color: theme.destructive,
      fontWeight: "400"
    },
    entraButton: {
      backgroundColor: theme.primary,
      width: "100%",
      color: theme.foreground
    },
    inputContainer: {
      gap: Spacing.two
    },
    inputLabel: {
      color: theme.textMuted + 90,
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14
    },
    inputWrapper: {
      shadowColor: "#000",
      shadowOffset: {
        width: 1,
        height: 2,
      },
      borderRadius: 12,
      shadowOpacity: 0.15,
      shadowRadius: 1.84,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.textMuted + '30',
      ...Platform.select({
        android: {
          elevation: 5,
        }
      })
    },
    input: {
      padding: Spacing.four,
      borderRadius: 12,
    }
  }), [theme])

  useEffect(() => {
    const loadData = async () => {
      let deviceId = await getDeviceId(true)
      setDeviceName(deviceId || "")
    }
    loadData();
  }, []);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const previousDeviceId = await getDeviceId(true);

      await userService.updateDeviceId({
        previousDeviceId: previousDeviceId!,
        newDeviceId: deviceName
      })

      // Store device ID
      await storeDeviceId(deviceName.trim(), true);

      await checkRegistrationStatus();

      router.replace("/user-settings");

    } catch (e) {
      setError(e instanceof Error ? e.message : 'ma dioporco');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SubPageHeader title={"Nome Dispositivo"} />
      <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollView]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={60}
    >
      <PageHero
        icon={<Feather name={"smartphone"} size={64} color={"#2B7EFF"} />}
        title="Nome Dispositivo"
        subtitle={!error ? "Cambia il nome del tuo dispositivo." : undefined}
        borderColor={"#2B7EFF" + 50}
        backgroundColor={"#2B7EFF" + 20}
      />
      {error && (
        <Text style={styles.errorTitle}>{error}</Text>
      )}

      <View style={globalStyles.colContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Device Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholderTextColor={theme.textMuted + 50}
              placeholder="e.g. iPhone di coglionefrocio"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>

      <View style={globalStyles.colContainer}>
        <Button title={"Conferma"} onPress={handleConfirm} variant={"filled"} primaryColor={"#2B7EFF"} loading={loading} disabled={disabled}></Button>
      </View>
    </KeyboardAwareScrollView></>
  );
}

export default ResetDeviceName;