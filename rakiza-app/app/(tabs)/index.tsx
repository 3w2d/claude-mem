import { View, ScrollView, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { HomeHeader } from '../../src/components/HomeHeader';
import { Card } from '../../src/components/primitives';
import { FONT, RADIUS, SP } from '../../src/theme';
import { useStore } from '../../src/store/projects';
import { useAuth, specialtyLabel, type Specialty } from '../../src/store/auth';
import { fmt, fmtCompact } from '../../src/lib/format';
import { useMemo } from 'react';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Route = '/calculator' | '/editor' | '/ai' | '/reports';

interface TaskCard {
  icon: IconName;
  label: string;
  hint?: string;
  route: Route;
}

const ROLE_TASKS: Record<Specialty, TaskCard[]> = {
  project_manager: [
    { icon: 'briefcase',           label: 'نظرة عامة على المشاريع', hint: 'الحالة والتكاليف', route: '/reports' },
    { icon: 'document-text',       label: 'اعتماد تقارير NCR',      hint: 'مراجعة وقبول', route: '/reports' },
    { icon: 'people',              label: 'متابعة الطاقم',          hint: 'الإنتاجية والمهام', route: '/reports' },
  ],
  civil_engineer: [
    { icon: 'library',             label: 'مراجعة ACI 318 / SBC 304', hint: 'بنود الكود', route: '/ai' },
    { icon: 'grid',                label: 'تحليل المخططات الإنشائية', hint: 'محرّر تفاعلي', route: '/editor' },
    { icon: 'calculator',          label: 'حساب الكميات والتكلفة',    hint: 'تقدير سريع', route: '/calculator' },
  ],
  electrical_tech: [
    { icon: 'flash',               label: 'مراجعة كود SBC 400',       hint: 'الأحمال والحماية', route: '/ai' },
    { icon: 'git-network',         label: 'مخططات التوزيع الكهربائية', hint: 'مسارات الدوائر', route: '/editor' },
    { icon: 'speedometer',         label: 'حسابات الأحمال',           hint: 'تقدير الجهد والتيار', route: '/calculator' },
  ],
  mechanical_plumbing_tech: [
    { icon: 'water',               label: 'مراجعة كود SBC 701 (سباكة)',     hint: 'تمديدات المياه والصرف', route: '/ai' },
    { icon: 'thermometer',         label: 'مراجعة كود SBC 501 (ميكانيكا)',  hint: 'HVAC والتهوية', route: '/ai' },
    { icon: 'construct',           label: 'مخططات التمديدات',                hint: 'محرّر تفاعلي', route: '/editor' },
  ],
};

const FALLBACK_TASKS: TaskCard[] = [
  { icon: 'calculator',           label: 'الحاسبة الإنشائية', route: '/calculator' },
  { icon: 'grid',                 label: 'المحرّر',            route: '/editor' },
  { icon: 'chatbubble-ellipses',  label: 'مساعد AI',           route: '/ai' },
  { icon: 'analytics',            label: 'التقارير',           route: '/reports' },
];

export default function Home() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const projects = useStore(s => s.projects);
  const specialty = useAuth(s => s.specialty);
  const nationalId = useAuth(s => s.nationalId);

  const totals = useMemo(() => projects.reduce((a, p) => {
    if (!p.results) return a;
    a.cost += p.results.cost.total;
    a.concrete += p.results.totalConcrete;
    return a;
  }, { cost: 0, concrete: 0 }), [projects]);

  const tasks = specialty ? ROLE_TASKS[specialty] : FALLBACK_TASKS;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.bg.panel }}>
        <HomeHeader />
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        <Text style={[styles.greet, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          أهلاً بك
        </Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {specialty && (
            <View style={[
              styles.roleBadge,
              { backgroundColor: theme.gold.soft, borderColor: theme.border.gold },
            ]}>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: theme.gold.base,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>{specialtyLabel(specialty)}</Text>
            </View>
          )}
          {nationalId && (
            <Text style={{
              fontSize: 11, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{nationalId}</Text>
          )}
        </View>

        <Card style={{ marginTop: SP[5], padding: SP[5] }}>
          <Text style={[styles.k, { color: theme.text.muted }]}>محفظة المشاريع</Text>
          <View style={{ flexDirection: 'row-reverse', gap: SP[4], marginTop: 6 }}>
            <Stat label="إجمالي التكلفة" value={fmtCompact(totals.cost)} unit="ر.س" />
            <Stat label="الخرسانة"      value={fmt(totals.concrete, 1)} unit="م³" />
            <Stat label="المشاريع"      value={String(projects.length)} unit="" />
          </View>
        </Card>

        <Text style={[styles.section, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          {specialty ? 'مهام مخصّصة لتخصصك' : 'الأدوات'}
        </Text>

        <View style={styles.grid}>
          {tasks.map((q, i) => (
            <Pressable
              key={`${q.route}-${i}`}
              onPress={() => router.push(q.route)}
              style={({ pressed }) => [
                styles.quick,
                {
                  backgroundColor: theme.bg.card,
                  borderColor: pressed ? theme.gold.base : theme.border.soft,
                },
              ]}
            >
              <View style={[
                styles.quickIcon,
                { backgroundColor: theme.gold.soft, borderColor: theme.border.gold },
              ]}>
                <Ionicons name={q.icon} size={22} color={theme.gold.base} />
              </View>
              <Text
                style={[styles.quickLabel, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}
                numberOfLines={2}
              >
                {q.label}
              </Text>
              {q.hint && (
                <Text
                  style={[styles.quickHint, { color: theme.text.muted, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}
                  numberOfLines={1}
                >
                  {q.hint}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Always-available tools beneath */}
        {specialty && (
          <>
            <Text style={[styles.section, { color: theme.text.muted, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
              أدوات عامة
            </Text>
            <View style={[styles.grid]}>
              {FALLBACK_TASKS.map(q => (
                <Pressable
                  key={q.route + '-fb'}
                  onPress={() => router.push(q.route)}
                  style={({ pressed }) => [
                    styles.quickSlim,
                    {
                      backgroundColor: theme.bg.card,
                      borderColor: pressed ? theme.gold.base : theme.border.soft,
                    },
                  ]}
                >
                  <Ionicons name={q.icon} size={18} color={theme.gold.base} />
                  <Text style={[
                    styles.quickSlimLabel,
                    { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined },
                  ]} numberOfLines={1}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
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
        <Text style={{
          fontSize: 18, fontWeight: '700', color: theme.gold.base,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{value}</Text>
        {unit ? <Text style={{
          fontSize: 10, color: theme.text.muted,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: RADIUS.pill, borderWidth: 1,
  },
  k: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
  section: {
    fontSize: 11, letterSpacing: 1.2, marginTop: SP[6], marginBottom: SP[3],
    textAlign: 'right', textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[3] },
  quick: {
    width: '47%',
    padding: SP[4],
    borderRadius: RADIUS.lg, borderWidth: 1,
    alignItems: 'flex-end', gap: 8,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  quickLabel: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  quickHint: { fontSize: 11, textAlign: 'right' },
  quickSlim: {
    width: '47%',
    paddingHorizontal: SP[3], paddingVertical: SP[3],
    borderRadius: RADIUS.md, borderWidth: 1,
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
  },
  quickSlimLabel: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
