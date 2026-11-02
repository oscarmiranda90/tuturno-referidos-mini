import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { borderCurve, elevation, radius, spacing, touchTarget, useTheme } from '../theme/index';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  foregroundColor?: string;
}

/**
 * Primary action button.
 *
 * Press feedback lands on press-IN at 120ms with a 0.97 scale — the motion laws'
 * frequency gate puts button presses in the "tens of times a day" bucket, where
 * motion must be near-imperceptible. The animation runs on the UI thread via
 * Reanimated worklets so it holds 60fps on the low-end Android hardware much of
 * the user base runs.
 *
 * Haptics fire once per action, on the same frame as the visual.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  leading,
  foregroundColor,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const press = (to: number) => {
    scale.value = withTiming(to, {
      duration: 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  };

  const surfaceColor = isDisabled
    ? theme.action.primaryDisabled
    : variant === 'primary'
      ? theme.action.primary
      : variant === 'danger'
        ? theme.status.danger
        : 'transparent';

  const labelColor = isDisabled ? 'muted' : variant === 'primary' ? 'inverse' : 'primary';

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        !isDisabled && variant === 'primary' && elevation.sm,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={label}
        disabled={isDisabled}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        onPress={(event) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(event);
        }}
        style={[
          styles.base,
          { backgroundColor: surfaceColor },
          variant === 'secondary' && {
            borderWidth: 1.5,
            borderColor: theme.action.secondaryBorder,
          },
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={theme.action.primaryText} />
        ) : (
          <View style={styles.content}>
            {leading}
            <Text
              variant="button"
              color={labelColor}
              style={[
                styles.label,
                !isDisabled && foregroundColor ? { color: foregroundColor } : undefined,
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    borderCurve,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flexShrink: 1, textAlign: 'center' },
  content: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
