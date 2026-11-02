import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/ui/Button';
import { useTheme } from '../../../shared/theme/index';

/** Minimal host shell: the only Home action opens the invitation. */
export function HomeScreen({ onInvite }: { onInvite: () => void }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.surface.canvas, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Button label="Invitar" onPress={onInvite} />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
});
