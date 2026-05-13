import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager, StyleSheet, useColorScheme } from 'react-native';
import { ThemeProvider } from '../src/components/ThemeProvider';

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
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="calculator" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="editor" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="ai" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="reports" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="search" options={{ presentation: 'modal' }} />
            <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
