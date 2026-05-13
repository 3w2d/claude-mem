import { View, Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeProvider';
import { FONT, SP } from '../theme';

export function RouteHeader({ title }: { title: string }) {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.bg.panel }}>
      <View style={[styles.bar, { borderBottomColor: theme.border.soft }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 6 }}>
          <Ionicons name="chevron-forward" size={22} color={theme.text.primary} />
        </Pressable>
        <Text style={{
          flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700',
          color: theme.text.primary,
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>{title}</Text>
        <View style={{ width: 34 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: SP[3], paddingVertical: SP[2], borderBottomWidth: 1 },
});
