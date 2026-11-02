import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../shared/theme/index';
import { Text } from '../../../shared/ui/Text';

export type ReferralPageIndex = 0 | 1;
const LABELS = ['Invitar', 'Mis referidos'] as const;

/** Both visible navigation controls drive the same horizontal pager. */
export function ReferralPageNavigation({
  page,
  onSelect,
  variant,
}: {
  page: ReferralPageIndex;
  onSelect: (page: ReferralPageIndex) => void;
  variant: 'chips' | 'dots';
}) {
  const theme = useTheme();
  const chips = variant === 'chips';
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Páginas de referidos"
      style={[
        chips ? styles.chips : styles.dots,
        chips && { backgroundColor: theme.surface.inset },
      ]}
    >
      {LABELS.map((label, index) => {
        const selected = page === index;
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityLabel={chips ? label : `${label}, página ${index + 1} de 2`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(index as ReferralPageIndex)}
            hitSlop={chips ? 0 : { top: 10, bottom: 10 }}
            style={({ pressed }) => [
              chips ? styles.chip : styles.dotTarget,
              chips && { backgroundColor: selected ? theme.surface.brand : 'transparent' },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {chips ? (
              <Text
                variant="labelSm"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ color: selected ? '#FFFFFF' : theme.text.secondary }}
              >
                {label}
              </Text>
            ) : (
              <View
                style={[
                  styles.dot,
                  {
                    width: selected ? 20 : 8,
                    backgroundColor: selected
                      ? theme.referral.promotion
                      : theme.referral.cardBorder,
                  },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', borderRadius: 999, padding: 4, width: '100%' },
  chip: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 6,
  },
  dots: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center' },
  dotTarget: { width: 36, height: 24, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 8, borderRadius: 999 },
});
