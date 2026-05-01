import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Types
type ButtonCardPosition = 'first' | 'middle' | 'last' | 'single';

interface ButtonCardContextValue {
  index: number;
  total: number;
}

const ButtonCardContext = createContext<ButtonCardContextValue | null>(null);

interface ButtonCardProps {
  icon: React.ReactNode;
  text: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  onLongPress?: () => void;
  iconBackgroundColor?: string;
  testID?: string;
  fontSize?: number;
  fontWeight?: string;
}

interface ButtonCardGroupProps {
  children: React.ReactNode;
}

// Helper function to determine position based on index and total
function getPosition(index: number, total: number): ButtonCardPosition {
  if (total === 1) return 'single';
  if (index === 0) return 'first';
  if (index === total - 1) return 'last';
  return 'middle';
}

// ButtonCardGroup component - wraps cards and provides position context
export function ButtonCardGroup({ children }: ButtonCardGroupProps) {
  // Convert children to array and filter only valid ButtonCard elements
  const childrenArray = React.Children.toArray(children);

  // Count only ButtonCard children (elements with type)
  const buttonCardChildren = childrenArray.filter(
    (child): child is React.ReactElement => {
      return React.isValidElement(child) && child.type === ButtonCard;
    }
  );

  const total = buttonCardChildren.length;

  // Return null if no ButtonCard children
  if (total === 0) {
    return null;
  }

  // Render children with context, wrapped in a View to override parent gap
  return (
    <View>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        // Only provide context to ButtonCard children
        if (child.type === ButtonCard) {
          const buttonCardIndex = buttonCardChildren.indexOf(child as React.ReactElement);

          if (buttonCardIndex !== -1) {
            return (
              <ButtonCardContext.Provider
                key={child.key || `button-card-${index}`}
                value={{ index: buttonCardIndex, total }}
              >
                {child}
              </ButtonCardContext.Provider>
            );
          }
        }

        return child;
      })}
    </View>
  );
}

// ButtonCard component
export function ButtonCard({
  icon,
  text,
  onPress,
  showArrow = false,
  disabled = false,
  onLongPress,
  iconBackgroundColor = '#EEF6FF',
  testID,
  fontWeight,
  fontSize,
  subtitle
}: ButtonCardProps) {
  const theme = useTheme();
  const context = useContext(ButtonCardContext);

  // Determine position
  const position: ButtonCardPosition = context
    ? getPosition(context.index, context.total)
    : 'single';

  // Generate styles based on position and theme
  const styles = useMemo(() => {
    // Border radius configuration based on position
    const borderRadiusConfig = {
      single: {
        borderTopLeftRadius: Spacing.four,
        borderTopRightRadius: Spacing.four,
        borderBottomLeftRadius: Spacing.four,
        borderBottomRightRadius: Spacing.four,
        marginTop: 0,
      },
      first: {
        borderTopLeftRadius: Spacing.four,
        borderTopRightRadius: Spacing.four,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: 0,
      },
      middle: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: -1, // Negative margin to merge borders
      },
      last: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: Spacing.four,
        borderBottomRightRadius: Spacing.four,
        marginTop: -1, // Negative margin to merge borders
      },
    };

    const radiusConfig = borderRadiusConfig[position];

    // @ts-ignore
    // @ts-ignore
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        backgroundColor: theme.flatBackground,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: Spacing.four,
        borderWidth: 1,
        borderColor: theme.textSecondary,
        shadowColor: 'black',
        shadowRadius: 1.8,
        shadowOpacity: 0.1,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        opacity: disabled ? 0.5 : 1,
        ...radiusConfig,
      },
      text: {
        //@ts-ignore
        fontWeight: fontWeight || '500',
        fontSize: fontSize || Spacing.three,
        color: theme.text,
      },
      subtitle: {
        fontSize: Spacing.two + 6,
        color: theme.textMuted
      },
      iconContainer: {
        padding: Spacing.two + 4,
        backgroundColor: iconBackgroundColor,
        borderRadius: Spacing.two + 2,
      },
    });
  }, [theme, position, iconBackgroundColor, disabled]);


  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.7}
    >
      {/*@ts-ignore*/}
      <View style={styles.container}>
        {/*@ts-ignore*/}
        <View style={styles.iconContainer}>{icon}</View>
        <View style={{
          alignItems: "flex-start",
          justifyContent: "center",
          flex: 1,
          marginLeft: Spacing.three
        }}>
          {/*@ts-ignore*/}
          <Text style={styles.text}>{text}</Text>
          {subtitle && (
            /*@ts-ignore*/
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        {showArrow && (
          <MaterialIcons
            name="arrow-forward-ios"
            size={20}
            color={theme.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ButtonCardSkeleton component - loading placeholder
export function ButtonCardSkeleton() {
  const theme = useTheme();
  const context = useContext(ButtonCardContext);

  // Determine position
  const position: ButtonCardPosition = context
    ? getPosition(context.index, context.total)
    : 'single';

  // Generate styles based on position and theme
  const styles = useMemo(() => {
    // Border radius configuration based on position
    const borderRadiusConfig = {
      single: {
        borderTopLeftRadius: Spacing.four,
        borderTopRightRadius: Spacing.four,
        borderBottomLeftRadius: Spacing.four,
        borderBottomRightRadius: Spacing.four,
        marginTop: 0,
      },
      first: {
        borderTopLeftRadius: Spacing.four,
        borderTopRightRadius: Spacing.four,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: 0,
      },
      middle: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: -1,
      },
      last: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: Spacing.four,
        borderBottomRightRadius: Spacing.four,
        marginTop: -1,
      },
    };

    const radiusConfig = borderRadiusConfig[position];

    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        backgroundColor: theme.textMuted + 15,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: Spacing.four,
        borderWidth: 1,
        borderColor: theme.textMuted + 30,
        ...radiusConfig,
      },
      iconPlaceholder: {
        width: 44,
        height: 44,
        backgroundColor: theme.textMuted + 25,
        borderRadius: Spacing.two + 2,
      },
      textPlaceholder: {
        width: '70%',
        height: Spacing.three + 2,
        backgroundColor: theme.textMuted + 25,
        borderRadius: 4,
        marginLeft: Spacing.three,
      },
      subtitlePlaceholder: {
        width: '45%',
        height: Spacing.two + 4,
        backgroundColor: theme.textMuted + 20,
        borderRadius: 4,
        marginTop: Spacing.two,
      },
      textContainer: {
        flex: 1,
        marginLeft: Spacing.three,
      },
    });
  }, [theme, position]);

  return (
    <View style={styles.container}>
      <View style={styles.iconPlaceholder} />
      <View style={styles.textContainer}>
        <View style={styles.textPlaceholder} />
        <View style={styles.subtitlePlaceholder} />
      </View>
    </View>
  );
}
