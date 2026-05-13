import { View, Pressable, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';

export function HomeHeader() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      const msg = 'يحتاج التطبيق صلاحية الكاميرا.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('تنبيه', msg);
      return;
    }
    await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85 });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg.panel, borderBottomColor: theme.border.soft }]}>
      <Text style={[styles.title, {
        color: theme.gold.base,
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }]}>رَكيزة</Text>
      <View style={styles.actions}>
        <IconBtn icon="camera" onPress={openCamera} theme={theme} />
        <IconBtn icon="search" onPress={() => router.push('/search')} theme={theme} />
        <IconBtn icon="notifications" onPress={() => router.push('/notifications')} theme={theme} badge />
      </View>
    </View>
  );
}

function IconBtn({ icon, onPress, theme, badge }: {
  icon: 'camera' | 'search' | 'notifications';
  onPress: () => void; theme: any; badge?: boolean;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        { backgroundColor: theme.bg.card, borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={theme.text.primary} />
      {badge && (
        <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.bg.panel }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  actions: { flexDirection: 'row-reverse', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, borderWidth: 1.5,
  },
});
