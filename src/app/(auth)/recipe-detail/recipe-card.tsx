import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface RecipeCardProps {
  text: string;
  testID?: string;
}

export function RecipeCard({
  text,
  testID,
}: RecipeCardProps) {
  const theme = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.flatBackground,
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: Spacing.four,
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: Spacing.four,
      shadowColor: 'black',
      shadowRadius: 1.8,
      shadowOpacity: 0.1,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    bullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.accent,
      marginRight: Spacing.three,
    },
    text: {
      fontWeight: '500',
      fontSize: Spacing.three,
      color: theme.text,
    },
  }), [theme]);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.bullet} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
