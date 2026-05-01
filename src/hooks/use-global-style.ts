import { StyleSheet, Platform } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";

export function useGlobalStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: Platform.select({
        ios: Spacing.five,
        android: Spacing.four,
      }),
      paddingTop: Spacing.four
    },
    colContainer: {
      width: "100%",
      marginTop: Spacing.five,
      gap: Spacing.four
    }
  });
}