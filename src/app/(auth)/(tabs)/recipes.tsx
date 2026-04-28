import React from 'react';
import {ScrollView, Text, View} from "react-native";
import {useTheme} from "@/hooks/use-theme";

export const options = {
  headerShown: false,
};

function Recipes() {

  const theme = useTheme()

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.background
    }}>

      <Text className={"mt-24"}>Sos</Text>
    </View>
  );
}

export default Recipes;