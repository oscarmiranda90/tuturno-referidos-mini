import * as Clipboard from 'expo-clipboard';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { User } from '../../../shared/models/types';
import { referralMoney } from '../../../shared/money';
import { useTheme } from '../../../shared/theme/index';
import { Text } from '../../../shared/ui/Text';
import { TutuMascot } from '../../../shared/ui/TutuMascot';
import { Reveal } from './Reveal';
import { InviteConfetti } from './InviteConfetti';
import { InvitationCard } from './InvitationCard';
import { InvitationCardPreview } from './InvitationCardPreview';
import { ReferralIcon, WhatsAppIcon } from './ReferralIcons';
import { canInvite, referralLink, whatsappMessage } from '../domain/engine';
import { invitationProfile } from '../domain/invitationProfile';
import { useReferrals } from '../state/ReferralProvider';
import { canShareInvitation, shareInvitation } from '../services/shareInvitation';

export interface InvitePageHandle {
  share: () => Promise<void>;
}
export function InvitePage({
  profile,
  active,
  reveal = true,
  pageIndicator,
  ref,
}: {
  profile: User;
  active: boolean;
  /** Turns true when the pager starts travelling towards this page. */
  reveal?: boolean;
  pageIndicator?: React.ReactNode;
  ref?: React.Ref<InvitePageHandle>;
}) {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { state, setState, programCountry: country } = useReferrals();
  const referralUser = state.users.find((u) => u.id === 'demo-referrer')!;
  const user = invitationProfile(referralUser, profile);
  const config = state.configs[country];
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const cardRef = useRef<View>(null);
  const artworkKey = `${country}:${theme.mode}:${user.clubTier}:${user.collectedSanes > 0}`;
  const artwork = useRef({ key: artworkKey, ready: false, failed: false });
  if (artwork.current.key !== artworkKey)
    artwork.current = { key: artworkKey, ready: false, failed: false };
  const [feedback, setFeedback] = useState('');
  const tracked = useRef(false);
  const sharing = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!active) setPreview(false);
  }, [active]);
  useEffect(() => {
    if (active && !tracked.current) {
      tracked.current = true;
      setState({
        ...state,
        events: [
          ...state.events,
          {
            id: `invite:${Date.now()}`,
            userId: user.id,
            country,
            kind: 'invite-screen',
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }
  }, [active, country, setState, state, user.id]);
  const reward = referralMoney(config.referrerAmount, country);
  const friendReward = referralMoney(config.inviteeAmount, country);
  const message = whatsappMessage(user, config);
  const openWhatsApp = async () => {
    if (sharing.current || !canInvite(user, config)) return;
    if (!canShareInvitation()) {
      const message = 'Esta vista de prueba no permite compartir la tarjeta.';
      setFeedback(message);
      if (!active) Alert.alert('Compartir tarjeta', message);
      return;
    }
    sharing.current = true;
    setFeedback('');
    setBusy(true);
    try {
      const started = Date.now();
      // Never export while the local logo, Tutu or medal is still being decoded.
      while (!artwork.current.ready) {
        if (!mounted.current || artwork.current.failed || Date.now() - started > 15000)
          throw new Error('Card artwork is unavailable');
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      // iOS renders in points at device scale; Android resizes directly in pixels.
      const captureScale = Platform.OS === 'ios' ? PixelRatio.get() : 1;
      const png = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        width: 1080 / captureScale,
        height: 1920 / captureScale,
        result: 'base64',
      });
      await shareInvitation(png, message);
    } catch {
      if (mounted.current) {
        setFeedback('No pudimos compartir la tarjeta. Copia tu link o intenta de nuevo.');
        if (!active)
          Alert.alert('No pudimos compartir la tarjeta', 'Copia tu link o intenta de nuevo.');
      }
    } finally {
      sharing.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  useImperativeHandle(ref, () => ({ share: openWhatsApp }));
  const copyLink = async () => {
    try {
      const copied = await Clipboard.setStringAsync(referralLink(user.referralCode));
      if (mounted.current)
        setFeedback(copied ? 'Link copiado' : 'No pudimos copiar el link. Intenta de nuevo.');
    } catch {
      if (mounted.current) setFeedback('No pudimos copiar el link. Intenta de nuevo.');
    }
  };
  const horizontal = width >= 360 && fontScale < 1.3;
  const eligible = canInvite(user, config);
  return (
    <View style={[styles.root, { backgroundColor: theme.referral.canvas }]}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.exportContainer}
      >
        <View key={artworkKey} ref={cardRef} collapsable={false}>
          <InvitationCard
            user={user}
            onReady={() => {
              artwork.current.ready = true;
            }}
            onError={() => {
              artwork.current.failed = true;
            }}
          />
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        bounces={false}
      >
        <Reveal play={reveal} index={0} rise={8} style={styles.celebration}>
          <InviteConfetti active={active && !preview} />
          <TutuMascot mood="dance" size={52} />
        </Reveal>
        <Reveal play={reveal} index={1} rise={10} style={styles.heading}>
          <Text variant="title" style={[styles.center, styles.headline]}>
            Invita a tus amigos{'\n'}y ganan los dos.
          </Text>
          <Text variant="body" color="secondary" style={styles.center}>
            Tú ya cobraste tu turno. Ahora ellos también pueden.
          </Text>
        </Reveal>
        <Reveal
          play={reveal}
          index={2}
          rise={10}
          style={[styles.rewards, !horizontal && styles.vertical]}
        >
          <View style={[styles.reward, { backgroundColor: '#0023D1' }]}>
            <Text variant="bodySm" color="onBrand">
              Tú recibes
            </Text>
            <Text
              variant="displaySm"
              color="onBrand"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              style={styles.rewardAmount}
            >
              {reward}
            </Text>
            <Text variant="bodySm" color="onBrand" style={styles.rewardDetail}>
              por cada amigo que pague su primera cuota
            </Text>
          </View>
          <View style={[styles.reward, { backgroundColor: '#20D672' }]}>
            <Text variant="bodySm" style={styles.greenInk}>
              Tu amigo recibe
            </Text>
            <Text
              variant="displaySm"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              style={[styles.greenInk, styles.rewardAmount]}
            >
              {friendReward}
            </Text>
            <Text variant="bodySm" style={[styles.greenInk, styles.rewardDetail]}>
              al pagar su primera cuota
            </Text>
          </View>
        </Reveal>
        <Reveal play={reveal} index={3} rise={10}>
          <Text variant="bodyMedium" style={[styles.center, { color: theme.referral.promotion }]}>
            Por tiempo limitado.
          </Text>
        </Reveal>
        <Reveal play={reveal} index={4} rise={10} style={styles.shareBanner}>
          <View style={styles.shareGlyph}>
            <ReferralIcon name="share" color="#0023D1" size={23} />
          </View>
          <Text variant="bodyMedium" color="onBrand" style={{ flex: 1 }}>
            Compártela con todos: tus chats, tus estados y tus redes.
          </Text>
        </Reveal>
        <Reveal
          play={reveal}
          index={5}
          rise={10}
          style={[styles.steps, !horizontal && styles.vertical]}
        >
          <Step number={1} text="Toca el botón verde." horizontal={horizontal}>
            <View style={[styles.messageTile, { backgroundColor: theme.referral.tile }]}>
              <View style={styles.miniButton}>
                <WhatsAppIcon size={12} />
                <Text variant="labelSm" style={styles.miniButtonText}>
                  Invitar por WhatsApp
                </Text>
              </View>
            </View>
          </Step>
          <Step
            number={2}
            text="Toca el WhatsApp que te aparece y marca a todos los que quieras."
            horizontal={horizontal}
          >
            <Pressable
              testID="invitation-preview"
              accessibilityRole="button"
              accessibilityLabel="Ver tarjeta en grande"
              accessibilityHint="Abre tu tarjeta. Usa la X para volver a Invitar."
              onPress={() => setPreview(true)}
              style={[styles.messageTile, { backgroundColor: theme.referral.tile }]}
            >
              <View pointerEvents="none" style={styles.miniCard}>
                <InvitationCard user={user} width={68} />
              </View>
              <View style={styles.magnifier}>
                <ReferralIcon name="zoom" color="#0023D1" size={14} />
              </View>
              <View style={styles.phoneWhatsapp}>
                <WhatsAppIcon color="#20CE66" size={22} />
              </View>
            </Pressable>
          </Step>
          <Step
            number={3}
            text={
              country === 'VE'
                ? `Por cada amigo que pague, te llegan ${reward} por pago móvil.`
                : `Por cada amigo que pague, te pagamos ${reward} a tu cuenta.`
            }
            horizontal={horizontal}
          >
            <View style={[styles.messageTile, { backgroundColor: theme.referral.tile }]}>
              <View style={styles.coin}>
                <ReferralIcon name="currency" color="#FFFFFF" size={34} />
              </View>
            </View>
          </Step>
        </Reveal>
      </ScrollView>
      <View style={styles.footer}>
        {!!feedback && (
          <Text accessibilityLiveRegion="polite" variant="bodySm" style={styles.center}>
            {feedback}
          </Text>
        )}
        {pageIndicator}
        <Pressable
          testID="invite-whatsapp"
          accessibilityRole="button"
          accessibilityLabel="Invitar por WhatsApp"
          accessibilityState={{ disabled: !eligible || busy, busy }}
          disabled={!eligible || busy}
          onPress={openWhatsApp}
          style={({ pressed }) => [
            styles.whatsapp,
            {
              backgroundColor: !eligible
                ? theme.action.primaryDisabled
                : pressed
                  ? theme.referral.whatsappPressed
                  : theme.referral.whatsapp,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <WhatsAppIcon color="#FFFFFF" />
              <Text variant="button" style={{ color: '#FFFFFF' }}>
                Invitar por WhatsApp
              </Text>
            </>
          )}
        </Pressable>
        <View style={styles.footerHint}>
          <ReferralIcon name="clock" color={theme.referral.promotion} size={13} />
          <Text variant="bodySm" color="secondary" style={[styles.center, styles.hintText]}>
            Revisa quién pagó y cuánto llevas, cuando quieras: toca Invitar en tu Inicio.
          </Text>
        </View>
        <Pressable
          onPress={copyLink}
          disabled={!eligible}
          accessibilityRole="button"
          accessibilityLabel="Copiar link"
          style={styles.copy}
        >
          <ReferralIcon name="copy" color={theme.text.secondary} size={17} />
          <Text variant="bodyMedium" color="secondary">
            Copiar link
          </Text>
        </Pressable>
      </View>
      <InvitationCardPreview user={user} visible={preview} onClose={() => setPreview(false)} />
    </View>
  );
}
function Step({
  number,
  text,
  children,
  horizontal,
}: {
  number: number;
  text: string;
  children: React.ReactNode;
  horizontal: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.step, !horizontal && styles.stepHorizontal]}>
      <View style={[styles.diagram, !horizontal && styles.diagramInline]}>
        {children}
        {horizontal && number < 3 && (
          <View pointerEvents="none" style={styles.stepArrow}>
            <ReferralIcon name="arrow" color={theme.text.muted} size={14} />
          </View>
        )}
      </View>
      <View style={[styles.stepLabel, !horizontal && styles.stepLabelInline]}>
        <View style={[styles.stepNumber, { backgroundColor: theme.surface.brand }]}>
          <Text variant="labelSm" color="onBrand">
            {number}
          </Text>
        </View>
        <Text
          variant="bodySm"
          style={[styles.center, styles.stepCaption, !horizontal && styles.stepText]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  exportContainer: { position: 'absolute', left: -1000, top: 0, width: 360, height: 640 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 20, gap: 8 },
  celebration: { height: 60, alignItems: 'center', justifyContent: 'center' },
  heading: { gap: 4 },
  headline: { fontSize: 26, lineHeight: 28 },
  center: { textAlign: 'center' },
  rewards: { flexDirection: 'row', gap: 10 },
  reward: { flex: 1, padding: 12, borderRadius: 20, minHeight: 102 },
  rewardDetail: { fontSize: 12, lineHeight: 15 },
  rewardAmount: { fontSize: 32, lineHeight: 36 },
  greenInk: { color: '#FFFFFF' },
  shareBanner: {
    backgroundColor: '#0023D1',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  shareGlyph: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 7 },
  steps: { flexDirection: 'row', gap: 12 },
  vertical: { flexDirection: 'column' },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  stepHorizontal: { flexDirection: 'row', flex: 0 },
  diagram: { height: 86, width: '100%', alignItems: 'center', justifyContent: 'center' },
  stepArrow: { position: 'absolute', right: -13, top: 35 },
  diagramInline: { width: 100 },
  stepLabel: { alignItems: 'center', gap: 4 },
  stepLabelInline: { flex: 1 },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepCaption: { fontSize: 12, lineHeight: 15 },
  stepText: { textAlign: 'left' },
  messageTile: {
    width: '100%',
    height: 86,
    backgroundColor: '#F5F5F8',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniButton: {
    backgroundColor: '#20D672',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  miniButtonText: { color: '#FFFFFF', fontSize: 9, lineHeight: 10, flexShrink: 1 },
  miniCard: {
    width: 74,
    height: 108,
    borderWidth: 3,
    borderColor: '#E4E5EA',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  magnifier: {
    position: 'absolute',
    right: 8,
    bottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  phoneWhatsapp: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    padding: 3,
  },
  coin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#20D672',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 7px 18px #20CE6633',
  },
  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 5 },
  hintText: { fontSize: 11, lineHeight: 14 },
  footerHint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  whatsapp: {
    minHeight: 58,
    borderRadius: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0 8px 20px #20CE6633',
  },
  copy: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
