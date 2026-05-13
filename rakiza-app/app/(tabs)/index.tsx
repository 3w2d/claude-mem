import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { HomeHeader } from '../../src/components/HomeHeader';
import { Card } from '../../src/components/primitives';
import { FONT, RADIUS, SP } from '../../src/theme';
import { useStore } from '../../src/store/projects';
import { fmt, fmtCompact } from '../../src/lib/format';
import { useMemo } from 'react';

type Quick = { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; route: '/calculator' | '/editor' | '/ai' | '/reports' };

const QUICK: Quick[] = [
  { icon: 'calculator',        label: 'الحاسبة الإنشائية', route: '/calculator' },
  { icon: 'grid',              label: 'المحرّر',           route: '/editor' },
  { icon: 'chatbubble-ellipses', label: 'مساعد AI',        route: '/ai' },
  { icon: 'analytics',         label: 'التقارير',          route: '/reports' },
];

export default function Home() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const projects = useStore(s => s.projects);

  const totals = useMemo(() => projects.reduce((a, p) => {
    if (!p.results) return a;
    a.cost += p.results.cost.total;
    a.concrete += p.results.totalConcrete;
    return a;
  }, { cost: 0, concrete: 0 }), [projects]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.bg.panel }}>
        <HomeHeader />
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        <Text style={[styles.greet, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          أهلاً بك
        </Text>
        <Text style={[styles.sub, { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          ابدأ مشروعاً أو ادخل لأحد الأدوات
        </Text>

        <Card style={{ marginTop: SP[5], padding: SP[5] }}>
          <Text style={[styles.k, { color: theme.text.muted }]}>محفظة المشاريع</Text>
          <View style={{ flexDirection: 'row-reverse', gap: SP[4], marginTop: 6 }}>
            <Stat label="إجمالي التكلفة" value={fmtCompact(totals.cost)} unit="ر.س" />
            <Stat label="الخرسانة"      value={fmt(totals.concrete, 1)} unit="م³" />
            <Stat label="المشاريع"      value={String(projects.length)} unit="" />
          </View>
        </Card>

        <Text style={[styles.section, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          الأدوات
        </Text>
        <View style={styles.grid}>
          {QUICK.map(q => (
            <Pressable
              key={q.route}
              onPress={() => router.push(q.route)}
              style={({ pressed }) => [
                styles.quick,
                {
                  backgroundColor: theme.bg.card,
                  borderColor: pressed ? theme.gold.base : theme.border.soft,
                },
              ]}
            >
              <View style={[styles.quickIcon, { backgroundColor: theme.gold.soft, borderColor: theme.border.gold }]}>
                <Ionicons name={q.icon} size={22} color={theme.gold.base} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.k, { color: theme.text.muted }]}>{label}</Text>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }}>
          {value}
        </Text>
        {unit ? <Text style={{ fontSize: 10, color: theme.text.muted, fontFamily: fontsLoaded ? FONT.mono : undefined }}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  sub: { fontSize: 13, marginTop: 4, textAlign: 'right' },
  k: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
  section: { fontSize: 11, letterSpacing: 1.2, marginTop: SP[6], marginBottom: SP[3], textAlign: 'right', textTransform: 'uppercase' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[3] },
  quick: {
    width: '47%',
    padding: SP[4],
    borderRadius: RADIUS.lg, borderWidth: 1,
    alignItems: 'flex-end', gap: 10,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  quickLabel: { fontSize: 14, fontWeight: '600' },
});
