import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/components/ThemeProvider';
import { useAuth, specialtyLabel } from '../../src/store/auth';
import { FONT, RADIUS, SP } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function Settings() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const nationalId = useAuth(s => s.nationalId);
  const specialty = useAuth(s => s.specialty);
  const signOut = useAuth(s => s.signOut);

  const [codeAlerts, setCodeAlerts] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'en' | 'both'>('ar');

  const clearCache = async () => {
    const confirmMsg = 'سيتم مسح المحادثات والبيانات المؤقتة. متابعة؟';
    const run = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const toRemove = keys.filter(k =>
          k.startsWith('rk:chat:') ||
          k === 'rk:projects:state:cache' ||
          k.startsWith('cache:')
        );
        if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
        Platform.OS === 'web' ? window.alert('تم مسح الذاكرة المؤقتة') : Alert.alert('تم', 'تم مسح الذاكرة المؤقتة');
      } catch (e: any) {
        Platform.OS === 'web' ? window.alert('تعذّر المسح') : Alert.alert('خطأ', e?.message ?? '');
      }
    };
    if (Platform.OS === 'web') { if (window.confirm(confirmMsg)) run(); }
    else Alert.alert('مسح الذاكرة', confirmMsg, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'مسح', style: 'destructive', onPress: run },
    ]);
  };

  const onSignOut = async () => {
    const confirmMsg = 'هل تريد تسجيل الخروج؟ سيُمسح حسابك من الجهاز.';
    const run = async () => {
      await signOut();
      router.replace('/onboarding');
    };
    if (Platform.OS === 'web') { if (window.confirm(confirmMsg)) run(); }
    else Alert.alert('تسجيل الخروج', confirmMsg, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: run },
    ]);
  };

  const initial = (specialtyLabel(specialty) || '?').charAt(0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.panel }}>
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[12] }}>
        <Text style={[styles.h1, {
          color: theme.text.primary,
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }]}>الإعدادات</Text>

        {/* Profile card */}
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.profile,
            { backgroundColor: theme.bg.card, borderColor: theme.border.soft, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.gold.base }]}>
            <Text style={{
              fontSize: 24, fontWeight: '800', color: theme.text.inverse,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 17, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{specialtyLabel(specialty)}</Text>
            <Text style={{
              fontSize: 13, color: theme.text.muted, marginTop: 2, textAlign: 'right',
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>ID · {nationalId || '—'}</Text>
          </View>
          <Ionicons name="chevron-back" size={18} color={theme.text.muted} />
        </Pressable>

        {/* Group 1: Preferences */}
        <Group>
          <Row icon="notifications" tint="#fb8500" label="تنبيهات كود البناء"
            right={<IOSSwitch value={codeAlerts} onChange={setCodeAlerts} />} />
          <Divider />
          <Row
            icon="globe" tint="#3a78c4" label="لغة التقارير"
            right={
              <Text style={{
                fontSize: 14, color: theme.text.muted,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>
                {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'كلاهما'}
              </Text>
            }
            onPress={() => setLanguage(l => l === 'ar' ? 'en' : l === 'en' ? 'both' : 'ar')}
            chevron
          />
        </Group>

        {/* Group 2: Storage */}
        <Group>
          <Row icon="trash-bin" tint="#dc3a30" label="مسح الذاكرة المؤقتة"
            onPress={clearCache} chevron />
        </Group>

        {/* Group 3: About */}
        <Group>
          <Row icon="information-circle" tint="#6e6e73" label="الإصدار"
            right={<Text style={{
              fontSize: 14, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>0.4.0</Text>} />
          <Divider />
          <Row icon="shield-checkmark" tint="#1f9b6a" label="الكود المعتمد"
            right={<Text style={{
              fontSize: 14, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>SBC · ACI</Text>} />
        </Group>

        {/* Sign out */}
        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.signOut,
            {
              backgroundColor: theme.bg.card,
              borderColor: theme.border.soft,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{
            fontSize: 15, fontWeight: '700', color: theme.danger, textAlign: 'center',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>تسجيل الخروج</Text>
        </Pressable>

        <Text style={[styles.footer, { color: theme.text.muted, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          رَكيزة — Engineering Suite
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.group,
      { backgroundColor: theme.bg.card, borderColor: theme.border.soft },
    ]}>
      {children}
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border.soft, marginLeft: 52 }]} />;
}

function Row({
  icon, tint, label, right, onPress, chevron,
}: {
  icon: IconName;
  tint: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      <Text style={{
        flex: 1,
        fontSize: 15, color: theme.text.primary, textAlign: 'right',
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>{label}</Text>
      {right}
      {chevron && <Ionicons name="chevron-back" size={16} color={theme.text.muted} style={{ marginLeft: 4 }} />}
    </Pressable>
  );
}

function IOSSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: theme.border.strong, true: theme.gold.base }}
      thumbColor="#fff"
      ios_backgroundColor={theme.border.strong}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, textAlign: 'right', marginBottom: SP[4] },
  profile: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3],
    padding: SP[3],
    borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: SP[5],
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  group: {
    marginBottom: SP[5],
    borderRadius: RADIUS.lg, borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3],
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    minHeight: 48,
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 0.5 },
  signOut: {
    padding: SP[4], borderRadius: RADIUS.lg, borderWidth: 1,
    alignItems: 'center',
  },
  footer: {
    marginTop: SP[6], fontSize: 11, textAlign: 'center', letterSpacing: 0.6,
  },
});
