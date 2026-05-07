import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Project, WorkLog } from '../types';
import { CATEGORIES } from '../types';
import { theme } from '../theme';
import { Card } from './Card';
import { StreakRing } from './StreakRing';
import { CompleteToggle } from './CompleteToggle';
import { useStore } from '../store/projects';
import { isLoggedToday, streakFor } from '../lib/streak';
import { computeBoq, fmtSAR } from '../lib/boq';

export function ProjectCard({ p, logs }: { p: Project; logs: WorkLog[] }) {
  const router = useRouter();
  const log = useStore(s => s.logWork);
  const unlog = useStore(s => s.unlogToday);
  const pricing = useStore(s => s.settings.pricing);
  const stats = streakFor(p, logs);
  const done = isLoggedToday(logs, p.id);
  const boq = computeBoq(p, pricing);
  const cat = CATEGORIES[p.category];

  return (
    <Pressable onPress={() => router.push(`/project/${p.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.iconWrap, { backgroundColor: p.color + '15', borderColor: p.color + '40' }]}>
              <Text style={styles.emoji}>{p.emoji || cat.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginInlineStart: 12 }}>
              <Text style={styles.title} numberOfLines={1}>{p.name}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.tag, { backgroundColor: p.color + '12', borderColor: p.color + '30' }]}>
                  <Text style={[styles.tagText, { color: p.color }]}>{cat.label}</Text>
                </View>
                <Text style={styles.meta}>· {p.floors.length} {p.floors.length === 1 ? 'دور' : 'أدوار'}</Text>
                <Text style={styles.meta}>· 🔥 {stats.current}</Text>
              </View>
            </View>
          </View>
          <CompleteToggle
            done={done}
            color={p.color}
            onToggle={() => done ? unlog(p.id) : log(p.id)}
          />
        </View>
        <View style={styles.bottomRow}>
          <StreakRing stats={stats} rate={stats.rate7} size={62} projectColor={p.color} />
          <View style={{ flex: 1, marginInlineStart: 12 }}>
            <View style={styles.statRow}>
              <Stat label="خرسانة" value={`${boq.totalConcrete.toFixed(1)} م³`} />
              <Stat label="حديد" value={`${boq.steel.toFixed(2)} طن`} />
            </View>
            <View style={[styles.statRow, { marginTop: 8 }]}>
              <Stat label="أعمدة" value={`${boq.colCount}`} />
              <Stat label="التكلفة" value={`${fmtSAR(boq.cost)} SAR`} accent={p.color} />
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${stats.rate30 * 100}%`, backgroundColor: p.color }]} />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingInlineEnd: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emoji: { fontSize: 22 },
  title: { color: theme.text.primary, fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  meta: { color: theme.text.muted, fontSize: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  statRow: { flexDirection: 'row', gap: 12 },
  statLabel: { color: theme.text.muted, fontSize: 11 },
  statValue: { color: theme.text.primary, fontSize: 14, fontWeight: '700', marginTop: 1 },
  bar: { height: 5, marginTop: 10, backgroundColor: theme.border.light, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },
});
