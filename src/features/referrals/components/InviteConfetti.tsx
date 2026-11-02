import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

function Particle({
  clock,
  index,
  still,
}: {
  clock: SharedValue<number>;
  index: number;
  still: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = still ? 0.35 : (clock.value + index / 8) % 1;
    return {
      opacity: still ? 1 : Math.min(1, progress * 8, (1 - progress) * 6),
      transform: [
        { translateX: Math.sin(progress * Math.PI * 2 + index) * 10 },
        { translateY: -12 + 72 * progress },
        { rotate: `${index * 37 + (still ? 0 : progress * 300)}deg` },
        { scaleX: still ? 1 : 0.45 + Math.abs(Math.cos(progress * Math.PI * 3)) * 0.55 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.particle,
        { left: `${18 + index * 9}%`, backgroundColor: index % 2 ? '#20D672' : '#0023D1' },
        animatedStyle,
      ]}
    />
  );
}

/** A bounded native particle loop, paused when the invitation is hidden. */
export function InviteConfetti({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const clock = useSharedValue(0);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active'),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (active && foreground && !reducedMotion) {
      clock.value = 0;
      clock.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.linear }), -1);
    }
    return () => cancelAnimation(clock);
  }, [active, foreground, reducedMotion, clock]);
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.layer}
    >
      {Array.from({ length: reducedMotion ? 4 : 8 }, (_, index) => (
        <Particle
          key={index}
          index={reducedMotion ? index * 2 : index}
          clock={clock}
          still={reducedMotion}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  particle: { position: 'absolute', top: 0, width: 6, height: 12, borderRadius: 2 },
});
