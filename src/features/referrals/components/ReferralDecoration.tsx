import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../shared/theme/index';
import { MoneyPattern, type Motif, type Placement } from '../../../shared/ui/MoneyPattern';

const MOTIFS: readonly Motif[] = ['coin', 'piggy', 'bank', 'sign'];

/** Staggered tiles keep the familiar money glyphs spread across the canvas. */
const INVITE_PLACEMENTS: readonly Placement[] = Array.from({ length: 66 }, (_, index) => {
  const row = Math.floor(index / 6);
  const column = index % 6;
  return {
    motif: MOTIFS[(column + row * 3) % MOTIFS.length],
    x: 4 + column * 18 + (row % 2 ? 7 : 0),
    y: 2 + row * 10,
    size: 8 + ((row + column * 2) % 3) * 2,
    rotate: [-18, 12, -8, 22][(column + row) % 4],
  };
});

const EARNINGS_PLACEMENTS: readonly Placement[] = [
  { motif: 'piggy', x: 3, y: 8, size: 42, rotate: -18 },
  { motif: 'coin', x: 24, y: 5, size: 30, rotate: 14 },
  { motif: 'bank', x: 47, y: 12, size: 38, rotate: -12 },
  { motif: 'sign', x: 69, y: 3, size: 32, rotate: 22 },
  { motif: 'coin', x: 92, y: 10, size: 44, rotate: -10 },
  { motif: 'sign', x: 10, y: 54, size: 34, rotate: 16 },
  { motif: 'piggy', x: 35, y: 53, size: 42, rotate: -10 },
  { motif: 'coin', x: 59, y: 44, size: 34, rotate: 18 },
  { motif: 'bank', x: 85, y: 53, size: 40, rotate: -14 },
  { motif: 'bank', x: 1, y: 97, size: 36, rotate: 12 },
  { motif: 'coin', x: 23, y: 94, size: 42, rotate: -20 },
  { motif: 'sign', x: 48, y: 95, size: 34, rotate: 14 },
  { motif: 'piggy', x: 70, y: 100, size: 38, rotate: -12 },
  { motif: 'coin', x: 98, y: 94, size: 32, rotate: 18 },
];

export function ReferralDecoration({ variant }: { variant: 'earnings' | 'invite' | 'canvas' }) {
  const theme = useTheme();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {variant === 'canvas' ? (
        <LinearGradient
          colors={theme.referral.canvasRise}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <MoneyPattern
          placements={variant === 'earnings' ? EARNINGS_PLACEMENTS : INVITE_PLACEMENTS}
          color={variant === 'earnings' ? theme.referral.heroPatternInk : theme.referral.patternInk}
          opacity={variant === 'earnings' ? 0.4 : 0.05}
        />
      )}
    </View>
  );
}
