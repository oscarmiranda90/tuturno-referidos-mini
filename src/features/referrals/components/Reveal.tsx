import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration } from '../../../shared/theme/index';

/** Milliseconds between two consecutive items of one staggered entrance. */
export const STAGGER_STEP = 38;

interface RevealProps {
  /** Turns true once the page is on its way in; the entrance runs only then. */
  play: boolean;
  /** Position in the stagger. Later items wait a little longer. */
  index?: number;
  /** Points the block travels upwards. Rows inside a table stay at 0. */
  rise?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * One block of a staggered entrance, in place of the plain View it replaces.
 *
 * It takes the same style as the view it stands in for, so the entrance never
 * costs an extra layout node and the approved spacing is untouched. The reveal
 * runs once, when `play` first turns true, so neither a state update nor a
 * second visit to the page replays it, and under reduced motion the content is
 * simply already in place.
 */
export function Reveal({ play, index = 0, rise = 0, style, children }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    if (!play) return;
    progress.value = withDelay(
      index * STAGGER_STEP,
      withTiming(1, { duration: duration.fast, easing: Easing.out(Easing.quad) }),
    );
    return () => cancelAnimation(progress);
  }, [index, play, progress, reducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: rise ? [{ translateY: (1 - progress.value) * rise }] : [],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
