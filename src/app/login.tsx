import React, {useMemo, useState} from 'react';
import {View, StyleSheet, Text, TextInput, Pressable, TouchableOpacity, ActivityIndicator} from "react-native";

import {useGlobalStyles} from "@/hooks/use-global-style";
import {useTheme} from "@/hooks/use-theme";

import {Entypo, FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons"
import {Spacing} from "@/constants/theme";
import {ApiError, userService} from "@/api";
import {useUser} from "@/context/UserContext";
import {router} from "expo-router";
import {Button} from "@/components/button";


function Login() {
  const globalStyle = useGlobalStyles();
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    pageContainer: {
      justifyContent: "center",
      alignItems: "center"
    },
    mainIconContainer: {
      backgroundColor: theme.secondary,
      padding: Spacing.four,
      borderRadius: Spacing.five + 10
    },
    mainTitle: {
      fontSize: Spacing.five,
      fontWeight: "600",
      marginTop: Spacing.five,
      color: theme.text
    },
    secondTitle: {
      marginTop: Spacing.two,
      color: theme.textMuted,
      fontWeight: "400"
    },
    errorTitle: {
      marginTop: Spacing.two,
      color: theme.destructive,
      fontWeight: "400"
    },
    entraButton: {
      backgroundColor: theme.primary,
      width: "100%",
      color: theme.foreground
    }
  }), [theme])

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {loadFromJwt, user} = useUser()

  const handleLogin = async () => {
    setError("");
    setLoading(true)
    try {
      const response = await userService.login()
      console.log("Login successful")
      await loadFromJwt(response.authToken)
      router.replace("/")
    } catch (e) {
      console.error(e)
      if(e instanceof ApiError) {
        setError(e.payload.message)
      } else {
        setError(e instanceof Error ? e.message : "Errore sconosciuto")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[globalStyle.pageContainer, styles.pageContainer]}>
      <View style={styles.mainIconContainer}>
        <FontAwesome5
          name={"shopping-basket"}
          size={64}
          color={theme.primary}
        />
      </View>
      <Text style={styles.mainTitle}>SpespApp</Text>
      <Text style={styles.secondTitle}>Compra il cibo per quel coglione.</Text>

      <View style={globalStyle.colContainer}>
        {error && (
          <Text style={styles.errorTitle} >{error}</Text>
        )}
        <Button
          title="Entra"
          onPress={handleLogin}
          loading={loading}
        />
        <Button
          title="Configura"
          onPress={() => {router.push("/configure-device")}}
          variant="outlined"
          icon={<Entypo name={"cog"} size={24} color={theme.textMuted}/>}
        />
      </View>
    </View>
  );
}


export default Login;