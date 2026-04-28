import React, {useMemo} from 'react';
import {StyleSheet} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {useTheme} from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";
import {SubPageHeader} from "@/components/subpage-header";
import {PageHero} from "@/components/page-hero";
import {useUser} from "@/context/UserContext";


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
      </KeyboardAwareScrollView>
    </>
  );
}

export default UserSettings;