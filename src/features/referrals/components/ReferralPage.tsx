import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { referralMoney } from '../../../shared/money';
import { useTheme } from '../../../shared/theme/index';
import { Button } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';
import { TutuMascot } from '../../../shared/ui/TutuMascot';
import * as Clipboard from 'expo-clipboard';
import { ReferralIcon, WhatsAppIcon } from './ReferralIcons';
import { Reveal } from './Reveal';
import { referralLedger } from '../domain/ledger';
import { referralLink, summaryFor } from '../domain/engine';
import type { ReferralSummary } from '../domain/types';
import type { ReferralsService } from '../services/service';
import { useReferrals } from '../state/ReferralProvider';

export function ReferralPage({
  onInvite,
  reveal = true,
  pageIndicator,
  service,
}: {
  onInvite: () => void;
  reveal?: boolean;
  pageIndicator?: React.ReactNode;
  service?: ReferralsService;
}) {
  const theme = useTheme();
  const { state, programCountry: country } = useReferrals();
  const config = state.configs[country];
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [feedback, setFeedback] = useState('');
  const user = state.users.find((value) => value.id === 'demo-referrer')!;
  const copyLink = async () => {
    try {
      const copied = await Clipboard.setStringAsync(referralLink(user.referralCode));
      setFeedback(copied ? 'Link copiado' : 'No pudimos copiar el link. Intenta de nuevo.');
    } catch {
      setFeedback('No pudimos copiar el link. Intenta de nuevo.');
    }
  };
  useEffect(() => {
    let mounted = true;
    setError(false);
    setSummary(null);
    if (service)
      service
        .getSummary()
        .then((value) => {
          if (mounted) setSummary(value);
        })
        .catch(() => {
          if (mounted) setError(true);
        });
    else setSummary(summaryFor(state, 'demo-referrer', new Date().toISOString()));
    return () => {
      mounted = false;
    };
  }, [service, state, retry]);
  const ledger = summary ? referralLedger(summary) : null;
  return (
    <View style={[styles.root, { backgroundColor: theme.referral.canvas }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        bounces={false}
        overScrollMode="never"
      >
        {error ? (
          <View style={styles.empty}>
            <Text variant="titleSm">No pudimos cargar tus referidos.</Text>
            <Button label="Intentar de nuevo" onPress={() => setRetry((n) => n + 1)} />
          </View>
        ) : !summary ? (
          <ActivityIndicator style={styles.empty} color={theme.action.primary} />
        ) : (
          <>
            <Text variant="body" color="muted" style={styles.center}>
              Tus invitados, en orden de llegada.
            </Text>
            {summary.entries.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyArt}>
                  <TutuMascot mood="dance" size={160} />
                  <View
                    style={[
                      styles.phone,
                      {
                        backgroundColor: theme.surface.raised,
                        borderColor: theme.text.primary,
                      },
                    ]}
                  >
                    <ReferralIcon name="gift" color={theme.referral.positiveInk} size={34} />
                  </View>
                </View>
                <Text
                  variant="titleSm"
                  style={styles.center}
                >{`Todavía no has invitado a nadie.`}</Text>
              </View>
            ) : (
              <View style={[styles.table, { borderColor: theme.referral.cardBorder }]}>
                <View style={[styles.tableHeader, { backgroundColor: theme.referral.tile }]}>
                  <Text variant="labelSm" color="muted">
                    FECHA · AMIGO
                  </Text>
                  <Text variant="labelSm" color="muted">
                    GANANCIA
                  </Text>
                </View>
                {ledger!.entries.map((entry, index) => {
                  const date = entry.registeredAt ? new Date(entry.registeredAt) : null;
                  const name = !entry.paid && entry.email ? entry.email : entry.name;
                  const paid = entry.paid;
                  const pending = !paid;
                  const color = paid ? theme.referral.sentInk : theme.referral.pendingInk;
                  return (
                    <Reveal
                      key={entry.id}
                      play={reveal}
                      index={index}
                      style={[
                        styles.friend,
                        {
                          backgroundColor: paid
                            ? theme.referral.sentRow
                            : theme.referral.pendingRow,
                          borderBottomColor: theme.referral.rowBorder,
                        },
                      ]}
                    >
                      <View style={styles.date}>
                        <Text variant="bodyMedium">{date ? date.getDate() : '—'}</Text>
                        <Text variant="labelSm" color="muted">
                          {date
                            ? date.toLocaleDateString('es-VE', { month: 'short' }).replace('.', '')
                            : ''}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: pending
                              ? theme.surface.inset
                              : [
                                  '#9DBDFA',
                                  '#F3B8AD',
                                  '#9EDFC0',
                                  '#9EDFC0',
                                  '#C8B0EB',
                                  '#F6D58C',
                                  '#F6D58C',
                                ][index % 7],
                          },
                        ]}
                      >
                        {pending ? (
                          <Text variant="titleSm" color="secondary">
                            @
                          </Text>
                        ) : entry.avatarUrl ? (
                          <Image
                            source={{ uri: entry.avatarUrl }}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                            accessibilityLabel={`Foto de ${name}`}
                          />
                        ) : (
                          <>
                            <View style={styles.avatarHead} />
                            <View style={styles.avatarBody} />
                          </>
                        )}
                      </View>
                      <Text variant="bodyMedium" style={styles.friendText}>
                        {name}
                      </Text>
                      <View style={styles.gain}>
                        {paid ? (
                          <Text
                            variant="titleSm"
                            style={{ color }}
                          >{`+${referralMoney(entry.amount, country)}`}</Text>
                        ) : (
                          <>
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor: theme.referral.pendingBadge,
                                },
                              ]}
                            >
                              <Text variant="labelSm" style={{ color }}>
                                Pendiente
                              </Text>
                            </View>
                            <Text variant="labelSm" style={{ color, textAlign: 'right' }}>
                              {`${referralMoney(entry.amount, country)} que dejas de ganar`}
                            </Text>
                          </>
                        )}
                      </View>
                    </Reveal>
                  );
                })}
                <Reveal
                  play={reveal}
                  index={ledger!.entries.length}
                  style={[styles.total, { backgroundColor: theme.referral.cardSurface }]}
                >
                  <Text variant="titleSm">Total</Text>
                  <Text variant="title" style={{ color: theme.referral.sentInk }}>
                    {referralMoney(ledger!.total, country)}
                  </Text>
                </Reveal>
              </View>
            )}
            {ledger!.entries.some((entry) => !entry.paid) && (
              <Text variant="bodyMedium" style={styles.reminder}>
                Escríbeles a tus pendientes: con su primer pago, ganan los dos.
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {!!feedback && (
          <Text variant="bodySm" accessibilityLiveRegion="polite" style={styles.center}>
            {feedback}
          </Text>
        )}
        {pageIndicator}
        <Pressable
          accessibilityRole="button"
          onPress={onInvite}
          disabled={!config.active || !!error || !summary}
          style={({ pressed }) => [
            styles.invite,
            { opacity: !config.active || error || !summary ? 0.45 : pressed ? 0.75 : 1 },
          ]}
        >
          <WhatsAppIcon size={23} />
          <Text variant="button" style={{ color: '#FFFFFF' }}>
            Invitar a más amigos
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={copyLink}
          disabled={!config.active}
          style={styles.copy}
        >
          <ReferralIcon name="copy" color={theme.text.secondary} size={14} />
          <Text variant="body" color="secondary">
            Copiar mi link
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16, gap: 12 },
  center: { textAlign: 'center' },
  table: { borderWidth: 1, borderColor: '#EEEEF2', borderRadius: 20, overflow: 'hidden' },
  tableHeader: {
    backgroundColor: '#F6F6F8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 10,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  date: { width: 26, alignItems: 'center', gap: 3 },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  avatarHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  avatarBody: {
    width: 23,
    height: 13,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  friendText: { flex: 1, fontSize: 14, lineHeight: 18 },
  gain: { width: 90, alignItems: 'flex-end', gap: 3 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  total: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  reminder: { fontSize: 14, lineHeight: 17, textAlign: 'center', paddingHorizontal: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 5 },
  invite: {
    minHeight: 58,
    padding: 14,
    backgroundColor: '#25D366',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 20px #20CE6633',
  },
  copy: {
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24, padding: 20 },
  emptyArt: { alignItems: 'center', justifyContent: 'center', width: 210, height: 200 },
  phone: {
    position: 'absolute',
    right: 0,
    bottom: 24,
    width: 60,
    height: 92,
    borderWidth: 3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
  },
});
