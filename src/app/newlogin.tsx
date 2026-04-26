import React from 'react';
import {View, StyleSheet} from "react-native";
import {useGlobalStyles} from "@/hooks/use-global-style";

function Newlogin() {

  const globalStyle = useGlobalStyles();

  return (
    <View style={globalStyle.pageContainer}>

    </View>
  );
}

const styles = StyleSheet.create({

})

export default Newlogin;