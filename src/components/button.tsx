import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type ButtonVariant = 'filled' | 'outlined';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  icon,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    button: {
      backgroundColor: disabled
        ? theme.textMuted + 90
        : variant === 'filled'
          ? theme.primary
          : theme.background,
      borderRadius: 16,
      ...(variant === 'outlined' && {
        borderWidth: 1,
        borderColor: theme.textMuted + '30',
        shadowColor: "#000",
        shadowOffset: {
          width: 1,
          height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.84,
        ...Platform.select({
          android: {
            elevation: 5,
          }
        })
      }),
    },
    content: {
      paddingVertical: Spacing.four,
      paddingHorizontal: Spacing.six,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    text: {
      color: variant === 'filled' ? theme.foreground : theme.textMuted,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    }
  }), [theme, variant, disabled]);

  return (
    <TouchableOpacity
      style={[styles.button, fullWidth && { width: '100%' }]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size={28} color={variant === 'filled' ? '#ffffff' : theme.textMuted} />
        ) : (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.two
          }}>
            {icon && <View>{icon}</View>}
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
