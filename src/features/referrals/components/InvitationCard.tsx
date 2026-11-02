import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { Tier } from '../../../shared/models/types';
import { referralMoney } from '../../../shared/money';
import { useTheme } from '../../../shared/theme/index';
import { Text } from '../../../shared/ui/Text';
import { StaticTierMedal } from '../../club/components/StaticTierMedal';
import { ReferralDecoration } from './ReferralDecoration';
import { useReferrals } from '../state/ReferralProvider';
import type { ReferralUser } from '../domain/types';

const TIER_NAME: Record<Tier, string> = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  diamante: 'Diamante',
};
const TIER_CAPACITY: Record<Tier, number> = { bronce: 1, plata: 2, oro: 3, diamante: 4 };

/** Static 9:16 artwork for the sharing attachment and its instructional thumbnail. */
export function InvitationCard({ user, width = 360 }: { user: ReferralUser; width?: number }) {
  const theme = useTheme();
  const { programCountry: country } = useReferrals();
  const count = user.collectedSanes;
  const cardTier = user.clubTier ?? 'bronce';
  const san = country === 'VE' ? 'San' : 'cadena';
  const brandInk = theme.referral.promotion;
  const scale = width / 360;
  return (
    <View style={{ width, height: (width * 640) / 360, overflow: 'hidden' }}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.referral.canvas,
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
            />
            <Image
              source={require('../../../../assets/brand/wordmark-white.png')}
              contentFit="contain"
              tintColor={theme.referral.cardBrandInk}
              style={styles.wordmark}
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
          />
          <View style={styles.bubble}>
            <Text variant="titleSm" color="onBrand">
              ¡Ven, aquí nos ayudamos a{' '}
              <Text variant="titleSm" style={styles.green}>
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
                  backgroundColor: theme.referral.cardSurface,
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
                  backgroundColor: theme.referral.cardSurface,
                  borderColor: theme.referral.cardBorder,
                },
              ]}
            >
              <StaticTierMedal tier={cardTier} size={60} />
              <Text variant="titleSm" style={{ color: brandInk }}>
                {TIER_NAME[cardTier]}
              </Text>
              <Text
                variant="bodySm"
                style={[styles.center, styles.benefit]}
              >{`Juego ${TIER_CAPACITY[cardTier]} ${san} a la vez${cardTier === 'diamante' ? ' y 1 gratis' : ''}`}</Text>
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
  const { state, programCountry: country } = useReferrals();
  const reward = referralMoney(state.configs[country].inviteeAmount, country);
  return (
    <View style={styles.sheet}>
      <Text variant="titleSm" color="onBrand" style={styles.center}>
        Entra hoy,{' '}
        <Text variant="titleSm" style={styles.green}>
          gana tus {reward}
        </Text>{' '}
        y arranca con {country === 'VE' ? 'el próximo San' : 'la próxima cadena'}.
      </Text>
      <View style={styles.link}>
        <Text variant="bodyMedium" style={[styles.center, styles.blue]}>
          ¿Quieres participar? Te explico cómo y te paso mi link.
        </Text>
      </View>
      <Text variant="bodySm" color="onBrand" style={styles.center}>
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
  green: { color: '#25E678' },
  center: { textAlign: 'center' },
  welcome: {
    height: 112,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  bubble: { flex: 1, backgroundColor: '#0023D1', padding: 14, borderRadius: 20 },
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
    backgroundColor: '#0023D1',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 19,
    gap: 11,
  },
  link: { backgroundColor: '#FFFFFF', borderRadius: 13, padding: 10 },
});
