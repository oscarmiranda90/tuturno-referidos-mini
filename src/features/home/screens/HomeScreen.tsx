import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/ui/Button';
import { useAppearance, useTheme } from '../../../shared/theme/index';

/** Minimal host shell exposing both demo entry paths and appearance selection. */
export function HomeScreen({ onInvite, onReview }: { onInvite: () => void; onReview: () => void }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { appearance, toggleAppearance } = useAppearance();
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.surface.canvas, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Button
        testID="home-toggle-appearance"
        label={appearance === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        variant="secondary"
        onPress={toggleAppearance}
      />
      <Button
        testID="home-review-flow"
        label="Probar flujo de reseña"
        variant="secondary"
        onPress={onReview}
      />
      <Button label="Invitar" onPress={onInvite} />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, gap: 16 },
});
