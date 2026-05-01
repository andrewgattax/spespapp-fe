import {ReactNode} from "react";
import {useTheme} from "@/hooks/use-theme";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Spacing} from "@/constants/theme";
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {router} from "expo-router";

interface HeaderAction {
  icon: ReactNode;
  onPress: () => void;
}

interface SubPageHeaderActionsProps {
  actions?: HeaderAction[];
  children?: ReactNode;
}

export function SubPageHeaderActions({actions, children}: SubPageHeaderActionsProps) {
  const theme = useTheme();
  const safeArea = useSafeAreaInsets();

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.flatBackground,
      paddingHorizontal: Spacing.five,
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: safeArea.top + Spacing.four,
      paddingBottom: Spacing.four + 16,
      gap: Spacing.three
    },
    headerMain: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 0,
      backgroundColor: theme.textSecondary + 20,
      padding: Spacing.two ,
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
    headerMainTitle: {
      fontSize: Spacing.three,
      fontWeight: "bold",
      color: theme.text,
    },
    actionsContainer: {
      position: "absolute",
      right: 0,
      flexDirection: "row",
      gap: Spacing.three,
      alignItems: "center",
    },
    actionButton: {
      padding: Spacing.two,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={theme.text}/>
        </TouchableOpacity>
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                {action.icon}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {children}
    </View>
  );
}
