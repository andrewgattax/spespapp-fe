import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from "react-native";
import {Entypo, Feather, FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";
import {SubPageHeader} from "@/components/subpage-header";
import {PageHero} from "@/components/page-hero";
import {useUser} from "@/context/UserContext";
import {ButtonCard, ButtonCardGroup} from "@/components/button-card";
import {Button} from "@/components/button";

function UserSettings() {
  const theme = useTheme();
  const {user} = useUser();

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
    label: {
      color: theme.textMuted + 90,
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14
    },

  }), [theme]);

  return (
    <>
      <SubPageHeader title={"Impostazioni"}/>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollView]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={60}
      >
        <PageHero
          icon={<MaterialCommunityIcons name={"account-cog"} color={theme.primary} size={64} />}
          title={user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Utente"}
          subtitle="Impostazioni e Sicurezza"
          variant="primary"
        />
        <View style={{
          width: "100%",
          marginTop: Spacing.five,
          gap: Spacing.four
        }}>
         <Text style={styles.label}>Gestione dispositivo</Text>
          <ButtonCard
            icon={<Feather name={"smartphone"} size={20} color={"#2B7EFF"} />}
            text="Nome dispositivo"
            onPress={() => {}}
            showArrow={true}
          />
         <Text style={styles.label}>Chiavi di sicurezza</Text>
          <ButtonCardGroup>
            <ButtonCard
              iconBackgroundColor={"#FAF5FF"}
              icon={<MaterialCommunityIcons name={"share-variant"} size={20} color={"#AD46FF"} />}
              text="Condividi Chiave Pubblica"
              onPress={() => {}}
            />
            <ButtonCard
              iconBackgroundColor={"#FFFBEA"}
              icon={<FontAwesome6 name={"arrows-rotate"} size={20} color={"#FD9900"} />}
              text="Rigenera Chiave Pubblica"
              onPress={() => {}}
            />
            <ButtonCard
              iconBackgroundColor={"#FEF2F3"}
              icon={<Feather name={"trash"} size={20} color={"#FE6569"} />}
              text="Resetta Configurazione"
              onPress={() => {}}
            />
          </ButtonCardGroup>
        </View>
        <View style={{
          marginTop: Spacing.five,
          width: "100%"
        }}>
          <Button
            variant={"outlined"}
            icon={<MaterialIcons name={"logout"} size={24} color={theme.textMuted}/>}
            title={"Logout"}
            onPress={() => {}}
          />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

export default UserSettings;