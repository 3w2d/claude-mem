import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useStore } from '../../src/store/projects';
import { Card } from '../../src/components/Card';
import { ProjectCard } from '../../src/components/ProjectCard';
import { theme } from '../../src/theme';
import { aggregate } from '../../src/lib/insights';
import { computeBoq, fmtSAR } from '../../src/lib/boq';
import { arabicDay } from '../../src/lib/date';

export default function Home() {
  const router = useRouter();
  const projects = useStore(s => s.projects);
  const logs = useStore(s => s.logs);
  const pricing = useStore(s => s.settings.pricing);
  const hydrated = useStore(s => s.hydrated);
  const visible = projects.filter(p => !p.archived);

  const agg = useMemo(() => aggregate(visible, logs), [visible, logs]);
  const totals = useMemo(() => visible.reduce((acc, p) => {
    const b = computeBoq(p, pricing);
    acc.cost += b.cost; acc.concrete += b.totalConcrete; acc.steel += b.steel;
    return acc;
  }, { cost: 0, concrete: 0, steel: 0 }), [visible, pricing]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>أهلاً بك في رَكيزة</Text>
              <Text style={styles.day}>{arabicDay()} · المشاريع النشطة {visible.length}</Text>
            </View>
            <Pressable style={styles.add} onPress={() => router.push('/new')}>
              <Text style={styles.addText}>+</Text>
            </Pressable>
          </View>

          {hydrated && visible.length > 0 && (
            <Card style={styles.summary}>
              <View style={styles.summaryRow}>
                <SummaryStat label="اليوم" value={`${agg.todayDone}/${visible.length}`} accent={theme.accent.blue} />
                <SummaryStat label="هذا الأسبوع" value={`${Math.round(agg.rate7 * 100)}٪`} accent={theme.accent.cyan} />
                <SummaryStat label="آخر ٣٠ يوم" value={`${Math.round(agg.rate30 * 100)}٪`} accent={theme.accent.green} />
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <SummaryStat label="إجمالي الخرسانة" value={`${totals.concrete.toFixed(1)} م³`} />
                <SummaryStat label="إجمالي الحديد" value={`${totals.steel.toFixed(1)} طن`} />
              </View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.bigLabel}>إجمالي تكلفة المحفظة</Text>
                  <Text style={styles.bigValue}>{fmtSAR(totals.cost)} <Text style={styles.bigUnit}>SAR</Text></Text>
                </View>
              </View>
              <View style={styles.spark}>
                {agg.perDay.slice().reverse().map(d => (
                  <View key={d.day} style={styles.sparkColWrap}>
                    <View style={[styles.sparkBar, { height: 6 + d.done * 6, backgroundColor: d.done ? theme.accent.blue : theme.border.light }]} />
                  </View>
                ))}
              </View>
            </Card>
          )}

          {!hydrated && <Text style={styles.loading}>جارٍ التحميل…</Text>}

          {hydrated && visible.length === 0 && (
            <Card style={{ alignItems: 'center', padding: 28 }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🏗️</Text>
              <Text style={styles.emptyTitle}>ابدأ مشروعك الأول</Text>
              <Text style={styles.emptyBody}>أنشئ مشروعاً، ارسم المخطط، احصل على الكميات والتكلفة فوراً.</Text>
              <Pressable style={styles.cta} onPress={() => router.push('/new')}>
                <Text style={styles.ctaText}>إنشاء مشروع</Text>
              </Pressable>
            </Card>
          )}

          <View style={{ height: 14 }} />
          {visible.map(p => <ProjectCard key={p.id} p={p} logs={logs} />)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  greeting: { color: theme.text.primary, fontSize: 24, fontWeight: '800' },
  day: { color: theme.text.secondary, fontSize: 13, marginTop: 4 },
  add: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.accent.blue, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 30 },

  summary: { marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statValue: { color: theme.text.primary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: theme.text.muted, fontSize: 11, marginTop: 4 },
  divider: { height: 1, backgroundColor: theme.border.light, marginVertical: 12 },
  bigLabel: { color: theme.text.muted, fontSize: 12 },
  bigValue: { color: theme.accent.blue, fontSize: 28, fontWeight: '900', marginTop: 4 },
  bigUnit: { fontSize: 14, color: theme.accent.blue, fontWeight: '600' },
  spark: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, height: 14, gap: 4 },
  sparkColWrap: { flex: 1, alignItems: 'center' },
  sparkBar: { width: '90%', borderRadius: 3 },

  loading: { color: theme.text.muted, textAlign: 'center', marginTop: 30 },
  emptyTitle: { color: theme.text.primary, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: theme.text.secondary, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  cta: { backgroundColor: theme.accent.blue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, marginTop: 18 },
  ctaText: { color: '#fff', fontWeight: '700' },
});
