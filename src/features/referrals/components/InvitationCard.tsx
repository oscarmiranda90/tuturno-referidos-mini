import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useRef } from 'react';
import type { Tier } from '../../../shared/models/types';
import { referralMoney } from '../../../shared/money';
import { useTheme } from '../../../shared/theme/index';
import { Text } from '../../../shared/ui/Text';
import { StaticTierMedal } from '../../club/components/StaticTierMedal';
import { ReferralDecoration } from './ReferralDecoration';
import { useReferrals } from '../state/ReferralProvider';
import type { ReferralUser } from '../domain/types';
import { cardBenefit } from '../domain/cardBenefit';

const TIER_NAME: Record<Tier, string> = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  diamante: 'Diamante',
};
/** Static 9:16 artwork for the sharing attachment and its instructional thumbnail. */
export function InvitationCard({
  user,
  width = 360,
  onReady,
  onError,
}: {
  user: ReferralUser;
  width?: number;
  onReady?: () => void;
  onError?: () => void;
}) {
  const theme = useTheme();
  const { programCountry: country } = useReferrals();
  const count = user.collectedSanes;
  const cardTier = user.clubTier ?? 'bronce';
  const brandInk = theme.referral.cardInk;
  const scale = width / 360;
  const loaded = useRef(new Set<string>());
  const imageLoaded = (name: string) => {
    loaded.current.add(name);
    if (loaded.current.size === (count ? 4 : 3)) onReady?.();
  };
  return (
    <View style={{ width, height: (width * 640) / 360, overflow: 'hidden' }}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.referral.cardCanvas,
            height: 640,
            transform: [{ scale }],
            transformOrigin: 'top left',
          },
        ]}
      >
        <ReferralDecoration variant="invite" />
        <View style={styles.brand}>
          <View style={styles.logoLockup}>
            <Image
              source={require('../../../../assets/icon.png')}
              contentFit="contain"
              style={styles.mark}
              cachePolicy="memory-disk"
              onLoad={() => imageLoaded('mark')}
              onError={onError}
            />
            <Image
              source={require('../../../../assets/brand/wordmark-white.png')}
              contentFit="contain"
              tintColor={theme.referral.cardBrandInk}
              style={styles.wordmark}
              cachePolicy="memory-disk"
              onLoad={() => imageLoaded('wordmark')}
              onError={onError}
            />
          </View>
          <Text variant="bodySm" style={{ color: brandInk }}>
            {country === 'VE'
              ? 'El primer San Digital del país'
              : 'La primera cadena digital del país'}
          </Text>
        </View>
        <View style={styles.welcome}>
          <Image
            source={require('../../../../assets/piggy/tutu_talk_1_poster.png')}
            style={{ width: 100, height: (100 * 656) / 592 }}
            contentFit="contain"
            accessibilityLabel="Tutu te da la bienvenida al Club TuTurno"
            cachePolicy="memory-disk"
            onLoad={() => imageLoaded('tutu')}
            onError={onError}
          />
          <View style={[styles.bubble, { backgroundColor: theme.referral.cardPanel }]}>
            <Text variant="titleSm" style={{ color: theme.referral.cardPanelInk }}>
              ¡Ven, aquí nos ayudamos a{' '}
              <Text variant="titleSm" style={{ color: theme.referral.cardPanelAccent }}>
                salir adelante!
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.identity}>
          <Text variant="bodyMedium" color="secondary">
            {count ? 'Mira cómo voy: soy' : 'Soy'}
          </Text>
          <Text variant="title" style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          {!count && (
            <Text variant="bodyMedium" style={styles.center}>
              y ya juego en TuTurno.
            </Text>
          )}
        </View>
        {!!count && (
          <View style={styles.trophies}>
            <View
              style={[
                styles.trophy,
                {
                  backgroundColor: theme.referral.cardTrophy,
                  borderColor: theme.referral.cardBorder,
                },
              ]}
            >
              <Text variant="bodyMedium">Ya cobré</Text>
              <Text variant="display" style={{ color: brandInk }}>
                {count}
              </Text>
              <Text variant="titleSm">
                {country === 'VE' ? 'San' : count === 1 ? 'cadena' : 'cadenas'}
              </Text>
            </View>
            <View
              style={[
                styles.trophy,
                {
                  backgroundColor: theme.referral.cardTrophy,
                  borderColor: theme.referral.cardBorder,
                },
              ]}
            >
              <StaticTierMedal
                tier={cardTier}
                size={60}
                onLoad={() => imageLoaded('medal')}
                onError={onError}
              />
              <Text variant="titleSm" style={{ color: brandInk }}>
                {TIER_NAME[cardTier]}
              </Text>
              <Text variant="bodySm" style={[styles.center, styles.benefit]}>
                {cardBenefit(cardTier, country)}
              </Text>
            </View>
          </View>
        )}
        <Text variant="bodyMedium" style={styles.guarantee}>
          Si alguien falla,{' '}
          <Text variant="bodyMedium" style={{ color: theme.referral.sentInk }}>
            tu turno está garantizado.
          </Text>
        </Text>
        <View style={styles.bottom}>
          <InvitationCardFooter />
        </View>
      </View>
    </View>
  );
}
/** Promotional footer is part of the static image, flush with its lower edge. */
function InvitationCardFooter() {
  const theme = useTheme();
  const { state, programCountry: country } = useReferrals();
  const reward = referralMoney(state.configs[country].inviteeAmount, country);
  return (
    <View style={[styles.sheet, { backgroundColor: theme.referral.cardPanel }]}>
      <Text variant="titleSm" style={[styles.center, { color: theme.referral.cardPanelInk }]}>
        Entra hoy,{' '}
        <Text variant="titleSm" style={{ color: theme.referral.cardPanelAccent }}>
          gana tus {reward}
        </Text>{' '}
        y arranca con {country === 'VE' ? 'el próximo San' : 'la próxima cadena'}.
      </Text>
      <View style={[styles.link, { backgroundColor: theme.referral.cardLink }]}>
        <Text variant="bodyMedium" style={[styles.center, styles.blue]}>
          ¿Quieres participar? Te explico cómo y te paso mi link.
        </Text>
      </View>
      <Text variant="bodySm" style={[styles.center, { color: theme.referral.cardPanelInk }]}>
        Promoción por tiempo limitado.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { width: 360, height: 640, overflow: 'hidden' },
  brand: { alignItems: 'center', paddingTop: 20, gap: 2 },
  logoLockup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mark: { width: 34, height: 34 },
  wordmark: { width: 184, height: 42 },
  blue: { color: '#0023D1' },
  center: { textAlign: 'center' },
  welcome: {
    height: 112,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  bubble: { flex: 1, padding: 14, borderRadius: 20 },
  identity: { alignItems: 'center', gap: 3, paddingHorizontal: 18, minHeight: 62 },
  name: { textAlign: 'center', fontSize: 29, lineHeight: 33 },
  trophies: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  trophy: {
    flex: 1,
    height: 142,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  benefit: { fontSize: 12, lineHeight: 15 },
  guarantee: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 19,
    gap: 11,
  },
  link: { borderRadius: 13, padding: 10 },
});
