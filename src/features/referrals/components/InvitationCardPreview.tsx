import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/index';
import type { ReferralUser } from '../domain/types';
import { InvitationCard } from './InvitationCard';
import { ReferralIcon } from './ReferralIcons';
import { Text } from '../../../shared/ui/Text';

/** Optional static enlargement; opening or closing it never starts sharing. */
export function InvitationCardPreview({
  user,
  visible,
  onClose,
}: {
  user: ReferralUser;
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!visible) {
      setReady(false);
      setFailed(false);
    }
  }, [visible]);
  const cardWidth = Math.max(
    1,
    Math.min(width - 24, ((height - insets.top - insets.bottom - 64) * 9) / 16),
  );
  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.root,
          {
            backgroundColor: theme.referral.canvas,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar tarjeta"
            onPress={onClose}
            style={[styles.close, { backgroundColor: theme.surface.inset }]}
          >
            <ReferralIcon name="close" color={theme.text.secondary} size={22} />
          </Pressable>
        </View>
        <View style={styles.art}>
          {!ready && !failed && (
            <ActivityIndicator color={theme.referral.promotion} style={StyleSheet.absoluteFill} />
          )}
          {failed && (
            <Text style={styles.error}>
              No pudimos cargar la tarjeta. Cierra e intenta de nuevo.
            </Text>
          )}
          <View style={{ opacity: ready && !failed ? 1 : 0 }}>
            <InvitationCard
              user={user}
              width={cardWidth}
              onReady={() => setReady(true)}
              onError={() => setFailed(true)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, paddingHorizontal: 16, alignItems: 'flex-end', justifyContent: 'center' },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { position: 'absolute', paddingHorizontal: 24, textAlign: 'center' },
});
