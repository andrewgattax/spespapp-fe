import React, {useMemo} from 'react';
import {View, StyleSheet, Text, TextInput, Pressable, TouchableOpacity} from "react-native";

import {useGlobalStyles} from "@/hooks/use-global-style";
import {useTheme} from "@/hooks/use-theme";

import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import {Spacing} from "@/constants/theme";


function Newlogin() {

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
      borderRadius: Spacing.four
    },
    mainTitle: {
      fontSize: Spacing.five,
      fontWeight: "600",
      marginTop: Spacing.five
    },
    secondTitle: {
      marginTop: Spacing.two,
      color: theme.textMuted,
      fontWeight: "400"
    },
    entraButton: {
      backgroundColor: theme.primary,
      width: "100%",
      color: theme.foreground
    }
  }), [theme])

  const onPressed = () => {
    console.log("porcodio")
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
      <Text style={styles.mainTitle} className={""}>SpespApp</Text>
      <Text style={styles.secondTitle}>Compra il cibo per quel coglione.</Text>
      <View className={"w-full mt-12 gap-4"}>
        <TouchableOpacity
          className={"w-full bg-primary p-6 rounded-2xl"}
          onPress={onPressed}
        >
          <Text className={"text-foreground text-center text-lg font-bold"}>Entra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={"w-full border border-text-muted p-6 rounded-2xl"}
        >
          <View className={"flex flex-row justify-center items-center gap-2"}>
            <MaterialCommunityIcons name={"cellphone-cog"} size={24} color={theme.textMuted}/>
            <Text className={"text-text-muted text-lg font-bold"}>Configura Dispositivo</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default Newlogin;