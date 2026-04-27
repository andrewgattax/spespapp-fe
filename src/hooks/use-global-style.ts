import { StyleSheet } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";

export function useGlobalStyles() {
  const theme = useTheme();
  
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.five
    }
  });
}