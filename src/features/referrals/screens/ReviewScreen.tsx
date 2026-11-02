import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../../../shared/theme/index';
import { Button } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';

/** Deterministic demo of the store interaction; never publishes a rating. */
export function ReviewScreen({
  onDone,
  onNativeReview,
}: {
  onDone: () => void;
  onNativeReview: () => Promise<void>;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  return (
    <ScrollView
      style={{ backgroundColor: theme.surface.canvas }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text variant="title">Simulación de reseña</Text>
      <Text variant="body" color="secondary">
        Toca las estrellas para probar. Esta calificación es de demostración y no se publica.
      </Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={value === 1 ? '1 estrella' : `${value} estrellas`}
            accessibilityState={{ checked: rating === value }}
            onPress={() => setRating(value)}
            style={({ pressed }) => [styles.star, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Svg width={32} height={32} viewBox="0 0 24 24" accessible={false}>
              <Path
                d="M12 3l2.8 5.7 6.3.9-4.55 4.44 1.07 6.26L12 17.34 6.38 20.3l1.07-6.26L2.9 9.6l6.3-.9L12 3z"
                fill={value <= rating ? theme.status.machine : 'none'}
                stroke={theme.status.machineInk}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ))}
      </View>
      <Text variant="bodySm" color="secondary" accessibilityLiveRegion="polite">
        {rating === 0 ? 'Elige de 1 a 5 estrellas' : `${rating} de 5 estrellas`}
      </Text>
      <Button label="Simular envío de reseña" disabled={rating === 0} onPress={onDone} />
      <Button label="Omitir reseña" variant="secondary" onPress={onDone} />
      <Button
        label="Intentar reseña nativa"
        variant="secondary"
        onPress={() => {
          void onNativeReview();
        }}
      />
      <Text variant="bodySm" color="secondary">
        El diálogo nativo depende de la tienda y puede no aparecer. Después continuarás a la
        invitación.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  star: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
