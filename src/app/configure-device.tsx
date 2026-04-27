import React, {useMemo, useState} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {lineHeight, Spacing} from "@/constants/theme";

function ConfigureDevice() {
  const [username, setUsername] = useState("");
  const [deviceName, setDeviceName] = useState("");

  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollView: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.six,
      paddingBottom: Spacing.six,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    pageContainer: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: Spacing.six,
    },
    mainIconContainer: {
      backgroundColor: theme.textSecondary,
      padding: Spacing.four,
      borderRadius: Spacing.four
    },
    mainTitle: {
      fontSize: Spacing.four,
      fontWeight: "600",
      marginTop: Spacing.five
    },
    secondTitle: {
      marginTop: Spacing.two,
      maxWidth: 256,
      textAlign: "center",
      lineHeight: lineHeight.big,
      color: theme.textMuted,
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

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollView]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={60}
    >
      <View style={styles.mainIconContainer}>
        <MaterialCommunityIcons
          name={"cellphone-cog"}
          color={theme.textMuted}
          size={64}
        />
      </View>
      <Text style={styles.mainTitle} className={"text-center"}>Configura Dispositivo</Text>
      <Text style={styles.secondTitle}>Inserisci i tuoi dati per la configurazione.</Text>

      <View className={"w-full gap-4"}>
        <View style={styles.inputContainer} className={"flex"}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWrapper} className={"w-full"}>
            <TextInput
              style={styles.input}
              className={"w-full"}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={theme.textMuted + 50}
              placeholder="e.g. coglionefrocio"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer} className={"flex"}>
          <Text style={styles.inputLabel}>Device Name</Text>
          <View style={styles.inputWrapper} className={"w-full"}>
            <TextInput
              style={styles.input}
              className={"w-full"}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholderTextColor={theme.textMuted + 50}
              placeholder="e.g. iPhone di coglionefrocio"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

export default ConfigureDevice;