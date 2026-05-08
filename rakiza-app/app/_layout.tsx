import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../src/components/ThemeProvider';

if (!I18nManager.isRTL) {
  try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function ThemedStack() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg.base },
        animation: 'fade',
      }} />
    </>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
