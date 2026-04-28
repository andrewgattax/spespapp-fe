import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {Entypo, MaterialCommunityIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {lineHeight, Spacing} from "@/constants/theme";
import {Button} from "@/components/button";
import {PageHero} from "@/components/page-hero";
import {
  generateKeyPair,
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

function ConfigureDevice() {
  const [username, setUsername] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if(username.trim() && deviceName.trim()) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [username, deviceName]);

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

  const handleConfirm = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!deviceName.trim()) {
      setError('Please enter a device ID');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Check if keys already exist
      const keysExist = await hasKeys();
      if (keysExist) {
        // Ask for confirmation to overwrite existing keys
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Già registrato',
            'Hai gia delle chiavi registrate, vuoi rigenerarle?',
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
      }

      // Generate RSA key pair
      const keys = await generateKeyPair();

      // Store private key securely
      await storePrivateKey(keys.private);

      // Store public key locally
      await storePublicKey(keys.publicBase64);

      // Store username
      await storeUsername(username.trim());

      // Store device ID
      await storeDeviceId(deviceName.trim(), true);

      // Show success state
      await storePublicKey(keys.publicBase64);
      await checkRegistrationStatus();
      console.log("Public Key: ", keys.publicBase64)
      router.replace("/complete-configuration");
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ma dioporco');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SubPageHeader title={"Configura"} />
      <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollView]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={60}
    >
      <PageHero
        icon={<Entypo name={"cog"} color={theme.textMuted} size={64} />}
        title="Configura Dispositivo"
        subtitle={!error ? "Inserisci i tuoi dati per la configurazione." : undefined}
      />
      {error && (
        <Text style={styles.errorTitle}>{error}</Text>
      )}

      <View style={globalStyles.colContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={theme.textMuted + 50}
              placeholder="e.g. coglionefrocio"
              autoCapitalize="none"
            />
          </View>
        </View>

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
        <Button title={"Conferma"} onPress={handleConfirm} loading={loading} disabled={disabled}></Button>
      </View>
    </KeyboardAwareScrollView></>
  );
}

export default ConfigureDevice;