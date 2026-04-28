import {ReactNode} from "react";
import {useTheme} from "@/hooks/use-theme";
import {lineHeight, Spacing} from "@/constants/theme";
import {StyleSheet, Text, View} from "react-native";

type PageHeroVariant = "primary" | "muted";

interface PageHeroProps {
  icon: ReactNode;
  title: string;
  subtitle?: string | ReactNode;
  variant?: PageHeroVariant;
}

export function PageHero({icon, title, subtitle, variant = "muted"}: PageHeroProps) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    mainIconContainer: {
      backgroundColor: variant === "primary" ? theme.secondary + 50 : theme.textSecondary + 50,
      borderColor: variant === "primary" ? theme.secondary : theme.textSecondary,
      borderWidth: 1,
      shadowColor: "black",
      shadowOpacity: 0.1,
      shadowRadius: 1.80,
      shadowOffset: {
        width: 0,
        height: 2
      },
      padding: Spacing.four,
      borderRadius: Spacing.five + 10
    },
    mainTitle: {
      fontSize: Spacing.four,
      fontWeight: "600",
      marginTop: variant === "primary" ? Spacing.four : Spacing.five,
      color: theme.text,
      textAlign: "center"
    },
    secondTitle: {
      marginTop: variant === "primary" ? Spacing.one : Spacing.two,
      maxWidth: 256,
      textAlign: "center",
      lineHeight: lineHeight.big,
      color: theme.textMuted,
      fontWeight: "400"
    },
  });

  return (
    <>
      <View style={styles.mainIconContainer}>
        {icon}
      </View>
      <Text style={styles.mainTitle}>{title}</Text>
      {subtitle && (
        typeof subtitle === "string" ? (
          <Text style={styles.secondTitle}>{subtitle}</Text>
        ) : (
          <Text style={styles.secondTitle}>{subtitle}</Text>
        )
      )}
    </>
  );
}
