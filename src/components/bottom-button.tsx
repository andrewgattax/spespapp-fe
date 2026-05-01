import {Button, ButtonProps} from "@/components/button";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet, View} from "react-native";
import {Spacing} from "@/constants/theme";
import {useTheme} from "@/hooks/use-theme";

export function BottomButton(props: ButtonProps) {
  const theme = useTheme();
  const safeArea = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.flatBackground,
      paddingHorizontal: Spacing.five,
      width: "100%",
      paddingBottom: safeArea.bottom + Spacing.four,
      paddingTop: Spacing.four,
    },
  });

  return (
    <View style={styles.container}>
      <Button {...props} />
    </View>
  );
}
