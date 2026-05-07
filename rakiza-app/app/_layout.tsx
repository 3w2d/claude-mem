import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import { useStore } from '../src/store/projects';
import { ensurePermission } from '../src/lib/notifications';
import { theme } from '../src/theme';

if (!I18nManager.isRTL) {
  try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
}

export default function RootLayout() {
  const hydrate = useStore(s => s.hydrate);
  useEffect(() => {
    hydrate();
    ensurePermission().catch(() => {});
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg.base },
        animation: 'fade',
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="project/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
});
