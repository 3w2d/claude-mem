import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useStore } from '../../src/store/projects';
import { Card } from '../../src/components/Card';
import { Heatmap } from '../../src/components/Heatmap';
import { theme } from '../../src/theme';
import { aggregate, heatmap, weeklyRates } from '../../src/lib/insights';
import { computeBoq, fmtSAR } from '../../src/lib/boq';
import { streakFor } from '../../src/lib/streak';

export default function Analytics() {
  const projects = useStore(s => s.projects);
  const logs = useStore(s => s.logs);
  const pricing = useStore(s => s.settings.pricing);
  const weekStart = useStore(s => s.settings.weekStart);
  const visible = projects.filter(p => !p.archived);
  const agg = useMemo(() => aggregate(visible, logs), [visible, logs]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          <Text style={styles.h1}>التحليلات</Text>
          <Text style={styles.sub}>متابعة تقدمك على كل المشاريع</Text>

          <Card style={styles.summary}>
            <View style={styles.row}>
              <Stat label="هذا الأسبوع" value={`${Math.round(agg.rate7 * 100)}٪`} accent={theme.accent.blue} />
              <Stat label="هذا الشهر" value={`${Math.round(agg.rate30 * 100)}٪`} accent={theme.accent.cyan} />
              <Stat label="مشاريع نشطة" value={`${visible.length}`} accent={theme.accent.green} />
            </View>
          </Card>

          {visible.map(p => {
            const stats = streakFor(p, logs);
            const points = weeklyRates(p, logs, weekStart);
            const cells = heatmap(p, logs);
            const boq = computeBoq(p, pricing);
            return (
              <Card key={p.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={[styles.dot, { backgroundColor: p.color }]} />
                  <Text style={styles.cardTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.cardMeta}>🔥 {stats.current} · أطول {stats.longest}</Text>
                </View>

                <Text style={styles.section}>أسبوعياً (آخر ٨ أسابيع)</Text>
                <View style={styles.bars}>
                  {points.map((pt, i) => (
                    <View key={i} style={styles.barCol}>
                      <View style={[styles.barTrack]}>
                        <View style={[styles.barFill, { height: `${Math.max(8, pt.value * 100)}%`, backgroundColor: p.color }]} />
                      </View>
                      <Text style={styles.barLabel}>{pt.label}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.section, { marginTop: 16 }]}>خريطة النشاط (آخر ١٢ أسبوع)</Text>
                <Heatmap data={cells} color={p.color} />

                <View style={styles.boqRow}>
                  <Stat label="خرسانة" value={`${boq.totalConcrete.toFixed(1)} م³`} />
                  <Stat label="حديد" value={`${boq.steel.toFixed(2)} طن`} />
                  <Stat label="التكلفة" value={`${fmtSAR(boq.cost)}`} accent={p.color} />
                </View>
              </Card>
            );
          })}

          {visible.length === 0 && (
            <Card style={{ padding: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>📊</Text>
              <Text style={styles.h1}>لا توجد بيانات بعد</Text>
              <Text style={styles.sub}>أنشئ مشروعاً وابدأ تسجيل تقدّمك اليومي.</Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[styles.statV, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  h1: { color: theme.text.primary, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.text.secondary, fontSize: 13, marginTop: 4, marginBottom: 18 },
  summary: { marginBottom: 14 },
  row: { flexDirection: 'row' },
  statV: { color: theme.text.primary, fontSize: 22, fontWeight: '800' },
  statL: { color: theme.text.muted, fontSize: 11, marginTop: 4 },
  card: { marginBottom: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { flex: 1, color: theme.text.primary, fontSize: 16, fontWeight: '700' },
  cardMeta: { color: theme.text.muted, fontSize: 12 },
  section: { color: theme.text.secondary, fontSize: 12, marginBottom: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', height: 60, justifyContent: 'flex-end', backgroundColor: theme.border.light, borderRadius: 4, overflow: 'hidden' },
  barFill: { width: '100%' },
  barLabel: { color: theme.text.muted, fontSize: 9, marginTop: 4 },
  boqRow: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border.light },
});
