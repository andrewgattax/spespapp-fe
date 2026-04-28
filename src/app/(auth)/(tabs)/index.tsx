import {useTheme} from "@/hooks/use-theme";
import React, {useMemo, useState} from "react";
import {Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {lineHeight, Spacing} from "@/constants/theme";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {Feather, FontAwesome5} from "@expo/vector-icons"
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {router} from "expo-router";


export default function Lista() {

  const theme = useTheme();
  const safeArea = useSafeAreaInsets();
  const globalStyles = useGlobalStyles()
  const styles = useMemo(() => StyleSheet.create({
    header: {
      backgroundColor: theme.flatBackground,
      paddingHorizontal: Spacing.five,
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: safeArea.top + Spacing.four,
      paddingBottom: Spacing.four,
      gap: Spacing.three
    },
    headerMain: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%"
    },
    headerMainTitle: {
      fontSize: Spacing.four + 5,
      fontWeight: "bold",
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: Spacing.two + 4,
      color: theme.textMuted
    },
    userIconContainer: {
      backgroundColor: theme.textSecondary + 20,
      padding: Spacing.two + 4,
      borderRadius: Spacing.three,
      shadowColor: "#000",
      shadowOffset: {
        width: 1,
        height: 2,
      },
      borderWidth: 1,
      borderColor: theme.textMuted + '30',
      shadowOpacity: 0.15,
      shadowRadius: 1.84,
    },
    inputWrapper: {
      paddingHorizontal: Spacing.three,
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      shadowColor: "#000",
      borderRadius: Spacing.four,
      backgroundColor: theme.textSecondary + 20,
      borderWidth: 1,
      borderColor: theme.textMuted + '30',
      ...Platform.select({
        android: {
          elevation: 5,
        }
      })
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
    input: {
      fontSize: Spacing.two + 6,
      paddingVertical: Spacing.three,
      paddingLeft: Spacing.two,
      borderRadius: 12,
    }

  }), [theme])

  const [searchFilter, setSearchFilter] = useState("");

  return (
    <Pressable style={{flex: 1}} onPress={Keyboard.dismiss}>
      <View style={styles.header}>
      <View style={styles.headerMain}>
        <View>
          <Text style={styles.headerMainTitle}>La Lista</Text>
          <Text style={styles.headerSubtitle}>Hello, username</Text>
        </View>
        <TouchableOpacity
          style={styles.userIconContainer}
          onPress={() => router.push("/settings")}
        >
          <Feather name="user" size={24} color={theme.text}/>
        </TouchableOpacity>
      </View>
        <View style={styles.inputWrapper} className={"w-full"}>
          <Feather name={"search"} size={18} color={theme.textMuted}/>
          <TextInput
            style={styles.input}
            className={"w-full"}
            value={searchFilter}
            onChangeText={setSearchFilter}
            placeholderTextColor={theme.textMuted + 50}
            placeholder="Cerca la tua spesa..."
            autoCapitalize="none"
          />
        </View>
    </View>
      <View style={[globalStyles.pageContainer]}>

      </View>
    </Pressable>
  );
}
