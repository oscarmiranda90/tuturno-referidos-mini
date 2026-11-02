import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReferralProvider } from '../features/referrals/state/ReferralProvider';
import { CountryProvider } from '../shared/country/CountryProvider';
import { ThemeProvider, useTheme } from '../shared/theme/index';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CountryProvider>
        <ReferralProvider>
          <AppFrame>{children}</AppFrame>
        </ReferralProvider>
      </CountryProvider>
    </ThemeProvider>
  );
}

function AppFrame({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {fontsLoaded ? (
          children
        ) : (
          <View style={[styles.loading, { backgroundColor: theme.surface.canvas }]}>
            <ActivityIndicator color={theme.action.primary} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
