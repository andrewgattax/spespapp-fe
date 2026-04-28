import {ReactNode} from "react";
import {useTheme} from "@/hooks/use-theme";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Spacing} from "@/constants/theme";
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {router} from "expo-router";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onProfilePress?: () => void;
}

export function PageHeader({title, subtitle, children, onProfilePress}: PageHeaderProps) {
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
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        <View>
          <Text style={styles.headerMainTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        <TouchableOpacity
          style={styles.userIconContainer}
          onPress={onProfilePress || (() => router.push("/settings"))}
        >
          <Feather name="user" size={24} color={theme.text}/>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}
