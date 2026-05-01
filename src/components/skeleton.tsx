import React, {useEffect, useMemo, useRef} from "react";
import {StyleSheet, View, Animated} from "react-native";
import {useTheme} from "@/hooks/use-theme";
import {Spacing} from "@/constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

export function Skeleton({width, height, style}: SkeletonProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => StyleSheet.create({
    skeleton: {
      backgroundColor: theme.textSecondary,
      borderRadius: 4,
    },
  }), [theme]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {width, height, opacity: fadeAnim},
        style,
      ]}
    />
  );
}

interface SkeletonTitleProps {
  width?: number | string;
}

export function SkeletonTitle({width = "60%"}: SkeletonTitleProps) {
  return (
    <View style={{marginBottom: Spacing.two}}>
      <Skeleton width={width} height={52} />
    </View>
  );
}

interface SkeletonSubtitleProps {
  width?: number | string;
}

export function SkeletonSubtitle({width = "30%"}: SkeletonSubtitleProps) {
  return (
    <View style={{marginBottom: Spacing.four}}>
      <Skeleton width={width} height={16} />
    </View>
  );
}

interface SkeletonRecipeCardProps {
  containerStyle?: any;
}

export function SkeletonRecipeCard({containerStyle}: SkeletonRecipeCardProps) {
  const theme = useTheme();

  const cardStyle = useMemo(() => StyleSheet.create({
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
      borderRadius: 4,
      marginRight: Spacing.three,
    },
  }), [theme]);

  return (
    <View style={{borderRadius: Spacing.three, overflow: "hidden"}}>
      <Skeleton width="100%" height={52} />
    </View>
  );
}
