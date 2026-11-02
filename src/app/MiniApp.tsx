import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { ReferralsScreen } from '../features/referrals/screens/ReferralsScreen';
import { ReviewScreen } from '../features/referrals/screens/ReviewScreen';
import { requestNativeReview } from '../features/referrals/services/review';
import { reviewThenInvite } from '../features/referrals/domain/reviewSequence';
import { useReferrals } from '../features/referrals/state/ReferralProvider';
import type { User } from '../shared/models/types';
import { Text } from '../shared/ui/Text';
import { useTheme } from '../shared/theme/index';
import { entryFromUrl, type Entry } from './entry';

export function MiniApp() {
  const [entry, setEntry] = useState<Entry>(
    process.env.EXPO_PUBLIC_DEMO_ENTRY === 'review' ? 'review' : 'home',
  );
  const { state } = useReferrals();
  const theme = useTheme();
  const sample = state.users[0];
  const profile: User = {
    id: sample.id,
    firstName: sample.firstName,
    lastName: sample.lastName,
    initials: `${sample.firstName[0]}${sample.lastName[0]}`,
    collectedSanes: sample.collectedSanes,
    club: { points: { tier: sample.clubTier ?? 'bronce' } },
  };
  useEffect(() => {
    let active = true;
    const open = (url: string) => {
      const next = entryFromUrl(url);
      if (active && next) setEntry(next);
    };
    void Linking.getInitialURL()
      .then((url) => {
        if (url) open(url);
      })
      .catch(() => {});
    const subscription = Linking.addEventListener('url', ({ url }) => open(url));
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (entry !== 'native-review') return;
    let active = true;
    void reviewThenInvite(requestNativeReview, () => {
      if (active) setEntry('invite');
    });
    return () => {
      active = false;
    };
  }, [entry]);
  return (
    <View style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
      <StatusBar style="dark" />
      {entry === 'home' ? (
        <HomeScreen onInvite={() => setEntry('invite')} />
      ) : entry === 'review' ? (
        <ReviewScreen
          onDone={() => setEntry('invite')}
          onNativeReview={async () => setEntry('native-review')}
        />
      ) : entry === 'native-review' ? (
        <View style={styles.waiting}>
          <ActivityIndicator color={theme.referral.promotion} />
          <Text>Abriendo la solicitud de reseña…</Text>
        </View>
      ) : (
        <ReferralsScreen
          user={profile}
          initialPage={entry === 'referrals' ? 1 : 0}
          onClose={() => setEntry('home')}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
