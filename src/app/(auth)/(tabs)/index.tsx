import {useTheme} from "@/hooks/use-theme";
import React, {useMemo, useState} from "react";
import {Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from "react-native";
import {lineHeight, Spacing} from "@/constants/theme";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {Feather} from "@expo/vector-icons"
import {PageHeader} from "@/components/page-header";
import {useUser} from "@/context/UserContext";


export default function Lista() {

  const theme = useTheme();
  const globalStyles = useGlobalStyles()
  const styles = useMemo(() => StyleSheet.create({
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
  const [loading, setLoading] = useState(false);
  const { user } = useUser()


  return (
    <Pressable style={{flex: 1}} onPress={Keyboard.dismiss}>
      <PageHeader
        title="La Lista"
        subtitle={"Hello, " + (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "utente")}
      >
        <View style={styles.inputWrapper}>
          <Feather name={"search"} size={18} color={theme.textMuted}/>
          <TextInput
            style={styles.input}
            value={searchFilter}
            onChangeText={setSearchFilter}
            placeholderTextColor={theme.textMuted + 50}
            placeholder="Cerca la tua spesa..."
            autoCapitalize="none"
          />
        </View>
      </PageHeader>
      <View style={[globalStyles.pageContainer]}>

      </View>
    </Pressable>
  );
}
