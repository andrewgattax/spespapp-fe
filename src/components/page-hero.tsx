import {ReactNode} from "react";
import {useTheme} from "@/hooks/use-theme";
import {lineHeight, Spacing} from "@/constants/theme";
import {StyleSheet, Text, View} from "react-native";

type PageHeroVariant = "primary" | "muted";

interface PageHeroProps {
  icon: ReactNode;
  title: string;
  subtitle?: string | ReactNode;
  borderColor?: string;
  backgroundColor?: string;
}

export function PageHero({icon, title, subtitle, borderColor, backgroundColor}: PageHeroProps) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    mainIconContainer: {
      backgroundColor: backgroundColor || theme.textSecondary + 50,
      borderColor: borderColor || theme.textSecondary,
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
      fontSize: Spacing.four + 6,
      fontWeight: "600",
      marginTop: Spacing.four,
      color: theme.text,
      textAlign: "center"
    },
    secondTitle: {
      marginTop: Spacing.one,
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
