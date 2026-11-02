import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { radius, spacing, useTheme } from '../../../shared/theme/index';
import { InvitePage, type InvitePageHandle } from '../components/InvitePage';
import { ReferralIcon } from '../components/ReferralIcons';
import { ReferralPage } from '../components/ReferralPage';
import {
  ReferralPageNavigation,
  type ReferralPageIndex,
} from '../components/ReferralPageNavigation';

/** One route owns the pager; each page owns its vertical scroll and actions. */
export function ReferralsScreen({
  initialPage = 0,
  mode = 'home',
  onClose,
  user,
}: {
  user: import('../../../shared/models/types').User;
  initialPage?: ReferralPageIndex;
  mode?: 'home' | 'post-review';
  onClose: () => void;
}) {
  const inviteOnly = mode === 'post-review';
  const reducedMotion = useReducedMotion();
  const invitation = useRef<InvitePageHandle>(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(width);
  const [selected, setSelected] = useState(initialPage);
  const selectedRef = useRef(initialPage);
  const initialPageRef = useRef(initialPage);
  const previousMode = useRef(mode);
  const currentPage = useSharedValue<number>(initialPage);
  // A page reveals its content as soon as the pager starts travelling towards
  // it, so the entrance is seen on the swipe instead of behind it.
  const [revealed, setRevealed] = useState<[boolean, boolean]>(() => [
    initialPage === 0,
    initialPage === 1,
  ]);
  const announced = useSharedValue<number>(initialPage === 0 ? 1 : 2);

  const markRevealed = (page: ReferralPageIndex) => {
    setRevealed((current) =>
      current[page] ? current : page === 0 ? [true, current[1]] : [current[0], true],
    );
  };

  const updateSelected = (page: ReferralPageIndex) => {
    selectedRef.current = page;
    setSelected(page);
  };
  // Keep the same page after rotation or a container-width change.
  useEffect(() => {
    if (initialPageRef.current !== initialPage || previousMode.current !== mode) {
      initialPageRef.current = initialPage;
      previousMode.current = mode;
      selectedRef.current = initialPage;
      setSelected(initialPage);
      currentPage.value = initialPage;
      announced.value |= initialPage === 0 ? 1 : 2;
      markRevealed(initialPage);
    }
    pager.current?.scrollTo({ x: selectedRef.current * pageWidth, animated: false });
  }, [pageWidth, initialPage, mode, currentPage, announced]);
  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) setPageWidth(nextWidth);
  };
  const onScroll = useAnimatedScrollHandler((event) => {
    const nextProgress = Math.max(0, Math.min(1, event.contentOffset.x / pageWidth));
    if (nextProgress > 0.04 && (announced.value & 2) === 0) {
      announced.value |= 2;
      scheduleOnRN(markRevealed, 1);
    }
    if (nextProgress < 0.96 && (announced.value & 1) === 0) {
      announced.value |= 1;
      scheduleOnRN(markRevealed, 0);
    }
    const nextPage = Math.round(nextProgress);
    if (currentPage.value !== nextPage) {
      currentPage.value = nextPage;
      scheduleOnRN(updateSelected, nextPage as ReferralPageIndex);
    }
  });

  const selectPage = (page: ReferralPageIndex) => {
    markRevealed(page);
    pager.current?.scrollTo({ x: page * pageWidth, animated: !reducedMotion });
  };
  const pageIndicator = (
    <ReferralPageNavigation variant="dots" page={selected} onSelect={selectPage} />
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.referral.canvas, paddingTop: insets.top }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, (inviteOnly || selected === 0) && styles.inviteHeader]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={inviteOnly || selected === 0 ? 'Cerrar' : 'Volver'}
          onPress={onClose}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: theme.surface.inset, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <ReferralIcon
            name={inviteOnly || selected === 0 ? 'close' : 'back'}
            color={theme.text.secondary}
            size={20}
          />
        </Pressable>
        {!inviteOnly && (
          <View style={styles.selector}>
            <ReferralPageNavigation variant="chips" page={selected} onSelect={selectPage} />
          </View>
        )}
      </View>
      {inviteOnly ? (
        <View style={styles.pager}>
          <InvitePage profile={user} active reveal />
        </View>
      ) : (
        <View style={styles.pager} onLayout={onLayout}>
          <Animated.ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            directionalLockEnabled
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={styles.pages}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.pager}
          >
            <View
              style={[styles.page, { width: pageWidth }]}
              accessibilityElementsHidden={selected !== 0}
              importantForAccessibility={selected === 0 ? 'auto' : 'no-hide-descendants'}
              aria-hidden={selected !== 0}
            >
              <InvitePage
                ref={invitation}
                profile={user}
                pageIndicator={pageIndicator}
                active={selected === 0}
                reveal={revealed[0]}
              />
            </View>
            <View
              style={[styles.page, { width: pageWidth }]}
              accessibilityElementsHidden={selected !== 1}
              importantForAccessibility={selected === 1 ? 'auto' : 'no-hide-descendants'}
              aria-hidden={selected !== 1}
            >
              <ReferralPage
                pageIndicator={pageIndicator}
                reveal={revealed[1]}
                onInvite={() => {
                  void invitation.current?.share();
                }}
              />
            </View>
          </Animated.ScrollView>
        </View>
      )}
      <View style={{ paddingBottom: insets.bottom, backgroundColor: theme.referral.canvas }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  inviteHeader: { justifyContent: 'flex-end' },
  selector: {
    position: 'absolute',
    left: 72,
    right: 72,
    top: 8,
    bottom: 4,
    justifyContent: 'center',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: { flex: 1 },
  pages: { height: '100%' },
  page: { height: '100%' },
});
