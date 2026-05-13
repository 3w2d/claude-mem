import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager, StyleSheet, useColorScheme, View } from 'react-native';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { useAuth } from '../src/store/auth';

if (!I18nManager.isRTL) {
  try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider>
          <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
          <AuthGate />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const hydrated = useAuth(s => s.hydrated);
  const onboarded = useAuth(s => s.onboarded);
  const hydrate = useAuth(s => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !inOnboarding) router.replace('/onboarding');
    else if (onboarded && inOnboarding) router.replace('/(tabs)');
  }, [hydrated, onboarded, segments, router]);

  if (!hydrated) return <View style={styles.root} />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="calculator"    options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="editor"        options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ai"            options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="reports"       options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="search"        options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
