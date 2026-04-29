import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollViewProps, ScrollView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Only import haptics on native platforms
let Haptics: any;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    // Haptics not available
  }
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface AnimatedRefreshControlProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  children: React.ReactNode;
  pullThreshold?: number;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function AnimatedRefreshControl({
  onRefresh,
  refreshing,
  children,
  pullThreshold = 100,
  contentContainerStyle,
}: AnimatedRefreshControlProps) {
  const scrollY = useSharedValue(0);
  const pullProgress = useSharedValue(0);
  const isPulling = useSharedValue(false);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerRefresh = () => {
    'worklet';
    if (!refreshing) {
      runOnJS(onRefresh)();
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;

      // Only track pull when at the top
      if (offsetY < 0) {
        const pullDistance = Math.abs(offsetY);
        const progress = Math.min(pullDistance / pullThreshold, 1);

        pullProgress.value = progress;

        // Trigger haptic when reaching threshold
        if (progress >= 1 && !hasTriggeredHaptic.value && !refreshing) {
          hasTriggeredHaptic.value = true;
          if (Haptics) {
            runOnJS(() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (e) {
                // Ignore haptic errors
              }
            })();
          }
        }

        // Reset haptic trigger when pulling back below threshold
        if (progress < 0.8) {
          hasTriggeredHaptic.value = false;
        }

        isPulling.value = true;
      } else {
        pullProgress.value = 0;
        isPulling.value = false;
        hasTriggeredHaptic.value = false;
      }

      scrollY.value = offsetY;
    },
    onEndDrag: () => {
      // Trigger refresh if pulled past threshold
      if (pullProgress.value >= 1 && !refreshing) {
        triggerRefresh();
      }

      // Animate back to 0 if not refreshing
      if (!refreshing) {
        pullProgress.value = withSpring(0, { damping: 15 });
      }
    },
  });

  // Animate icon during refresh
  useEffect(() => {
    if (refreshing) {
      // Continuous rotation while refreshing
      pullProgress.value = withTiming(1, { duration: 1000 });
    } else {
      pullProgress.value = withSpring(0, { damping: 15 });
    }
  }, [refreshing]);

  const iconStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      pullProgress.value,
      [0, 1],
      [0, 360],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      pullProgress.value,
      [0, 1],
      [1, 1.3],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [-pullThreshold, -pullThreshold / 2, 0],
      [1, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const loadingIconStyle = useAnimatedStyle(() => {
    return {
      opacity: refreshing ? 1 : 0,
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated refresh indicator */}
      <Animated.View style={[styles.refreshIcon, iconStyle]}>
        <MaterialCommunityIcons
          name="food-halal"
          size={32}
          color="#009866"
        />
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        bounces={true}
      >
        {children}
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshIcon: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
