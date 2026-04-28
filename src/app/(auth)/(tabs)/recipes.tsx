import React, {useMemo} from 'react';
import {Pressable, ScrollView, Text, View, StyleSheet} from "react-native";
import {useTheme} from "@/hooks/use-theme";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {Spacing} from "@/constants/theme";
import {PageHeader} from "@/components/page-header";
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import {ButtonCard, ButtonCardGroup} from "@/components/button-card";

export const options = {
  headerShown: false,
};

function Recipes() {

  const theme = useTheme()
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

  return (
    <>
      <PageHeader
      title={"Ricette"}
      subtitle={"Ma che cazzo ci mangiamo"}
      icon={<Feather name="plus" size={24} color={theme.accent}/>}
      iconBorderColor={theme.accent + 30}
      iconBackgroundColor={theme.accent + 10}
      />
      <View style={globalStyles.pageContainer}>
        <ButtonCard
          icon={<MaterialCommunityIcons name="food-halal" size={24} color={theme.accent}/>}
          text={"Ricetta 1"}
          fontWeight={"800"}
          subtitle={"4 ingredienti"}
          showArrow
          iconBackgroundColor={theme.accent + 10}
          onPress={() => {}} />
        {/*<ButtonCardGroup>*/}
        {/*  */}
        {/*</ButtonCardGroup>*/}
      </View>
    </>
  );
}

export default Recipes;