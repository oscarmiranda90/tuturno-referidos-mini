import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import type { Tier } from '../../../shared/models/types';

interface StaticTierMedalProps {
  tier: Tier;
  size?: number;
  /** Unreached tiers stay recognisable but visually recede. */
  locked?: boolean;
}

const TIER_ASSET: Record<Tier, number> = {
  bronce: require('../../../../assets/medals/bronze.webp'),
  plata: require('../../../../assets/medals/silver.webp'),
  oro: require('../../../../assets/medals/gold.webp'),
  diamante: require('../../../../assets/medals/diamond.webp'),
};

const TIER_LABEL: Record<Tier, string> = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  diamante: 'Diamante',
};

/** Lightweight tier artwork for compact surfaces; the Club hero owns the 3D version. */
export function StaticTierMedal({ tier, size = 42, locked = false }: StaticTierMedalProps) {
  return (
    <Image
      source={TIER_ASSET[tier]}
      style={[styles.image, { width: size, height: size, opacity: locked ? 0.32 : 1 }]}
      contentFit="contain"
      cachePolicy="memory-disk"
      priority="high"
      recyclingKey={`medal-${tier}`}
      transition={80}
      accessible
      accessibilityLabel={`Medalla ${TIER_LABEL[tier]}`}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flexShrink: 0,
  },
});
